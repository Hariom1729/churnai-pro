from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth, credentials
from sqlalchemy.orm import Session
from database import get_db
from models import User
import os

security = HTTPBearer()

# Initialize Firebase Admin (Only if credentials exist)
try:
    if not firebase_admin._apps:
        # For production, use credentials.Certificate('path/to/serviceAccountKey.json')
        # For development without keys, we will mock the auth if no default app can initialize
        firebase_admin.initialize_app()
    FIREBASE_ENABLED = True
except ValueError:
    FIREBASE_ENABLED = False
    print("Warning: Firebase Admin SDK not initialized. Using Mock Auth.")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    if not FIREBASE_ENABLED:
        # Mock Auth for local development without Firebase keys
        if token == "mock-jwt-token":
            return {"uid": "mock-uid-123", "email": "test@example.com"}
        raise HTTPException(status_code=401, detail="Invalid mock token")
        
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(decoded_token: dict = Depends(verify_token), db: Session = Depends(get_db)):
    firebase_uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        # Auto-create user on first login
        user = User(firebase_uid=firebase_uid, email=email, name=decoded_token.get("name", "New User"))
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
