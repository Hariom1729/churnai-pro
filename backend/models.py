from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="owner")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    project_name = Column(String, index=True, nullable=False)
    dataset_name = Column(String, nullable=True)
    shap_values = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="projects")
    models = relationship("Model", back_populates="project")
    predictions = relationship("Prediction", back_populates="project")


class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    model_name = Column(String, nullable=False)
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    auc_score = Column(Float, nullable=True)
    model_path = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    project = relationship("Project", back_populates="models")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    prediction_file = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="predictions")
