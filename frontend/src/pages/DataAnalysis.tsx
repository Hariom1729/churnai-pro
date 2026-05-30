import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, BarChart3, Settings2, Activity, Database, Brain, Cpu, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DataExplorer from '../components/DataExplorer';
import { API_BASE_URL, WS_BASE_URL } from '../config';

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
        const res = await axios.get(`${API_BASE_URL}/api/projects/${id}/columns`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setColumns(res.data.columns);
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
      
      const ws = new WebSocket(`${WS_BASE_URL}/ws/train-progress/${id}`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setProgress(data);
        if (data.done) {
          setTimeout(() => {
            navigate(`/project/${id}/leaderboard`);
          }, 2000);
        }
      };

      await axios.post(`${API_BASE_URL}/api/projects/${id}/train`, 
        { target_column: targetColumn },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProgress({ status: 'Initializing neural pipeline...', progress: 0 });
    } catch (err) {
      console.error('Failed to start training:', err);
      alert('Failed to start training. See console.');
    }
  };

  // Pipeline Stages Visualization
  const pipelineStages = [
    { name: 'Dataset Loading', icon: Database, threshold: 0 },
    { name: 'Preprocessing', icon: Settings2, threshold: 25 },
    { name: 'Feature Engineering', icon: Cpu, threshold: 50 },
    { name: 'Model Training', icon: Brain, threshold: 75 },
    { name: 'Evaluation', icon: Activity, threshold: 95 },
    { name: 'Deployment', icon: Server, threshold: 100 },
  ];

  if (progress) {
    return (
      <div className="w-full max-w-5xl mx-auto py-12 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full glass-card p-12 border-[var(--color-brand-green)]/30 shadow-[0_0_50px_rgba(0,255,163,0.1)] relative overflow-hidden"
        >
          {/* Animated Background Rays */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--color-brand-green)]/10 via-transparent to-transparent opacity-50"></div>
          
          <div className="relative z-10 text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-[var(--color-brand-green)] tracking-tight text-glow">
              AutoML Intelligence Core
            </h2>
            <p className="text-slate-400 font-mono flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-brand-green)] animate-pulse"></span>
              {progress.error ? "Pipeline Terminated" : "Processing Neural Models"}
            </p>
          </div>
          
          {progress.error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12 p-6 bg-red-950/30 border border-red-500/50 rounded-2xl flex items-center justify-center text-red-400 gap-4">
              <AlertCircle size={28} />
              <span className="text-lg font-medium">{progress.status}</span>
            </motion.div>
          )}

          {!progress.error && (
            <div className="relative z-10 max-w-4xl mx-auto">
              {/* Dynamic Status Text */}
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[var(--color-brand-cyan)] font-mono text-sm mb-1 uppercase tracking-widest">Current Operation</p>
                  <p className="text-2xl font-bold text-white">{progress.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-black text-[var(--color-brand-green)] text-glow">{progress.progress}%</p>
                </div>
              </div>

              {/* Glowing Progress Bar */}
              <div className="w-full h-2 bg-black/50 rounded-full mb-16 border border-white/10 overflow-hidden relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-brand-cyan)] to-[var(--color-brand-green)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress}%` }}
                  transition={{ ease: "linear", duration: 0.5 }}
                >
                  <div className="absolute top-0 right-0 w-20 h-full bg-white/40 blur-[4px] -translate-y-1/2 rounded-full"></div>
                </motion.div>
              </div>

              {/* Node Pipeline Visualization */}
              <div className="flex justify-between relative">
                {/* Connecting Line */}
                <div className="absolute top-8 left-10 right-10 h-[2px] bg-white/10 -z-10"></div>
                <motion.div 
                  className="absolute top-8 left-10 h-[2px] bg-[var(--color-brand-green)] -z-10 shadow-[0_0_10px_var(--color-brand-green)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress}%` }}
                ></motion.div>

                {pipelineStages.map((stage, idx) => {
                  const isCompleted = progress.progress >= stage.threshold;
                  const isActive = progress.progress >= stage.threshold && (idx === pipelineStages.length - 1 || progress.progress < pipelineStages[idx + 1].threshold);
                  
                  return (
                    <div key={idx} className="flex flex-col items-center w-24 relative">
                      <motion.div 
                        initial={false}
                        animate={{ 
                          scale: isActive ? 1.2 : 1,
                          borderColor: isCompleted ? 'rgba(0,255,163,0.8)' : 'rgba(255,255,255,0.1)',
                          backgroundColor: isActive ? 'rgba(0,255,163,0.15)' : isCompleted ? 'rgba(0,255,163,0.05)' : 'rgba(0,0,0,0.5)',
                          boxShadow: isActive ? '0 0 30px rgba(0,255,163,0.4)' : 'none'
                        }}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center border backdrop-blur-md mb-4 transition-all duration-500`}
                      >
                        <stage.icon className={isCompleted ? 'text-[var(--color-brand-green)]' : 'text-slate-600'} size={24} />
                        
                        {/* Active pulsing rings */}
                        {isActive && !progress.done && (
                          <>
                            <span className="absolute inset-0 rounded-2xl border border-[var(--color-brand-green)] animate-ping opacity-20"></span>
                            <span className="absolute -inset-2 rounded-3xl border border-[var(--color-brand-cyan)] animate-pulse opacity-10"></span>
                          </>
                        )}
                      </motion.div>
                      <p className={`text-xs text-center font-medium ${isCompleted ? 'text-white' : 'text-slate-500'}`}>
                        {stage.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <AnimatePresence>
            {progress.done && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-16 text-center"
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/30 text-[var(--color-brand-green)] font-semibold shadow-[0_0_20px_rgba(0,255,163,0.2)]">
                  <CheckCircle2 size={20} />
                  Pipeline Execution Complete. Redirecting to Leaderboard...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/dashboard')} className="group flex items-center text-slate-400 hover:text-[var(--color-brand-green)] transition-colors">
          <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>
      </div>

      <div className="mb-12">
        <h1 className="text-4xl font-black mb-3 tracking-tight">Analytics Engine Initialization</h1>
        <p className="text-slate-400 text-lg">Define target parameters to ignite the AutoML pipeline for Workspace #{id}.</p>
      </div>

      {loading ? (
        <div className="glass-card p-24 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--color-brand-cyan)]/5 animate-pulse"></div>
          <div className="relative z-10 w-16 h-16 mb-6">
             <div className="absolute inset-0 border-4 border-[var(--color-brand-cyan)]/20 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-[var(--color-brand-cyan)] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-white relative z-10">Scanning Dataset Vectors...</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-8"
        >
          <div className="glass-card p-8 border-l-4 border-l-[var(--color-brand-green)]">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/20 flex items-center justify-center flex-shrink-0 mt-1 shadow-inner">
                <BarChart3 className="text-[var(--color-brand-green)]" size={28} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Target Variable Selection</h2>
                <p className="text-slate-400 mb-8 max-w-3xl leading-relaxed">
                  We successfully mapped <span className="text-white font-bold">{columns.length} features</span> in your dataset. Select the binary classification target you want the AI to predict (e.g., "Churn", "Purchased").
                </p>
                
                <div className="max-w-xl mb-8 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-brand-green)] to-[var(--color-brand-cyan)] rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
                  <select 
                    className="relative w-full bg-black/60 border border-white/10 rounded-xl px-5 py-4 text-white text-lg font-medium focus:outline-none focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] appearance-none cursor-pointer hover:bg-black/80 transition-colors"
                    value={targetColumn}
                    onChange={(e) => setTargetColumn(e.target.value)}
                  >
                    <option value="" disabled>Select prediction target...</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-[var(--color-brand-green)] border-r-[6px] border-r-transparent"></div>
                  </div>
                </div>

                <div className="p-5 bg-[var(--color-brand-cyan)]/10 border border-[var(--color-brand-cyan)]/20 rounded-xl flex items-start gap-4">
                  <Cpu className="text-[var(--color-brand-cyan)] mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-sm text-[var(--color-brand-cyan)]/90 leading-relaxed font-medium">
                    AutoML sequence will orchestrate Data Preprocessing, One-Hot Encoding, Missing Value Imputation, and execute distributed training of LightGBM, XGBoost, and Random Forest estimators concurrently.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              onClick={handleStartTraining}
              disabled={!targetColumn}
              className={`btn-primary px-8 py-4 text-lg ${!targetColumn ? 'opacity-50 cursor-not-allowed filter grayscale' : ''}`}
            >
              <Play className="mr-2 fill-current" size={20} />
              Ignite Training Sequence
            </button>
          </div>
          
          {/* Embedded Data Explorer */}
          {id && columns.length > 0 && (
            <DataExplorer projectId={id} columns={columns} />
          )}
        </motion.div>
      )}
    </div>
  );
}