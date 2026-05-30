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
