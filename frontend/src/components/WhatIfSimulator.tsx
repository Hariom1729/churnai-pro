import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, BarChart2, Zap, Save } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine } from 'recharts';
import { API_BASE_URL } from '../config';

interface WhatIfSimulatorProps {
  projectId: string;
  targetColumn: string;
  initialRowData: any;
  onClose: () => void;
}

export default function WhatIfSimulator({ projectId, targetColumn, initialRowData, onClose }: WhatIfSimulatorProps) {
  const [rowData, setRowData] = useState<any>(initialRowData);
  const [loading, setLoading] = useState(true);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [shapData, setShapData] = useState<any[]>([]);

  const fetchPrediction = async (dataToPredict: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE_URL}/api/projects/${projectId}/predict_row`, 
        { row_data: dataToPredict, target_column: targetColumn },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setPrediction(res.data.churn_probability);
      
      if (res.data.local_shap_values) {
        const shapArray = Object.entries(res.data.local_shap_values)
          .map(([name, value]) => ({ name, value: Number(value) }))
          .slice(0, 8); // Show top 8 for space
        setShapData(shapArray);
      }
    } catch (err) {
      console.error('Error in predict_row:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrediction(rowData);
  }, []);

  const handleInputChange = (col: string, value: string) => {
    // Attempt to convert to number if it looks like one, otherwise keep string
    const num = Number(value);
    const finalVal = isNaN(num) || value === '' ? value : num;
    setRowData((prev: any) => ({ ...prev, [col]: finalVal }));
  };

  const handleSimulate = () => {
    fetchPrediction(rowData);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-screen w-full md:w-[600px] bg-[#050505]/95 backdrop-blur-3xl border-l border-[var(--color-brand-cyan)]/30 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] z-50 overflow-y-auto"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Activity className="text-[var(--color-brand-green)]" />
                What-If Simulator
              </h2>
              <p className="text-slate-400 text-sm mt-1">Adjust features to see real-time churn impact</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10">
              <X className="text-slate-300" />
            </button>
          </div>

          <div className="glass-card p-6 mb-8 relative overflow-hidden border-[var(--color-brand-cyan)]/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-cyan)]/10 rounded-full blur-3xl"></div>
            <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-4">Predicted Churn Risk</h3>
            
            {loading && !prediction ? (
              <div className="h-16 flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-full border-4 border-t-[var(--color-brand-cyan)] border-[var(--color-brand-cyan)]/20 animate-spin"></div>
                <div className="text-[var(--color-brand-cyan)] font-mono">Running neural inference...</div>
              </div>
            ) : (
              <div className="flex items-end gap-4">
                <span className={`text-6xl font-black tracking-tighter ${(prediction || 0) > 0.5 ? 'text-red-400' : 'text-[var(--color-brand-green)]'} text-glow`}>
                  {((prediction || 0) * 100).toFixed(1)}%
                </span>
                <span className="text-slate-400 pb-2 font-medium">Probability</span>
              </div>
            )}
          </div>

          {shapData.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-[var(--color-brand-green)]" />
                Local Feature Impact (SHAP)
              </h3>
              <div className="h-64 w-full bg-black/40 rounded-xl p-4 border border-white/10">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono animate-pulse">Recalculating vectors...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shapData} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                      <XAxis type="number" stroke="#ffffff40" fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke="#ffffff80" fontSize={11} width={100} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#050505', borderColor: '#ffffff20', borderRadius: '8px' }}
                        itemStyle={{ color: '#00F5A0', fontWeight: 'bold' }}
                        formatter={(value: any) => [Number(value).toFixed(4), 'Impact']}
                      />
                      <ReferenceLine x={0} stroke="#ffffff40" />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                        {shapData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#ef4444' : 'var(--color-brand-green)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                <span className="text-red-400 font-bold">Red</span> increases churn risk. <span className="text-[var(--color-brand-green)] font-bold">Green</span> decreases churn risk.
              </p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                Tweak Variables
              </h3>
              <button 
                onClick={handleSimulate}
                disabled={loading}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Simulating...' : 'Run Simulation'}
              </button>
            </div>
            
            <div className="space-y-3">
              {Object.keys(rowData).filter(k => k !== targetColumn).map((col) => (
                <div key={col} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/20 transition-colors">
                  <label className="text-sm font-medium text-slate-300 w-1/2 truncate pr-4">{col}</label>
                  <input 
                    type="text" 
                    value={rowData[col] ?? ''} 
                    onChange={(e) => handleInputChange(col, e.target.value)}
                    className="w-1/2 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors text-right font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}