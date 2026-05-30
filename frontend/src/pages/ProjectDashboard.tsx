import React, { useState, useEffect } from 'react';
import { Plus, Database, FileDown, ArrowRight, Activity, Users, Target, ShieldCheck, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

export default function ProjectDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const currentToken = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    try {
      const currentToken = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/projects`, {
        project_name: newProjectName
      }, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setNewProjectName('');
      setShowCreate(false);
      fetchProjects();
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) return;
    
    try {
      const currentToken = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete workspace.');
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20 mt-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="lg:w-1/2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-semibold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-green)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brand-green)]"></span>
            </span>
            System Online
          </div>
          <h1 className="text-5xl lg:text-7xl font-black mb-6 leading-tight tracking-tighter">
            AI Co-Pilot for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
              Customer Churn
            </span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-lg leading-relaxed">
            Leverage AI-powered analytics to forecast trends, predict customer behavior strategically, and stay ahead of the market.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-16">
            <button 
              onClick={() => setShowCreate(true)}
              className="btn-primary"
            >
              <Plus size={18} />
              New Workspace
            </button>
            <button className="btn-secondary">
              <Activity size={18} />
              View Global Analytics
            </button>
          </div>

          <div className="flex gap-12 border-t border-white/10 pt-8">
            <div>
              <p className="text-slate-500 text-sm mb-1">Customers Analyzed</p>
              <p className="text-3xl font-bold text-white">2.4M<span className="text-[var(--color-brand-green)]">+</span></p>
            </div>
            <div>
              <p className="text-slate-500 text-sm mb-1">Predictions</p>
              <p className="text-3xl font-bold text-white">33M<span className="text-[var(--color-brand-green)]">+</span></p>
            </div>
            <div>
              <p className="text-slate-500 text-sm mb-1">Avg Accuracy</p>
              <p className="text-3xl font-bold text-white">94.2<span className="text-[var(--color-brand-green)]">%</span></p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="lg:w-1/2 relative"
        >
          {/* Abstract AI Illustration */}
          <div className="relative w-full aspect-square max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-green)]/20 to-transparent rounded-full blur-3xl mix-blend-screen animate-pulse"></div>
            
            <svg viewBox="0 0 400 400" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(0,255,163,0.3)]">
              <motion.path 
                d="M 50,200 C 100,50 300,350 350,200" 
                fill="none" 
                stroke="var(--color-brand-green)" 
                strokeWidth="2"
                strokeDasharray="10 5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.path 
                d="M 50,200 C 150,300 250,100 350,200" 
                fill="none" 
                stroke="var(--color-brand-cyan)" 
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Floating Nodes */}
              {[
                { cx: 100, cy: 120, r: 8, delay: 0 },
                { cx: 300, cy: 280, r: 12, delay: 0.5 },
                { cx: 200, cy: 200, r: 16, delay: 1 },
                { cx: 250, cy: 100, r: 6, delay: 1.5 },
                { cx: 150, cy: 300, r: 10, delay: 2 }
              ].map((node, i) => (
                <motion.circle 
                  key={i}
                  cx={node.cx} cy={node.cy} r={node.r}
                  fill="var(--color-bg-deep)"
                  stroke="var(--color-brand-green)"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, delay: node.delay, repeat: Infinity }}
                  className="filter drop-shadow-[0_0_8px_rgba(0,255,163,0.8)]"
                />
              ))}
            </svg>

            {/* Floating Glass Cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-10 right-0 glass-card p-4 flex items-center gap-3 border-[var(--color-brand-green)]/30"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-green)]/20 flex items-center justify-center">
                <Target className="text-[var(--color-brand-green)]" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Churn Risk</p>
                <p className="text-lg font-bold text-white">Reduced 40%</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-20 left-0 glass-card p-4 flex items-center gap-3 border-[var(--color-brand-cyan)]/30"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--color-brand-cyan)]/20 flex items-center justify-center">
                <ShieldCheck className="text-[var(--color-brand-cyan)]" size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Model Accuracy</p>
                <p className="text-lg font-bold text-white">Validated</p>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>

      {/* Projects Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Active Workspaces</h2>
            <p className="text-slate-400">Manage your predictive models and datasets.</p>
          </div>
        </div>

        {showCreate && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 glass-card p-8 border-[var(--color-brand-green)]/50 shadow-[0_0_30px_rgba(0,255,163,0.1)]"
          >
            <h2 className="text-xl mb-6 font-semibold flex items-center gap-2">
              <Plus className="text-[var(--color-brand-green)]" />
              Initialize New Workspace
            </h2>
            <form onSubmit={handleCreateProject} className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Workspace Name (e.g. Q3 Enterprise Churn)"
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-6 py-4 text-white focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none transition-all placeholder:text-slate-600"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <button type="submit" className="btn-primary py-4 px-8 justify-center">
                Initialize
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-8 py-4 bg-transparent border border-white/10 hover:bg-white/5 rounded-xl transition-colors font-medium text-slate-300">
                Cancel
              </button>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={project.id} 
              className="glass-card p-6 flex flex-col group cursor-pointer"
              onClick={() => navigate(project.dataset_name ? `/project/${project.id}/dashboard` : `/project/${project.id}/upload`)}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-[var(--color-brand-green)]/50 group-hover:bg-[var(--color-brand-green)]/10 transition-colors">
                  <Database className="text-slate-400 group-hover:text-[var(--color-brand-green)] transition-colors" size={24} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs text-slate-400">
                    ID: #{project.id.toString().padStart(4, '0')}
                  </div>
                  <button 
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg border border-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Workspace"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--color-brand-green)] transition-colors">{project.project_name}</h3>
              
              <div className="text-sm mb-8 flex-1">
                {project.dataset_name ? (
                  <div className="flex items-center text-slate-300 bg-white/5 inline-flex px-3 py-1.5 rounded-lg border border-white/5">
                    <FileDown size={14} className="mr-2 text-[var(--color-brand-green)]" /> 
                    <span className="truncate max-w-[200px]">{project.dataset_name}</span>
                  </div>
                ) : (
                  <span className="text-orange-400/80 flex items-center bg-orange-400/10 inline-flex px-3 py-1.5 rounded-lg border border-orange-400/20">
                    <span className="w-2 h-2 rounded-full bg-orange-400 mr-2 animate-pulse"></span>
                    Awaiting Dataset
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-5">
                <span className="text-xs text-slate-500 font-mono">{new Date(project.created_at).toLocaleDateString()}</span>
                <div className="flex items-center text-sm font-semibold text-[var(--color-brand-green)] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                  {project.dataset_name ? 'Open Analytics' : 'Upload Data'} 
                  <ArrowRight size={16} className="ml-2" />
                </div>
              </div>
            </motion.div>
          ))}
          
          {projects.length === 0 && !showCreate && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full py-24 flex flex-col items-center justify-center glass-card border-dashed border-2 border-white/10 hover:border-[var(--color-brand-green)]/50 transition-colors cursor-pointer"
              onClick={() => setShowCreate(true)}
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <Plus size={32} className="text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Workspaces Found</h3>
              <p className="text-slate-400 mb-6">Initialize your first workspace to start analyzing churn.</p>
              <button className="btn-primary">
                Initialize Workspace
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}