import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Activity, CheckCircle2, Circle, ChevronRight, BarChart2, Users, Download, Lightbulb } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import DataExplorer from '../components/DataExplorer';

export default function Leaderboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [models, setModels] = useState<any[]>([]);
  const [shapData, setShapData] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch Projects to get target_column
        const projRes = await axios.get('http://localhost:8000/api/projects', { headers });
        const project = projRes.data.find((p: any) => p.id === Number(id));
        if (project && project.target_column) {
          setTargetColumn(project.target_column);
        }

        // Fetch Columns
        try {
          const colRes = await axios.get(`http://localhost:8000/api/projects/${id}/columns`, { headers });
          setColumns(colRes.data.columns);
        } catch (e) {
          console.error(e);
        }
        
        const modelsRes = await axios.get(`http://localhost:8000/api/projects/${id}/models`, { headers });
        const sorted = modelsRes.data.sort((a: any, b: any) => b.f1_score - a.f1_score);
        setModels(sorted);
        
        try {
          const shapRes = await axios.get(`http://localhost:8000/api/projects/${id}/shap`, { headers });
          if (shapRes.data.shap_values) {
            const shapArray = Object.entries(shapRes.data.shap_values).map(([name, value]) => ({
              name,
              value: Number(value)
            })).slice(0, 10);
            setShapData(shapArray);
          }
        } catch (shapErr) {
          console.error('Error fetching SHAP values:', shapErr);
        }

        try {
          const clusterRes = await axios.get(`http://localhost:8000/api/projects/${id}/clusters`, { headers });
          if (clusterRes.data.clusters) {
            setClusters(clusterRes.data.clusters);
          }
        } catch (err) {
          console.error('Error fetching clusters:', err);
        }

        try {
          const recsRes = await axios.get(`http://localhost:8000/api/projects/${id}/recommendations`, { headers });
          if (recsRes.data.recommendations) {
            setRecommendations(recsRes.data.recommendations);
          }
        } catch (err) {
          console.error('Error fetching recs:', err);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/projects/${id}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `churn_predictions_workspace_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export:', err);
      alert('Failed to generate export file. Check server logs.');
    }
    setIsExporting(false);
  };

  return (
    <div className="w-full pb-20">
      <div className="flex justify-between items-center mb-10">
        <button onClick={() => navigate('/dashboard')} className="group flex items-center text-slate-400 hover:text-[var(--color-brand-green)] transition-colors">
          <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" /> Back to Workspaces
        </button>
        {models.length > 0 && (
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
          >
            {isExporting ? (
              <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> Exporting...</>
            ) : (
              <><Download size={16} /> Export Predictions CSV</>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,163,0.15)] relative">
            <div className="absolute inset-0 bg-[var(--color-brand-green)]/20 blur-xl rounded-full"></div>
            <Trophy className="text-[var(--color-brand-green)] relative z-10" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-1">Model Leaderboard</h1>
            <p className="text-slate-400 text-lg">Neural architectures competing for max efficiency on Workspace #{id}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center relative">
          <div className="absolute inset-0 bg-[var(--color-brand-green)]/5 blur-3xl rounded-full w-64 h-64 mx-auto animate-pulse"></div>
          <div className="w-16 h-16 border-4 border-[var(--color-brand-green)]/20 border-t-[var(--color-brand-green)] rounded-full animate-spin mb-6 relative z-10"></div>
          <p className="text-[var(--color-brand-green)] font-mono animate-pulse relative z-10">Fetching Model Evaluation Metrics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {models.map((model, index) => {
            const isWinner = index === 0;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={model.id} 
                className={`relative glass-card p-6 overflow-hidden transition-all duration-500 group ${
                  isWinner ? 'border-[var(--color-brand-green)] shadow-[0_0_40px_rgba(0,255,163,0.1)]' : 'hover:border-white/20'
                }`}
              >
                {/* Background glow for winner */}
                {isWinner && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand-green)]/5 via-transparent to-transparent"></div>
                )}
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                  {/* Rank & Name */}
                  <div className="flex items-center gap-6 w-full lg:w-1/3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${
                      isWinner 
                        ? 'bg-[var(--color-brand-green)] text-black shadow-[0_0_20px_rgba(0,255,163,0.5)]' 
                        : 'bg-white/5 border border-white/10 text-slate-400'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`text-2xl font-bold ${isWinner ? 'text-white' : 'text-slate-300'}`}>
                          {model.model_name}
                        </h3>
                        {isWinner && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/50 uppercase tracking-wider">
                            Top Pick
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 font-mono">ID: {model.id.toString().padStart(4, '0')}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full lg:w-2/3">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Accuracy</p>
                      <p className="text-2xl font-medium text-white">{(model.accuracy * 100).toFixed(2)}<span className="text-slate-500 text-lg">%</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-brand-cyan)] uppercase tracking-wider mb-1 font-semibold">F1 Score</p>
                      <p className="text-2xl font-bold text-[var(--color-brand-cyan)] text-glow">{(model.f1_score * 100).toFixed(2)}<span className="text-[var(--color-brand-cyan)]/50 text-lg">%</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Precision</p>
                      <p className="text-2xl font-medium text-slate-300">{(model.precision * 100).toFixed(2)}<span className="text-slate-600 text-lg">%</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Recall</p>
                      <p className="text-2xl font-medium text-slate-300">{(model.recall * 100).toFixed(2)}<span className="text-slate-600 text-lg">%</span></p>
                    </div>
                  </div>

                  {/* Actions / Status */}
                  <div className="w-full lg:w-auto flex justify-between items-center lg:flex-col lg:items-end gap-3 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
                    {model.is_active ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] rounded-full text-xs font-bold border border-[var(--color-brand-green)]/30 uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,163,0.1)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-brand-green)] animate-pulse"></span> Active
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/50 text-slate-400 rounded-full text-xs font-medium border border-white/10 hover:border-white/30 hover:text-white transition-colors cursor-pointer uppercase tracking-wider">
                        <Circle size={10} /> Standby
                      </div>
                    )}

                    <button className="text-slate-400 hover:text-[var(--color-brand-green)] transition-colors p-2 bg-white/5 rounded-lg border border-white/10 hover:border-[var(--color-brand-green)]/50 group-hover:bg-[var(--color-brand-green)]/10">
                      <BarChart2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {models.length === 0 && (
            <div className="p-20 text-center glass-card border-dashed">
              <Activity size={48} className="mx-auto mb-6 text-slate-500" />
              <h3 className="text-2xl font-bold text-white mb-2">No Neural Models Active</h3>
              <p className="text-slate-400">Initialize the AutoML pipeline to train your first model.</p>
            </div>
          )}
        </div>
      )}
      
      {models.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-12 flex justify-end"
        >
          <button 
            onClick={() => navigate(`/dashboard`)}
            className="btn-secondary"
          >
            Launch System Dashboard <ChevronRight size={18} />
          </button>
        </motion.div>
      )}

      {/* Phase 4 Explainability Teaser Slot -> Real SHAP Values */}
      {models.length > 0 && shapData.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-20 p-8 rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden glass-card"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-cyan)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-2 bg-[var(--color-brand-cyan)]/10 rounded-lg">
                <BarChart2 className="text-[var(--color-brand-cyan)]" size={24} />
              </div>
              Feature Impact Analytics (SHAP)
            </h3>
            <p className="text-slate-400 max-w-2xl mb-8">
              This chart displays the global importance of each feature for the top performing model, calculated using SHAP (SHapley Additive exPlanations). Longer bars indicate features that most heavily influence the AI's churn predictions.
            </p>
            
            <div className="h-96 w-full mt-6 bg-black/20 p-6 rounded-2xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                  <XAxis type="number" stroke="#ffffff40" fontSize={12} tickFormatter={(val) => val.toFixed(2)} />
                  <YAxis dataKey="name" type="category" stroke="#ffffff80" fontSize={12} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050505', borderColor: '#ffffff20', borderRadius: '12px' }}
                    itemStyle={{ color: '#00F5A0', fontWeight: 'bold' }}
                    labelStyle={{ color: '#ffffff80', marginBottom: '4px' }}
                    formatter={(value: number) => [value.toFixed(4), 'Mean Absolute SHAP']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {shapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--color-brand-green)' : 'var(--color-brand-cyan)'} fillOpacity={0.8 + (0.2 * (1 - index/10))} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Actionable Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          className="mt-12 p-8 rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-black/80 to-yellow-500/5 relative overflow-hidden glass-card"
        >
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Lightbulb className="text-yellow-500" size={24} />
              </div>
              Strategic AI Recommendations
            </h3>
            <p className="text-slate-400 max-w-2xl mb-8">
              Based on the top churn drivers identified by the model, here are actionable strategies to improve retention.
            </p>
            
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-black/40 border border-white/10 rounded-xl p-5 hover:border-yellow-500/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1 tracking-wide">{rec.feature} Optimization</h4>
                    <p className="text-slate-400 leading-relaxed">{rec.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Customer Personas Clustering Teaser */}
      {clusters && clusters.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="mt-12 p-8 rounded-3xl border border-[var(--color-brand-cyan)]/20 bg-gradient-to-br from-black/80 to-[var(--color-brand-cyan)]/5 relative overflow-hidden glass-card"
        >
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="p-2 bg-[var(--color-brand-cyan)]/10 rounded-lg">
                <Users className="text-[var(--color-brand-cyan)]" size={24} />
              </div>
              Customer Personas (K-Means)
            </h3>
            <p className="text-slate-400 max-w-2xl mb-8">
              The AI has autonomously clustered your customer base into {clusters.length} distinct behavioral personas based on the high-dimensional data landscape.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {clusters.map((cluster, idx) => (
                <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-[var(--color-brand-cyan)]/50 transition-colors">
                  <h4 className="text-xl font-bold text-white mb-1">Persona {idx + 1}</h4>
                  <p className="text-slate-500 text-sm mb-4">{cluster.size} Customers</p>
                  
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-wider text-[var(--color-brand-cyan)] font-bold mb-2">Defining Traits</p>
                    {Object.entries(cluster.top_features).map(([feat, val]: [string, any], fIdx) => (
                      <div key={fIdx} className="flex flex-col">
                        <span className="text-sm text-slate-300 truncate">{feat}</span>
                        <div className="w-full bg-white/5 h-1.5 mt-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-[var(--color-brand-cyan)] h-full" 
                            style={{ width: `${Math.min(Math.abs(val) * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Embedded Data Explorer for What-If Simulator */}
      {models.length > 0 && targetColumn && columns.length > 0 && (
        <div className="mt-12">
          <DataExplorer projectId={id as string} columns={columns} targetColumn={targetColumn} />
        </div>
      )}
    </div>
  );
}
