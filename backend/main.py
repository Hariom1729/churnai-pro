from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import json
import asyncio
from pydantic import BaseModel
from automl import run_automl_pipeline
from database import engine, Base
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from dependencies import get_current_user

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ChurnAI Pro",
    description="Production-grade AI SaaS Platform for Churn Prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to ChurnAI Pro API"}

@app.get("/api/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/api/projects", response_model=list[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Project).filter(models.Project.user_id == current_user.id).all()

@app.post("/api/projects", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_project = models.Project(
        project_name=project.project_name,
        user_id=current_user.id
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

from fastapi import File, UploadFile, HTTPException
import shutil
import os

os.makedirs("uploads", exist_ok=True)

@app.post("/api/projects/{project_id}/upload")
def upload_dataset(project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    file_location = f"uploads/project_{project_id}_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    project.dataset_name = file.filename
    db.commit()
    
    return {"info": f"file '{file.filename}' saved at '{file_location}'"}

@app.get("/api/projects/{project_id}/columns")
def get_dataset_columns(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user.id).first()
    if not project or not project.dataset_name:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    file_location = f"uploads/project_{project_id}_{project.dataset_name}"
    import pandas as pd
    try:
        df = pd.read_csv(file_location, nrows=0) # Only read the header to save memory
        return {"columns": list(df.columns)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}/data")
def get_dataset_data(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user.id).first()
    if not project or not project.dataset_name:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    file_location = f"uploads/project_{project_id}_{project.dataset_name}"
    import pandas as pd
    try:
        # Limit to 5000 rows to prevent overwhelming the browser
        df = pd.read_csv(file_location, nrows=5000)
        # Replace NaN with None so it becomes valid JSON null
        df = df.replace({pd.NA: None, pd.NaT: None, float('nan'): None})
        return {"data": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- WebSockets for Training Progress ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, project_id: int):
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)

    def disconnect(self, websocket: WebSocket, project_id: int):
        if project_id in self.active_connections:
            self.active_connections[project_id].remove(websocket)

    async def send_progress(self, project_id: int, message: dict):
        if project_id in self.active_connections:
            for connection in self.active_connections[project_id]:
                await connection.send_text(json.dumps(message))

manager = ConnectionManager()

@app.websocket("/ws/train-progress/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: int):
    await manager.connect(websocket, project_id)
    try:
        while True:
            await websocket.receive_text() # Just keep connection open
    except WebSocketDisconnect:
        manager.disconnect(websocket, project_id)

class TrainRequest(BaseModel):
    target_column: str

@app.post("/api/projects/{project_id}/train")
async def start_training(project_id: int, request: TrainRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not project.dataset_name:
        raise HTTPException(status_code=400, detail="No dataset uploaded for this project")

    # Start AutoML pipeline in background
    project.target_column = request.target_column
    db.commit()
    
    background_tasks.add_task(
        run_automl_pipeline,
        project_id,
        project.dataset_name,
        request.target_column,
        manager.send_progress
    )

    return {"message": "Training started"}

@app.get("/api/projects/{project_id}/models", response_model=list[schemas.ModelResponse])
def get_project_models(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify ownership
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    project_models = db.query(models.Model).filter(models.Model.project_id == project_id).all()
    return project_models

@app.get("/api/projects/{project_id}/shap")
def get_project_shap_values(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify ownership
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not project.shap_values:
        return {"shap_values": None}
        
    import json
    try:
        shap_data = json.loads(project.shap_values)
        return {"shap_values": shap_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse SHAP values")

class PredictRowRequest(BaseModel):
    row_data: dict
    target_column: str

@app.post("/api/projects/{project_id}/predict_row")
async def api_predict_row(project_id: int, request: PredictRowRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user.id).first()
    if not project or not project.dataset_name:
        raise HTTPException(status_code=404, detail="Project or dataset not found")
        
    from automl import predict_single_row
    try:
        result = await predict_single_row(
            project_id=project_id, 
            dataset_name=project.dataset_name, 
            target_column=request.target_column,
            row_data=request.row_data
        )
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}/clusters")
def get_project_clusters(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    cluster_file = f"saved_models/project_{project_id}_clusters.json"
    import os
    if not os.path.exists(cluster_file):
        return {"clusters": []}
        
    import json
    try:
        with open(cluster_file, "r") as f:
            clusters = json.load(f)
        return {"clusters": clusters}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load clusters")

@app.get("/api/projects/{project_id}/recommendations")
def get_project_recommendations(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not project.shap_values:
        return {"recommendations": []}
        
    import json
    import os
    
    try:
        import google.generativeai as genai
        from dotenv import load_dotenv
        
        load_dotenv()

        
        # Configure Gemini with the user-provided API key from environment
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            # Fallback to static if the API key is not set
            raise Exception("GEMINI_API_KEY environment variable not set")
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        shap_data = json.loads(project.shap_values)
        top_features = list(shap_data.keys())[:3]
        
        recs = []
        
        # Instead of static heuristics, we prompt Gemini for strategic recommendations
        prompt = f"""
You are an expert AI business strategist analyzing customer churn.
The top 3 features driving churn for this dataset are: {', '.join(top_features)}.
For each feature, provide a 1-2 sentence actionable business strategy on how to optimize it to reduce churn.
Format the output EXACTLY as a JSON array of objects, where each object has:
- "feature": the exact name of the feature
- "action": the actionable strategy text
No markdown blocks, just raw JSON.
        """
        
        response = model.generate_content(prompt)
        # Parse the JSON response
        try:
            # Strip out markdown formatting if any was included accidentally
            text = response.text.strip()
            if text.startswith('```json'):
                text = text[7:]
            if text.startswith('```'):
                text = text[3:]
            if text.endswith('```'):
                text = text[:-3]
                
            dynamic_recs = json.loads(text.strip())
            return {"recommendations": dynamic_recs}
        except Exception as e:
            print("Failed to parse Gemini response:", e, "Raw:", response.text)
            # Fallback to generic if parsing fails
            for feat in top_features:
                recs.append({
                    "feature": feat, 
                    "action": f"The feature '{feat}' is a primary driver of churn. We recommend auditing this segment closely to identify friction points."
                })
            return {"recommendations": recs}
            
    except Exception as e:
        print("Gemini API Error:", e)
        # Fallback to static if the API call fails
        shap_data = json.loads(project.shap_values)
        top_features = list(shap_data.keys())[:3]
        recs = []
        for feat in top_features:
            recs.append({
                "feature": feat, 
                "action": f"The feature '{feat}' is a primary driver of churn. We recommend auditing this segment closely to identify friction points."
            })
        return {"recommendations": recs}

@app.get("/api/projects/{project_id}/export")
def export_predictions(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    from fastapi.responses import FileResponse
    import os
    import pandas as pd
    import joblib
    from sklearn.impute import SimpleImputer
    from sklearn.preprocessing import StandardScaler
    
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user.id).first()
    if not project or not project.dataset_name:
        raise HTTPException(status_code=404, detail="Project not found")
        
    best_model_record = db.query(models.Model).filter(models.Model.project_id == project_id, models.Model.is_active == True).first()
    if not best_model_record:
        raise HTTPException(status_code=404, detail="No active model found")
        
    export_path = f"uploads/project_{project_id}_predictions.csv"
    
    # If not already generated, generate it now
    if not os.path.exists(export_path):
        try:
            file_path = f"uploads/project_{project_id}_{project.dataset_name}"
            df = pd.read_csv(file_path)
            
            target_column = project.target_column
            if target_column in df.columns:
                X = df.drop(target_column, axis=1)
            else:
                X = df.copy()
                
            for col in X.columns:
                if X[col].dtype == 'object' and X[col].nunique() > len(X) * 0.5:
                    X = X.drop(col, axis=1)
                    
            numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns
            categorical_cols = X.select_dtypes(include=['object', 'category', 'bool']).columns

            if len(numeric_cols) > 0:
                num_imputer = SimpleImputer(strategy='median')
                X[numeric_cols] = num_imputer.fit_transform(X[numeric_cols])
                scaler = StandardScaler()
                X[numeric_cols] = scaler.fit_transform(X[numeric_cols])

            if len(categorical_cols) > 0:
                cat_imputer = SimpleImputer(strategy='most_frequent')
                X[categorical_cols] = cat_imputer.fit_transform(X[categorical_cols])
                X = pd.get_dummies(X, columns=categorical_cols, drop_first=True)
                
            expected_columns = joblib.load(f"saved_models/project_{project_id}_columns.joblib")
            for col in expected_columns:
                if col not in X.columns:
                    X[col] = 0
            X = X[expected_columns]
            
            clf = joblib.load(best_model_record.model_path)
            
            if hasattr(clf, "predict_proba"):
                probas = clf.predict_proba(X)[:, 1]
                df['Churn_Risk_Probability'] = probas
                df['Predicted_Churn'] = (probas > 0.5).astype(int)
            else:
                preds = clf.predict(X)
                df['Predicted_Churn'] = preds
                
            df.to_csv(export_path, index=False)
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
            
    return FileResponse(export_path, media_type="text/csv", filename=f"churn_predictions_workspace_{project_id}.csv")
