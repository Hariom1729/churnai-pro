from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
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
