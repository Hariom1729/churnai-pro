import firebase_admin
from firebase_admin import auth
firebase_admin.initialize_app(options={'projectId': 'chrunai-prediction'})
print("App initialized.")
