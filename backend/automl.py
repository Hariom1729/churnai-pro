import pandas as pd
import numpy as np
import os
import joblib
import asyncio
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier
from database import SessionLocal

async def run_automl_pipeline(project_id: int, dataset_name: str, target_column: str, send_progress_update):
    db = SessionLocal()
    try:
        await send_progress_update(project_id, {"status": "Starting AutoML...", "progress": 5})
        
        # 1. Load Data
        file_path = f"uploads/project_{project_id}_{dataset_name}"
        if not os.path.exists(file_path):
            await send_progress_update(project_id, {"status": "Error: Dataset not found", "progress": 0, "error": True})
            return

        df = await asyncio.to_thread(pd.read_csv, file_path)
        await send_progress_update(project_id, {"status": "Dataset loaded. Preprocessing data...", "progress": 15})

        # Ensure target column exists
        if target_column not in df.columns:
            await send_progress_update(project_id, {"status": f"Error: Target column '{target_column}' not found", "progress": 0, "error": True})
            return

        # 2. Preprocessing
        # Drop ID-like columns if they exist (heuristic: high cardinality string columns)
        for col in df.columns:
            if df[col].dtype == 'object' and df[col].nunique() > len(df) * 0.5:
                df = df.drop(col, axis=1)

        X = df.drop(target_column, axis=1)
        y = df[target_column]

        # Encode target if categorical or check if it's regression
        if y.dtype == 'object' or y.dtype.name == 'category':
            le = LabelEncoder()
            y = le.fit_transform(y)
        else:
            # If it's numeric and has many unique values, it's likely a regression problem
            if y.nunique() > 20:
                await send_progress_update(project_id, {"status": f"Error: Target '{target_column}' is continuous. AutoML currently only supports Classification (e.g. Yes/No).", "progress": 0, "error": True})
                return
            # Even if it's numeric (e.g. 10, 20), make sure it's sequentially encoded for XGBoost
            le = LabelEncoder()
            y = le.fit_transform(y)
            
        await send_progress_update(project_id, {"status": "Encoding features...", "progress": 25})

        # Identify numeric and categorical columns
        numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns
        categorical_cols = X.select_dtypes(include=['object', 'category', 'bool']).columns

        # Impute and Scale Numeric
        if len(numeric_cols) > 0:
            num_imputer = SimpleImputer(strategy='median')
            X[numeric_cols] = num_imputer.fit_transform(X[numeric_cols])
            
            scaler = StandardScaler()
            X[numeric_cols] = scaler.fit_transform(X[numeric_cols])

        # Impute and One-Hot Encode Categorical
        if len(categorical_cols) > 0:
            cat_imputer = SimpleImputer(strategy='most_frequent')
            X[categorical_cols] = cat_imputer.fit_transform(X[categorical_cols])
            X = pd.get_dummies(X, columns=categorical_cols, drop_first=True)

        await send_progress_update(project_id, {"status": "Splitting data...", "progress": 40})
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # 3. Train Models
        models_to_train = {
            "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
            "XGBoost": XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42),
            "LightGBM": LGBMClassifier(random_state=42),
            "CatBoost": CatBoostClassifier(verbose=0, random_state=42)
        }

        os.makedirs("saved_models", exist_ok=True)
        trained_model_results = []

        progress_step = 50 / len(models_to_train)
        current_progress = 40

        import models as db_models # Local import to avoid circular dependencies

        # Clear old models for this project
        db.query(db_models.Model).filter(db_models.Model.project_id == project_id).delete()
        db.commit()

        for name, clf in models_to_train.items():
            await send_progress_update(project_id, {"status": f"Training {name}...", "progress": int(current_progress)})
            
            await asyncio.to_thread(clf.fit, X_train, y_train)
            y_pred = await asyncio.to_thread(clf.predict, X_test)
            
            def get_proba():
                return clf.predict_proba(X_test)[:, 1] if hasattr(clf, "predict_proba") else None
            y_proba = await asyncio.to_thread(get_proba)

            # Calculate metrics
            acc = accuracy_score(y_test, y_pred)
            prec = precision_score(y_test, y_pred, zero_division=0, average='weighted')
            rec = recall_score(y_test, y_pred, zero_division=0, average='weighted')
            f1 = f1_score(y_test, y_pred, zero_division=0, average='weighted')
            
            try:
                auc = roc_auc_score(y_test, y_proba) if y_proba is not None else None
            except ValueError:
                auc = None

            # Save model to disk
            model_path = f"saved_models/project_{project_id}_{name.replace(' ', '_').lower()}.joblib"
            joblib.dump(clf, model_path)

            # Save to database
            db_model = db_models.Model(
                project_id=project_id,
                model_name=name,
                accuracy=acc,
                precision=prec,
                recall=rec,
                f1_score=f1,
                auc_score=auc,
                model_path=model_path,
                is_active=False # We will set the best model to active later
            )
            db.add(db_model)
            trained_model_results.append(db_model)

            current_progress += progress_step

        # 4. Set Best Model to Active
        best_model = max(trained_model_results, key=lambda x: x.f1_score or 0)
        best_model.is_active = True
        
        # 5. Calculate SHAP values for Explainability (Phase 4)
        await send_progress_update(project_id, {"status": "Calculating SHAP Explanations...", "progress": 95})
        import shap
        import json
        
        best_clf = models_to_train[best_model.model_name]
        
        # Subsample for speed
        X_shap = X_test.sample(min(len(X_test), 500), random_state=42)
        
        try:
            # TreeExplainer works for all our models (RF, XGB, LGBM, CatBoost)
            explainer = shap.TreeExplainer(best_clf)
            shap_values = explainer.shap_values(X_shap)
            
            # For some models/versions, shap_values is a list (multiclass or binary), for others it's an array.
            if isinstance(shap_values, list):
                shap_values = shap_values[1] if len(shap_values) > 1 else shap_values[0]
            elif len(shap_values.shape) == 3:
                # Handle SHAP versions that return 3D arrays for multiclass/binary
                shap_values = shap_values[:, :, 1]
            
            # Calculate mean absolute SHAP value for each feature
            mean_shap = np.abs(shap_values).mean(axis=0)
            
            # Create a dictionary mapping feature names to their importance
            feature_importance = {col: float(val) for col, val in zip(X.columns, mean_shap)}
            
            # Sort by importance
            sorted_importance = dict(sorted(feature_importance.items(), key=lambda item: item[1], reverse=True))
            
            # Store in the project table
            project = db.query(db_models.Project).filter(db_models.Project.id == project_id).first()
            if project:
                project.shap_values = json.dumps(sorted_importance)
                
        except Exception as shap_e:
            print(f"SHAP calculation failed: {shap_e}")
            # Don't fail the whole pipeline if SHAP fails
            pass
            
        db.commit()

        # Save the preprocessor metadata/scaler (simplified for this scope, just saving X columns to use later)
        joblib.dump(list(X.columns), f"saved_models/project_{project_id}_columns.joblib")

        await send_progress_update(project_id, {
            "status": "AutoML Training Complete!", 
            "progress": 100, 
            "done": True,
            "best_model": best_model.model_name
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        await send_progress_update(project_id, {"status": f"Error: {str(e)}", "progress": 0, "error": True})
    finally:
        db.close()
