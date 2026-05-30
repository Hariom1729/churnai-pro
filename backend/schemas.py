from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

# Helper to map MongoDB _id to id
class MongoBaseModel(BaseModel):
    id: str = Field(alias="_id")
    
    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

# User Schemas
class UserBase(BaseModel):
    name: Optional[str] = None
    email: EmailStr

class UserCreate(UserBase):
    firebase_uid: str

class UserResponse(MongoBaseModel, UserBase):
    gemini_api_key: Optional[str] = None
    
class UserUpdate(BaseModel):
    name: Optional[str] = None
    gemini_api_key: Optional[str] = None

# Project Schemas
class ProjectBase(BaseModel):
    project_name: str

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(MongoBaseModel, ProjectBase):
    user_id: str
    dataset_name: Optional[str] = None
    target_column: Optional[str] = None
    created_at: datetime

# Model Schemas
class ModelResponse(MongoBaseModel):
    project_id: str
    model_name: str
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    auc_score: Optional[float] = None
    is_active: bool

# Prediction Schemas
class PredictionResponse(MongoBaseModel):
    project_id: str
    prediction_file: str
    created_at: datetime
