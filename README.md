# ChurnAI Pro

ChurnAI Pro is an advanced, production-grade AI SaaS Platform for predicting customer churn. It empowers businesses to upload their customer data and leverage an automated machine learning pipeline to predict at-risk customers, extract actionable recommendations using Gemini AI, and perform customer persona clustering.

## Features
- **Automated Machine Learning (AutoML):** Automatically trains Random Forest, XGBoost, LightGBM, and CatBoost models.
- **Explainable AI (XAI):** Built-in SHAP values calculation to show global and local feature importance.
- **What-If Simulation:** Tweak individual customer attributes to simulate real-time churn risk using trained estimators.
- **Gemini AI Integration:** Generates dynamic, actionable business recommendations based on feature importance.
- **Customer Segmentation:** K-Means clustering to group customers into distinct behavioral profiles.
- **Secure Authentication:** Firebase Google Sign-In to ensure secure, passwordless authentication.
- **Cloud Database:** MongoDB Atlas integration for robust and scalable workspace data isolation.

## Tech Stack
- **Frontend:** React 19, Vite 8, TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend:** FastAPI, Python, PyMongo, Scikit-learn, XGBoost, LightGBM, CatBoost
- **Database:** MongoDB Atlas (PyMongo)
- **Authentication:** Firebase Auth (Google Sign-In)
- **AI Models:** Google Gemini 2.5 Flash

## Installation

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend Setup
Create a virtual environment, activate it, and install dependencies:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Environment Configuration

### Backend Setup (`backend/.env`)
Create a `.env` file in the `backend` directory and add your keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=your_mongodb_atlas_connection_string_here
```
*Note: Users can also configure their own specific Gemini API keys inside the Settings dashboard, which takes precedence.*

### Frontend Setup (`frontend/src/firebase.ts`)
The application is pre-configured to use Firebase Auth. The configuration is defined in `frontend/src/firebase.ts`. Make sure to update the configuration object if you migrate to a different Firebase project:
```typescript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "chrunai-prediction",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};
```
