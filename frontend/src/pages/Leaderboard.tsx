import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Activity, CheckCircle2, Circle, ChevronRight, BarChart2 } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

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
    <div className="w-full pb-20">
      <div className="flex justify-between items-center mb-10">
        <button onClick={() => navigate('/dashboard')} className="group flex items-center text-slate-400 hover:text-[var(--color-brand-green)] transition-colors">
          <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" /> Back to Workspaces
        </button>
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

      {/* Phase 4 Explainability Teaser Slot */}
      {models.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-20 p-8 rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-cyan)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <BarChart2 className="text-[var(--color-brand-cyan)]" /> Feature Impact Analytics (SHAP)
            </h3>
            <p className="text-slate-400 max-w-2xl">
              Model explainability and individual feature impact charts will be generated here in Phase 4, allowing you to interpret exactly why the AI makes specific predictions.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
