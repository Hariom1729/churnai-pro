from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import auth

# Initialize Firebase Admin without credentials (only works for token verification with project ID)
try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(options={'projectId': 'chrunai-prediction'})

from database import get_db
import os

security = HTTPBearer()

FIREBASE_ENABLED = True
print("Using Firebase Auth for Authentication.")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(decoded_token: dict = Depends(verify_token), db = Depends(get_db)):
    firebase_uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    name = decoded_token.get("name", "New User")
    
    # Query MongoDB
    user = db.users.find_one({"firebase_uid": firebase_uid})
    
    if not user:
        # Auto-create user on first login
        new_user = {
            "firebase_uid": firebase_uid,
            "email": email,
            "name": name,
            "gemini_api_key": None
        }
        result = db.users.insert_one(new_user)
        user = db.users.find_one({"_id": result.inserted_id})
        
    return user
