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
from database import get_db, get_fs
from bson import ObjectId

async def run_automl_pipeline(project_id: str, dataset_name: str, target_column: str, send_progress_update):
    try:
        db = get_db()
        project = db.projects.find_one({"_id": ObjectId(project_id)})
        if not project or not project.get("dataset_file_id"):
            raise ValueError("Dataset not found")
        
        fs = get_fs()
        
        await send_progress_update(project_id, {"status": "Loading dataset...", "progress": 5})
        grid_out = fs.get(ObjectId(project["dataset_file_id"]))
        df = await asyncio.to_thread(pd.read_csv, grid_out)
        await send_progress_update(project_id, {"status": "Dataset loaded. Preprocessing data...", "progress": 15})

        if target_column not in df.columns:
            await send_progress_update(project_id, {"status": f"Error: Target column '{target_column}' not found", "progress": 0, "error": True})
            return

        for col in df.columns:
            if df[col].dtype == 'object' and df[col].nunique() > len(df) * 0.5:
                df = df.drop(col, axis=1)

        X = df.drop(target_column, axis=1)
        y = df[target_column]

        if y.dtype == 'object' or y.dtype.name == 'category':
            le = LabelEncoder()
            y = le.fit_transform(y)
        else:
            if y.nunique() > 20:
                await send_progress_update(project_id, {"status": f"Error: Target '{target_column}' is continuous. AutoML currently only supports Classification.", "progress": 0, "error": True})
                return
            le = LabelEncoder()
            y = le.fit_transform(y)
            
        await send_progress_update(project_id, {"status": "Encoding features...", "progress": 25})

        numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns
        categorical_cols = X.select_dtypes(include=['object', 'category', 'bool']).columns

        if len(numeric_cols) > 0:
            num_imputer = SimpleImputer(strategy='median')
            X[numeric_cols] = num_imputer.fit_transform(X[numeric_cols])
            
            scaler = StandardScaler()
            X[numeric_cols] = scaler.fit_transform(X[numeric_cols])

        if len(categorical_cols) > 0:
            cat_imputer = SimpleImputer(strategy='most_frequent')
            X[categorical_cols] = cat_imputer.fit_transform(X[categorical_cols])
            X = pd.get_dummies(X, columns=categorical_cols, drop_first=True)

        await send_progress_update(project_id, {"status": "Splitting data...", "progress": 40})
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

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

        # Clear old models
        db.models.delete_many({"project_id": project_id})

        for name, clf in models_to_train.items():
            await send_progress_update(project_id, {"status": f"Training {name}...", "progress": int(current_progress)})
            
            await asyncio.to_thread(clf.fit, X_train, y_train)
            y_pred = await asyncio.to_thread(clf.predict, X_test)
            
            def get_proba():
                return clf.predict_proba(X_test)[:, 1] if hasattr(clf, "predict_proba") else None
            y_proba = await asyncio.to_thread(get_proba)

            acc = accuracy_score(y_test, y_pred)
            prec = precision_score(y_test, y_pred, zero_division=0, average='weighted')
            rec = recall_score(y_test, y_pred, zero_division=0, average='weighted')
            f1 = f1_score(y_test, y_pred, zero_division=0, average='weighted')
            
            try:
                auc = roc_auc_score(y_test, y_proba) if y_proba is not None else None
            except ValueError:
                auc = None

            model_path = f"saved_models/project_{project_id}_{name.replace(' ', '_').lower()}.joblib"
            joblib.dump(clf, model_path)

            db_model = {
                "project_id": project_id,
                "model_name": name,
                "accuracy": acc,
                "precision": prec,
                "recall": rec,
                "f1_score": f1,
                "auc_score": auc,
                "model_path": model_path,
                "is_active": False
            }
            res = db.models.insert_one(db_model)
            db_model["_id"] = res.inserted_id
            trained_model_results.append(db_model)

            current_progress += progress_step

        best_model = max(trained_model_results, key=lambda x: x.get("f1_score") or 0)
        db.models.update_one({"_id": best_model["_id"]}, {"$set": {"is_active": True}})
        
        await send_progress_update(project_id, {"status": "Calculating SHAP Explanations...", "progress": 95})
        import shap
        import json
        
        best_clf = models_to_train[best_model["model_name"]]
        X_shap = X_test.sample(min(len(X_test), 500), random_state=42)
        
        try:
            explainer = shap.TreeExplainer(best_clf)
            shap_values = explainer.shap_values(X_shap)
            
            if isinstance(shap_values, list):
                shap_values = shap_values[1] if len(shap_values) > 1 else shap_values[0]
            elif len(shap_values.shape) == 3:
                shap_values = shap_values[:, :, 1]
            
            mean_shap = np.abs(shap_values).mean(axis=0)
            feature_importance = {col: float(val) for col, val in zip(X.columns, mean_shap)}
            sorted_importance = dict(sorted(feature_importance.items(), key=lambda item: item[1], reverse=True))
            
            db.projects.update_one({"_id": ObjectId(project_id)}, {"$set": {"shap_values": json.dumps(sorted_importance)}})
        except Exception as shap_e:
            print(f"SHAP calculation failed: {shap_e}")
            pass
            
        await send_progress_update(project_id, {"status": "Generating Persona Clusters...", "progress": 98})
        from sklearn.cluster import KMeans
        try:
            kmeans = KMeans(n_clusters=4, random_state=42)
            clusters = kmeans.fit_predict(X_test)
            centers = kmeans.cluster_centers_
            cluster_profiles = []
            for i in range(4):
                center_vals = centers[i]
                top_idx = np.argsort(np.abs(center_vals))[-3:]
                top_features = {X_test.columns[idx]: float(center_vals[idx]) for idx in top_idx}
                cluster_profiles.append({
                    "cluster_id": i,
                    "size": int(np.sum(clusters == i)),
                    "top_features": top_features
                })
            
            with open(f"saved_models/project_{project_id}_clusters.json", "w") as f:
                json.dump(cluster_profiles, f)
        except Exception as cluster_e:
            print(f"Clustering failed: {cluster_e}")
            pass

        joblib.dump(list(X.columns), f"saved_models/project_{project_id}_columns.joblib")

        await send_progress_update(project_id, {
            "status": "AutoML Training Complete!", 
            "progress": 100, 
            "done": True,
            "best_model": best_model["model_name"]
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        await send_progress_update(project_id, {"status": f"Error: {str(e)}", "progress": 0, "error": True})


async def predict_single_row(project_id: str, dataset_name: str, target_column: str, row_data: dict):
    import shap
    
    try:
        db = get_db()
        project = db.projects.find_one({"_id": ObjectId(project_id)})
        if not project or not project.get("dataset_file_id"):
            raise ValueError("Dataset not found")
            
        fs = get_fs()
        grid_out = fs.get(ObjectId(project["dataset_file_id"]))
        df = await asyncio.to_thread(pd.read_csv, grid_out)
        
        if target_column not in df.columns:
            raise Exception(f"Target column '{target_column}' not found")
            
        for col in df.columns:
            if df[col].dtype == 'object' and df[col].nunique() > len(df) * 0.5:
                df = df.drop(col, axis=1)
                
        X = df.drop(target_column, axis=1)
        new_row_df = pd.DataFrame([row_data])
        
        for col in X.columns:
            if col not in new_row_df.columns:
                new_row_df[col] = np.nan
        new_row_df = new_row_df[X.columns]
        
        X = pd.concat([X, new_row_df], ignore_index=True)
        
        numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns
        categorical_cols = X.select_dtypes(include=['object', 'category', 'bool']).columns

        if len(numeric_cols) > 0:
            num_imputer = SimpleImputer(strategy='median')
            X[numeric_cols] = num_imputer.fit_transform(X[numeric_cols])
            scaler = StandardScaler()
            X[numeric_cols] = scaler.fit_transform(X[numeric_cols])

        if len(categorical_cols) > 0:
            cat_imputer = SimpleImputer(strategy='most_frequent')
            X[categorical_cols] = cat_imputer.fit_transform(X[categorical_cols])
            X = pd.get_dummies(X, columns=categorical_cols, drop_first=True)
            
        X_target = X.iloc[[-1]]
        
        expected_columns = joblib.load(f"saved_models/project_{project_id}_columns.joblib")
        for col in expected_columns:
            if col not in X_target.columns:
                X_target[col] = 0
        X_target = X_target[expected_columns]
        
        best_model_record = db.models.find_one({"project_id": project_id, "is_active": True})
        if not best_model_record:
            raise Exception("No active model found")
            
        clf = joblib.load(best_model_record["model_path"])
        
        proba = float(clf.predict_proba(X_target)[0, 1]) if hasattr(clf, "predict_proba") else float(clf.predict(X_target)[0])
        
        explainer = shap.TreeExplainer(clf)
        shap_values = explainer.shap_values(X_target)
        
        if isinstance(shap_values, list):
            shap_values = shap_values[1] if len(shap_values) > 1 else shap_values[0]
        elif len(shap_values.shape) == 3:
            shap_values = shap_values[:, :, 1]
            
        local_shap = shap_values[0]
        feature_importance = {col: float(val) for col, val in zip(X_target.columns, local_shap)}
        
        sorted_importance = dict(sorted(feature_importance.items(), key=lambda item: abs(item[1]), reverse=True))
        
        return {
            "churn_probability": proba,
            "local_shap_values": sorted_importance
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise e

async def predict_batch(project_id: str, dataset_name: str, target_column: str, model_path: str):
    try:
        db = get_db()
        project = db.projects.find_one({"_id": ObjectId(project_id)})
        if not project or not project.get("dataset_file_id"):
            raise ValueError("Dataset not found")
            
        fs = get_fs()
        grid_out = fs.get(ObjectId(project["dataset_file_id"]))
        df = await asyncio.to_thread(pd.read_csv, grid_out)
        
        X_df = df.copy()
        for col in X_df.columns:
            if X_df[col].dtype == 'object' and X_df[col].nunique() > len(X_df) * 0.5:
                X_df = X_df.drop(col, axis=1)
                
        X = X_df.drop(target_column, axis=1, errors='ignore')
        
        numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns
        categorical_cols = X.select_dtypes(include=['object', 'category', 'bool']).columns

        if len(numeric_cols) > 0:
            num_imputer = SimpleImputer(strategy='median')
            X[numeric_cols] = num_imputer.fit_transform(X[numeric_cols])
            scaler = StandardScaler()
            X[numeric_cols] = scaler.fit_transform(X[numeric_cols])

        if len(categorical_cols) > 0:
            cat_imputer = SimpleImputer(strategy='most_frequent')
            X[categorical_cols] = cat_imputer.fit_transform(X[categorical_cols])
            X = pd.get_dummies(X, columns=categorical_cols, drop_first=True)
            
        expected_columns = joblib.load(f"saved_models/project_{project_id}_columns.joblib")
        for col in expected_columns:
            if col not in X.columns:
                X[col] = 0
        X = X[expected_columns]
        
        clf = joblib.load(model_path)
        
        probas = clf.predict_proba(X)[:, 1] if hasattr(clf, "predict_proba") else clf.predict(X)
        preds = clf.predict(X)
        
        df['predicted_class'] = preds
        df['prediction_probability'] = probas
        
        return df.to_csv(index=False)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise e
