# ChurnAI Pro - AI SaaS Platform

**ChurnAI Pro** is a modern, production-grade AI Software as a Service (SaaS) platform that allows users to upload datasets, automatically train machine learning models, generate predictions, explain results using Explainable AI (SHAP), and receive actionable business recommendations to prevent customer churn.

## 🌟 Key Features

### 1. Automated Machine Learning (AutoML) Engine
Users can simply upload any CSV dataset. The system automatically detects data types, handles missing values, encodes labels, and trains multiple state-of-the-art models including **XGBoost**, **LightGBM**, **CatBoost**, and **Random Forest**.

### 2. Explainable AI (SHAP)
Instead of a "black box" prediction, the platform explains *why* the AI made a decision. Users can view global feature importance and local predictions to understand exactly what behaviors drive customer churn.

### 3. Real-Time What-If Simulator
Tweak customer attributes (e.g., lower monthly price or increase support interaction) to instantly see how their churn probability recalculates in real-time.

### 4. Interactive Analytics Dashboard
A premium dark-mode, glassmorphism UI offering visualization of Churn Trends, Risk Distributions, and automated AI Business Insights using Recharts and Framer Motion.

### 5. Multi-Tenant SaaS Architecture
Built from the ground up for SaaS. Secure user authentication via JWT, protected routing, and isolated Project Workspaces where every user can manage multiple datasets and models.

---

## 🛠️ Technology Stack

### Frontend (The Dashboard)
- **Framework:** React 19 + TypeScript (Bootstrapped with Vite)
- **Styling:** Tailwind CSS v4, Framer Motion
- **UI Components:** Shadcn UI (Lucide Icons)
- **State Management & Fetching:** Zustand, React Query
- **Charts:** Recharts

### Backend (The Brain)
- **Framework:** FastAPI (Python 3.12+), Uvicorn
- **Database:** PostgreSQL (via SQLAlchemy ORM & Alembic)
- **Authentication:** JWT & Firebase Auth Integration
- **Machine Learning:** Scikit-Learn, XGBoost, LightGBM, CatBoost, SHAP, Pandas, NumPy

---

## 🚀 Getting Started Locally

To run this project locally, you will need to start both the Python backend and the React frontend servers.

### 1. Start the Backend API

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install all data science and API dependencies
pip install -r requirements.txt
# Or manually if requirements.txt isn't generated yet:
# pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary scikit-learn xgboost lightgbm catboost shap pandas numpy python-multipart "python-jose[cryptography]" "passlib[bcrypt]" firebase-admin

# Run Database Migrations
alembic upgrade head

# Start the FastAPI server
uvicorn main:app --reload
```
The backend API will run on `http://localhost:8000`.

### 2. Start the Frontend Application

```bash
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```
The frontend application will be available at `http://localhost:5173`. Open this URL in your browser to view the AI dashboard and landing page.

---

## 🗄️ Database Architecture

The system utilizes PostgreSQL with the following core relational models:
- **Users**: Manages tenant authentication and profile data.
- **Projects**: Isolated workspaces belonging to users, tracking uploaded datasets.
- **Models**: The trained ML models (LightGBM, XGBoost, etc.) associated with specific projects, storing accuracy metrics (F1, Precision, Recall).
- **Predictions**: Stored prediction results generated from the Prediction Center.

---

## 🔮 Roadmap (Upcoming Phases)
- **Phase 2:** Drag-and-drop CSV uploads with automated dataset analysis.
- **Phase 3:** Celery integration for asynchronous model training with WebSocket live progress tracking.
- **Phase 4:** KMeans Customer Segmentation clustering.
- **Phase 5:** Integration of a Large Language Model (LLM) chatbot to answer business questions directly from dataset statistics.

## License
MIT License
