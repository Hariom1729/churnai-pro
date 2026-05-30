from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from database import get_db
import os

security = HTTPBearer()

FIREBASE_ENABLED = True
print("Using google-auth for Firebase ID token verification.")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    
    try:
        decoded_token = id_token.verify_firebase_token(
            token,
            google_requests.Request(),
            audience=os.environ.get("FIREBASE_PROJECT_ID", "chrunai-prediction")
        )
        return decoded_token
    except Exception as e:
        with open("backend_error.log", "a") as f:
            f.write(f"Token verification error: {str(e)}\n")
            f.write(f"Token received: {token[:10]}...\n")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(decoded_token: dict = Depends(verify_token), db = Depends(get_db)):
    firebase_uid = decoded_token.get("uid") or decoded_token.get("sub") or decoded_token.get("user_id")
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
