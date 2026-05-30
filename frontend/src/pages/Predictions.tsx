import React, { useEffect, useState } from 'react';
import { DownloadCloud, CheckCircle2, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Model {
  id: number;
  project_id: number;
  model_name: string;
  accuracy: number;
  f1_score: number;
  created_at: string;
}

export default function Predictions() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('http://localhost:8000/api/models', { headers });
      setModels(res.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPredictions = async (modelId: number) => {
    setDownloadingId(modelId);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const res = await axios.get(`http://localhost:8000/api/models/${modelId}/predict_batch`, { 
        headers,
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `batch_predictions_model_${modelId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading predictions:', error);
      alert('Failed to generate batch predictions. Check if your dataset is intact.');
    } finally {
      setDownloadingId(null);
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
          <PlayCircle className="text-[var(--color-brand-green)]" />
          Batch Predictions
        </h1>
        <p className="text-gray-400 mt-2">Generate and download predictions for your entire datasets in one click.</p>
      </div>

      {models.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center border border-white/5">
          <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">No Models Available</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Train a model in the Datasets hub first before you can run batch predictions.
          </p>
          <Link
            to="/datasets"
            className="inline-flex items-center gap-2 bg-[var(--color-brand-green)] text-black px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Go to Datasets
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/40 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Model Name</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Project ID</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">F1 Score</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {models.map((model, idx) => (
                  <motion.tr 
                    key={model.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-[var(--color-brand-green)]" />
                        <span className="text-white font-medium">{model.model_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {model.project_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-mono font-medium border border-[var(--color-brand-green)]/20">
                        {(model.f1_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDownloadPredictions(model.id)}
                        disabled={downloadingId === model.id}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-lg text-sm font-medium text-white transition-all"
                      >
                        {downloadingId === model.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <DownloadCloud size={16} />
                        )}
                        {downloadingId === model.id ? 'Generating...' : 'Download CSV'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
