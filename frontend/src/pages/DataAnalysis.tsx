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
  
  const [progress, setProgress] = useState<{status: string, progress: number, error?: boolean, done?: boolean} | null>(null);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8000/api/projects/${id}/columns`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setColumns(res.data.columns);
        // Auto-select 'Churn' if it exists in the dynamically loaded columns, otherwise leave blank
        if (res.data.columns.includes('Churn')) {
          setTargetColumn('Churn');
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch columns', err);
        setLoading(false);
      }
    };
    
    fetchColumns();
  }, [id]);

  const handleStartTraining = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Setup WebSocket
      const ws = new WebSocket(`ws://localhost:8000/ws/train-progress/${id}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setProgress(data);
        if (data.done) {
          setTimeout(() => {
            navigate(`/project/${id}/leaderboard`);
          }, 1500);
        }
      };

      // Trigger Training
      await axios.post(`http://localhost:8000/api/projects/${id}/train`, 
        { target_column: targetColumn },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProgress({ status: 'Initializing pipeline...', progress: 0 });
    } catch (err) {
      console.error('Failed to start training:', err);
      alert('Failed to start training. See console.');
    }
  };

  if (progress) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Training AutoML Models...</h2>
          
          <div className="mb-4 flex justify-between text-sm">
            <span className={progress.error ? "text-red-400" : "text-blue-400"}>{progress.status}</span>
            <span className="text-slate-400">{progress.progress}%</span>
          </div>
          
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${progress.error ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
          
          {progress.done && (
            <div className="mt-8 text-center text-green-400 animate-pulse">
              Training complete! Redirecting to Leaderboard...
            </div>
          )}
        </div>
      </div>
    );
  }

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
