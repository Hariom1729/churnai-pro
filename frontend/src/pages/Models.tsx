import React, { useEffect, useState } from 'react';
import { Cpu, Network, BarChart3, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Model {
  id: number;
  project_id: number;
  model_name: string;
  accuracy: number;
  f1_score: number;
  created_at: string;
}

export default function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/api/models`, { headers });
      setModels(res.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--color-brand-green)]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Cpu className="text-[var(--color-brand-green)]" />
          Model Registry
        </h1>
        <p className="text-gray-400 mt-2">View and manage all machine learning models trained across your datasets.</p>
      </div>

      {models.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center border border-white/5">
          <Network className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">No Models Trained</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            You haven't trained any models yet. Go to one of your datasets and start an AutoML training job to generate models.
          </p>
          <Link
            to="/datasets"
            className="inline-flex items-center gap-2 bg-[var(--color-brand-green)] text-black px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Go to Datasets
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model, idx) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden"
            >
              {/* Top performer badge */}
              {idx === 0 && (
                <div className="absolute top-4 right-4 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-bold px-2 py-1 rounded-full border border-[var(--color-brand-green)]/20">
                  Best Overall
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Network className="text-[var(--color-brand-green)]" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{model.model_name.replace('Classifier', '')}</h3>
                  <p className="text-xs text-gray-400">Project ID: {model.project_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                    <BarChart3 size={12} /> Accuracy
                  </div>
                  <div className="text-white font-mono text-lg">
                    {(model.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-black/20 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                    <AlertCircle size={12} /> F1 Score
                  </div>
                  <div className="text-white font-mono text-lg">
                    {(model.f1_score * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <Link
                to={`/project/${model.project_id}/dashboard`}
                className="w-full block text-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors"
              >
                View Project
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}