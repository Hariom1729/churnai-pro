import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, BarChart3, Settings2 } from 'lucide-react';
import axios from 'axios';

export default function DataAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>('');
  
  // In a real app we'd fetch actual CSV columns from the backend.
  // We'll mock this for now until we build the Pandas logic on the backend.
  useEffect(() => {
    setTimeout(() => {
      setColumns(['CustomerID', 'Age', 'TenureMonths', 'MonthlyCharge', 'TotalCharge', 'SupportTickets', 'Churn']);
      setTargetColumn('Churn'); // auto-select 'Churn' if found
      setLoading(false);
    }, 1500);
  }, [id]);

  const handleStartTraining = () => {
    alert(`Starting AutoML pipeline to predict: ${targetColumn}!`);
    // Navigate to training progress page or dashboard (Phase 3)
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-400 hover:text-white mb-8 transition">
          <ArrowLeft size={16} className="mr-2" /> Back to Workspaces
        </button>

        <h1 className="text-3xl font-bold mb-2">Dataset Analysis</h1>
        <p className="text-slate-400 mb-8">We've successfully processed your dataset for Project #{id}.</p>

        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Analyzing CSV columns and data types...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center mb-6">
                <BarChart3 className="text-blue-500 mr-3" size={24} />
                <h2 className="text-xl font-semibold">Data Summary</h2>
              </div>
              <p className="text-slate-400 mb-4">
                We detected {columns.length} columns in your dataset. To train the predictive model, please select the target column you want to predict (e.g., "Churn").
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Column</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                >
                  <option value="" disabled>Select a column to predict</option>
                  {columns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-blue-900/20 border border-blue-900/50 rounded-lg flex items-start text-sm text-blue-200">
                <Settings2 className="mt-0.5 mr-2 flex-shrink-0" size={16} />
                <p>The AutoML engine will automatically encode categorical features, handle missing values, and train LightGBM, XGBoost, and Random Forest models on your selected target.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleStartTraining}
                disabled={!targetColumn}
                className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition shadow-lg shadow-green-900/20"
              >
                <Play className="mr-2" size={18} />
                Start AutoML Training
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
