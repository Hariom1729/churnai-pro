from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, BackgroundTasks, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json
import asyncio
from pydantic import BaseModel
from automl import run_automl_pipeline
from database import get_db
import schemas
from dependencies import get_current_user
from bson import ObjectId
import datetime
from fastapi.responses import Response

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

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

@app.post("/api/assistant/chat")
def assistant_chat(req: ChatRequest, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    import google.generativeai as genai
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = current_user.get("gemini_api_key") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
        
    genai.configure(api_key=api_key)
    projects = list(db.projects.find({"user_id": str(current_user["_id"])}))
    context = f"You are ChurnAI, an expert data science assistant. The user has {len(projects)} datasets uploaded."
    for p in projects:
        context += f"\n- Dataset '{p.get('dataset_name')}': predicting '{p.get('target_column')}'."
        
    model = genai.GenerativeModel('gemini-2.5-flash', system_instruction=context)
        
    messages = []
    for msg in req.history:
        messages.append({
            "role": "model" if msg.role == "assistant" else "user",
            "parts": [msg.content]
        })
    messages.append({"role": "user", "parts": [req.message]})
    
    try:
        response = model.generate_content(messages)
        return {"response": response.text}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    current_user["_id"] = str(current_user["_id"])
    current_user["id"] = current_user["_id"]
    return current_user

@app.put("/api/users/me")
def update_user_me(user_update: schemas.UserUpdate, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    update_data = {}
    if user_update.name is not None:
        update_data["name"] = user_update.name
    if user_update.gemini_api_key is not None:
        update_data["gemini_api_key"] = user_update.gemini_api_key
        
    if update_data:
        db.users.update_one({"_id": current_user["_id"]}, {"$set": update_data})
        
    updated_user = db.users.find_one({"_id": current_user["_id"]})
    updated_user["_id"] = str(updated_user["_id"])
    updated_user["id"] = updated_user["_id"]
    return updated_user

@app.get("/api/projects")
def get_projects(db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    projects = list(db.projects.find({"user_id": str(current_user["_id"])}))
    for p in projects:
        p["_id"] = str(p["_id"])
        p["id"] = p["_id"]
    return projects

@app.post("/api/projects")
def create_project(project: schemas.ProjectCreate, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    new_project = {
        "project_name": project.project_name,
        "user_id": str(current_user["_id"]),
        "dataset_name": None,
        "target_column": None,
        "shap_values": None,
        "created_at": datetime.datetime.utcnow()
    }
    result = db.projects.insert_one(new_project)
    created_project = db.projects.find_one({"_id": result.inserted_id})
    created_project["_id"] = str(created_project["_id"])
    created_project["id"] = created_project["_id"]
    return created_project

import shutil
import os

os.makedirs("uploads", exist_ok=True)

@app.post("/api/projects/{project_id}/upload")
def upload_dataset(project_id: str, file: UploadFile = File(...), db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(current_user["_id"])})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    file_location = f"uploads/project_{project_id}_{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db.projects.update_one({"_id": ObjectId(project_id)}, {"$set": {"dataset_name": file.filename}})
    
    return {"info": f"file '{file.filename}' saved at '{file_location}'"}

@app.get("/api/projects/{project_id}/columns")
def get_dataset_columns(project_id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(current_user["_id"])})
    if not project or not project.get("dataset_name"):
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    file_location = f"uploads/project_{project_id}_{project['dataset_name']}"
    import pandas as pd
    try:
        df = pd.read_csv(file_location, nrows=0)
        return {"columns": list(df.columns)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}/data")
def get_dataset_data(project_id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(current_user["_id"])})
    if not project or not project.get("dataset_name"):
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    file_location = f"uploads/project_{project_id}_{project['dataset_name']}"
    import pandas as pd
    try:
        df = pd.read_csv(file_location, nrows=5000)
        df = df.replace({pd.NA: None, pd.NaT: None, float('nan'): None})
        return {"data": df.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, project_id: str):
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)

    def disconnect(self, websocket: WebSocket, project_id: str):
        if project_id in self.active_connections:
            self.active_connections[project_id].remove(websocket)

    async def send_progress(self, project_id: str, message: dict):
        if project_id in self.active_connections:
            for connection in self.active_connections[project_id]:
                await connection.send_text(json.dumps(message))

manager = ConnectionManager()

@app.websocket("/ws/train-progress/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: str):
    await manager.connect(websocket, project_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, project_id)

class TrainRequest(BaseModel):
    target_column: str

@app.post("/api/projects/{project_id}/train")
async def start_training(project_id: str, request: TrainRequest, background_tasks: BackgroundTasks, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(current_user["_id"])})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not project.get("dataset_name"):
        raise HTTPException(status_code=400, detail="No dataset uploaded for this project")

    db.projects.update_one({"_id": ObjectId(project_id)}, {"$set": {"target_column": request.target_column}})
    
    background_tasks.add_task(
        run_automl_pipeline,
        project_id,
        project["dataset_name"],
        request.target_column,
        manager.send_progress
    )
    return {"message": "Training started"}

