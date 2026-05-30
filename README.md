# ChurnAI Pro

ChurnAI Pro is an advanced, production-grade AI SaaS Platform for predicting customer churn. It empowers businesses to upload their customer data and leverage an automated machine learning pipeline to predict at-risk customers, extract actionable recommendations using Gemini AI, and perform customer persona clustering.

## Features
- **Automated Machine Learning (AutoML):** Automatically trains Random Forest, XGBoost, LightGBM, and CatBoost models.
- **Explainable AI (XAI):** Built-in SHAP values calculation to show feature importance.
- **Gemini AI Integration:** Generates dynamic, actionable business recommendations based on feature importance.
- **Customer Segmentation:** K-Means clustering to group customers into distinct profiles.
- **Secure Authentication:** Firebase Google Sign-in to ensure secure and passwordless authentication.
- **Cloud Database:** MongoDB Atlas integration for robust and scalable workspace data isolation.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Recharts
- **Backend:** FastAPI, Python, Scikit-learn, XGBoost, LightGBM, CatBoost
- **Database:** MongoDB Atlas (PyMongo)
- **Authentication:** Firebase Auth
- **AI Models:** Google Gemini 2.5 Flash

## Installation

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python3 -m pip install -r requirements.txt
uvicorn main:app --reload
```

## Setup Environment Variables
Make sure to configure your `GEMINI_API_KEY` and `MONGO_URI` in the backend environment. The application supports user-specific Gemini API keys stored directly in the database.
