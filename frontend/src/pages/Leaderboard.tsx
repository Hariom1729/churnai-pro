import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Activity, CheckCircle2, Circle } from 'lucide-react';
import axios from 'axios';

export default function Leaderboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8000/api/projects/${id}/models`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort by F1 Score descending
        const sorted = res.data.sort((a: any, b: any) => b.f1_score - a.f1_score);
        setModels(sorted);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching models:', err);
        setLoading(false);
      }
    };
    
    fetchModels();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-400 hover:text-white mb-8 transition">
          <ArrowLeft size={16} className="mr-2" /> Back to Workspaces
        </button>

        <div className="flex items-center mb-8">
          <Trophy className="text-yellow-500 mr-4" size={32} />
          <div>
            <h1 className="text-3xl font-bold">Model Leaderboard</h1>
            <p className="text-slate-400">Comparing AutoML training results for Project #{id}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-300">Model Algorithm</th>
                    <th className="px-6 py-4 font-semibold text-slate-300">Accuracy</th>
                    <th className="px-6 py-4 font-semibold text-slate-300">F1 Score</th>
                    <th className="px-6 py-4 font-semibold text-slate-300">Precision</th>
                    <th className="px-6 py-4 font-semibold text-slate-300">Recall</th>
                    <th className="px-6 py-4 font-semibold text-slate-300 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {models.map((model, index) => (
                    <tr 
                      key={model.id} 
                      className={`transition-colors ${model.is_active ? 'bg-blue-900/10' : 'hover:bg-slate-800/50'}`}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                            index === 1 ? 'bg-slate-300/20 text-slate-300' :
                            index === 2 ? 'bg-orange-500/20 text-orange-500' :
                            'bg-slate-800 text-slate-500'
                          }`}>
                            {index + 1}
                          </span>
                          <span className="font-medium">{model.model_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-slate-300">{(model.accuracy * 100).toFixed(2)}%</td>
                      <td className="px-6 py-5 font-medium text-blue-400">{(model.f1_score * 100).toFixed(2)}%</td>
                      <td className="px-6 py-5 text-slate-400">{(model.precision * 100).toFixed(2)}%</td>
                      <td className="px-6 py-5 text-slate-400">{(model.recall * 100).toFixed(2)}%</td>
                      <td className="px-6 py-5 text-center">
                        {model.is_active ? (
                          <span className="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium border border-green-500/20">
                            <CheckCircle2 size={12} className="mr-1" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-medium border border-slate-700 cursor-pointer hover:bg-slate-700 transition">
                            <Circle size={12} className="mr-1" /> Standby
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {models.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p>No models found for this project. Start training first.</p>
              </div>
            )}
          </div>
        )}
        
        {models.length > 0 && (
          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => navigate(`/dashboard`)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition"
            >
              Continue to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