@app.get("/api/projects/{project_id}/models")
def get_project_models(project_id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(current_user["_id"])})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    project_models = list(db.models.find({"project_id": project_id}))
    for m in project_models:
        m["_id"] = str(m["_id"])
        m["id"] = m["_id"]
    return project_models

@app.get("/api/models")
def get_all_models(db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_projects = list(db.projects.find({"user_id": str(current_user["_id"])}, {"_id": 1}))
    project_ids = [str(p["_id"]) for p in user_projects]
    
    all_models = list(db.models.find({"project_id": {"$in": project_ids}}).sort("accuracy", -1))
    for m in all_models:
        m["_id"] = str(m["_id"])
        m["id"] = m["_id"]
    return all_models

@app.get("/api/projects/{project_id}/shap")
def get_project_shap_values(project_id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(current_user["_id"])})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not project.get("shap_values"):
        return {"shap_values": None}
        
    import json
    try:
        shap_data = json.loads(project["shap_values"])
        return {"shap_values": shap_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse SHAP values")

class PredictRowRequest(BaseModel):
    row_data: dict
    target_column: str

@app.post("/api/projects/{project_id}/predict_row")
async def api_predict_row(project_id: str, request: PredictRowRequest, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(current_user["_id"])})
    if not project or not project.get("dataset_name"):
        raise HTTPException(status_code=404, detail="Project or dataset not found")
        
    from automl import predict_single_row
    try:
        result = await predict_single_row(
            project_id=project_id, 
            dataset_name=project["dataset_name"], 
            target_column=request.target_column,
            row_data=request.row_data
        )
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models/{model_id}/predict_batch")
async def api_predict_batch(model_id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    model = db.models.find_one({"_id": ObjectId(model_id)})
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
        
    project = db.projects.find_one({"_id": ObjectId(model["project_id"]), "user_id": str(current_user["_id"])})
    if not project:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    from automl import predict_batch
    try:
        csv_data = await predict_batch(str(project["_id"]), project["dataset_name"], project["target_column"], model["model_path"])
        return Response(content=csv_data, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename=predictions_model_{model_id}.csv"})
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}/clusters")
def get_project_clusters(project_id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(current_user["_id"])})
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
def get_project_recommendations(project_id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    project = db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(current_user["_id"])})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not project.get("shap_values"):
        return {"recommendations": []}
        
    import json
    import os
    
    try:
        import google.generativeai as genai
        from dotenv import load_dotenv
        
        load_dotenv()
        
        api_key = current_user.get("gemini_api_key") or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise Exception("Gemini API Key not configured")
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        shap_data = json.loads(project["shap_values"])
        top_features = list(shap_data.keys())[:3]
        
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
        try:
            text = response.text.strip()
            if text.startswith('```json'): text = text[7:]
            if text.startswith('```'): text = text[3:]
            if text.endswith('```'): text = text[:-3]
            dynamic_recs = json.loads(text.strip())
            return {"recommendations": dynamic_recs}
        except Exception as e:
            recs = [{"feature": feat, "action": f"The feature '{feat}' is a primary driver of churn. We recommend auditing this segment closely."} for feat in top_features]
            return {"recommendations": recs}
            
    except Exception as e:
        shap_data = json.loads(project["shap_values"])
        top_features = list(shap_data.keys())[:3]
        recs = [{"feature": feat, "action": f"The feature '{feat}' is a primary driver of churn. We recommend auditing this segment closely."} for feat in top_features]
        return {"recommendations": recs}

@app.get("/api/projects/{project_id}/export")
def export_predictions(project_id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    from fastapi.responses import FileResponse
    import os
    import pandas as pd
    import joblib
    from sklearn.impute import SimpleImputer
    from sklearn.preprocessing import StandardScaler
    
    project = db.projects.find_one({"_id": ObjectId(project_id), "user_id": str(current_user["_id"])})
    if not project or not project.get("dataset_name"):
        raise HTTPException(status_code=404, detail="Project not found")
        
    best_model_record = db.models.find_one({"project_id": project_id, "is_active": True})
    if not best_model_record:
        raise HTTPException(status_code=404, detail="No active model found")
        
    export_path = f"uploads/project_{project_id}_predictions.csv"
    
    if not os.path.exists(export_path):
        try:
            file_path = f"uploads/project_{project_id}_{project['dataset_name']}"
            df = pd.read_csv(file_path)
            
            target_column = project["target_column"]
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
            
            clf = joblib.load(best_model_record["model_path"])
            
            if hasattr(clf, "predict_proba"):
                probas = clf.predict_proba(X)[:, 1]
                df['Churn_Risk_Probability'] = probas
                df['Predicted_Churn'] = (probas > 0.5).astype(int)
            else:
                preds = clf.predict(X)
                df['Predicted_Churn'] = preds
                
            df.to_csv(export_path, index=False)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")
            
    return FileResponse(export_path, media_type="text/csv", filename=f"churn_predictions_workspace_{project_id}.csv")
