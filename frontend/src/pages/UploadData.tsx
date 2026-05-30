import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, AlertCircle, ArrowLeft, Database, Sparkles, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

export default function UploadData() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [uploadMethod, setUploadMethod] = useState<'file' | 'link' | 'kaggle'>('file');
  const [linkUrl, setLinkUrl] = useState('');
  const [kaggleId, setKaggleId] = useState('');

  const token = localStorage.getItem('token');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Invalid format. Only CSV files are supported.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API_BASE_URL}/api/projects/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
          setUploadProgress(percentCompleted);
        }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/project/${id}/dashboard`);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to initialize dataset pipeline.');
    } finally {
      setIsUploading(false);
    }
  }, [id, navigate, token]);

  const onLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/api/projects/${id}/upload-link`, { url: linkUrl }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/project/${id}/dashboard`);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to fetch dataset from link.');
    } finally {
      setIsUploading(false);
    }
  };

  const onKaggleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kaggleId) return;

    setIsUploading(true);
    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/api/projects/${id}/upload-kaggle`, { identifier: kaggleId }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(`/project/${id}/dashboard`);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to fetch Kaggle dataset.');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div className="w-full flex flex-col items-center justify-center py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-3xl relative"
      >
        <button onClick={() => navigate('/dashboard')} className="group flex items-center text-slate-400 hover:text-[var(--color-brand-green)] mb-10 transition-colors">
          <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-brand-green)]/20 to-[var(--color-brand-cyan)]/20 border border-[var(--color-brand-green)]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,163,0.2)]">
            <Database className="text-[var(--color-brand-green)]" size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight flex items-center">
              Ingest Dataset
            </h1>
          </div>
        </div>
        
        <p className="text-slate-400 mb-10 text-lg leading-relaxed max-w-2xl">
          Upload your historical customer behavior logs (CSV) for Workspace #{id}. Our AI will instantly map schema relations, encode categories, and prepare vectors for modeling.
        </p>

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 glass-card border-red-500/50 bg-red-950/20 flex items-center text-red-300">
            <AlertCircle className="mr-3 text-red-500" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 glass-card border-[var(--color-brand-green)]/50 bg-[var(--color-brand-green)]/10 flex items-center text-[var(--color-brand-green)]">
            <CheckCircle className="mr-3 text-[var(--color-brand-green)]" />
            Dataset vectorized and ingested. Initializing Analytics Pipeline...
          </motion.div>
        )}

        <div className="flex gap-6 mb-8 border-b border-white/10 px-2">
          <button 
            onClick={() => setUploadMethod('file')} 
            className={`pb-4 px-2 -mb-[1px] border-b-2 font-semibold transition-colors ${uploadMethod === 'file' ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)]' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            Local File Upload
          </button>
          <button 
            onClick={() => setUploadMethod('link')} 
            className={`pb-4 px-2 -mb-[1px] border-b-2 font-semibold transition-colors ${uploadMethod === 'link' ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)]' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            Fetch from URL Link
          </button>
          <button 
            onClick={() => setUploadMethod('kaggle')} 
            className={`pb-4 px-2 -mb-[1px] border-b-2 font-semibold transition-colors ${uploadMethod === 'kaggle' ? 'border-[var(--color-brand-green)] text-[var(--color-brand-green)]' : 'border-transparent text-slate-400 hover:text-slate-300'}`}
          >
            Kaggle Dataset
          </button>
        </div>

        {uploadMethod === 'file' ? (
          <div className="relative group">
            {/* Animated glow border behind */}
          <div className={`absolute -inset-1 rounded-3xl blur-xl transition duration-1000 ${
            isDragActive ? 'bg-gradient-to-r from-[var(--color-brand-green)] to-[var(--color-brand-cyan)] opacity-70' 
            : 'bg-[var(--color-brand-green)] opacity-0 group-hover:opacity-20'
          }`}></div>

          <div 
            {...getRootProps()} 
            className={`relative glass-card border-2 border-dashed rounded-3xl p-20 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${
              isDragActive ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/5 scale-[1.02]' 
              : 'border-white/20 hover:border-[var(--color-brand-green)]/50 bg-black/40'
            } ${isUploading || success ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            
            {/* Grid background pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYzAgMTEuMDQ2LTguOTU0IDIwLTIwIDIwcy0yMC04Ljk1NC0yMC0yMCA4Ljk1NC0yMCAyMC0yMCAyMCA4Ljk1NCAyMCAyMHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-50"></div>
            
            <motion.div 
              animate={{ y: isDragActive ? [0, -10, 0] : 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative z-10"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 border border-white/10 backdrop-blur-xl transition-colors ${
                isDragActive ? 'bg-[var(--color-brand-green)]/20 shadow-[0_0_30px_rgba(0,255,163,0.5)] border-[var(--color-brand-green)]' 
                : 'bg-white/5 shadow-inner'
              }`}>
                <UploadCloud size={48} className={`${isDragActive ? 'text-[var(--color-brand-green)]' : 'text-slate-400'}`} />
              </div>
            </motion.div>
            
            {isUploading ? (
              <div className="w-full max-w-xs relative z-10 text-center">
                <p className="text-xl font-bold mb-4 text-white">Ingesting Pipeline...</p>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div 
                    className="h-full bg-[var(--color-brand-green)] shadow-[0_0_10px_rgba(0,255,163,0.8)] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-slate-400 mt-2 text-sm font-mono">{uploadProgress}% Complete</p>
              </div>
            ) : isDragActive ? (
              <div className="relative z-10 text-center">
                <p className="text-3xl font-bold text-[var(--color-brand-green)] mb-2 text-glow">Release to Ingest</p>
                <p className="text-[var(--color-brand-green)]/70">Connecting neural pathways...</p>
              </div>
            ) : (
              <div className="relative z-10 text-center">
                <p className="text-2xl font-bold text-white mb-3">Drag & drop raw dataset</p>
                <p className="text-slate-400 flex items-center justify-center gap-2">
                  or <span className="text-[var(--color-brand-green)] font-medium underline underline-offset-4 cursor-pointer">browse filesystem</span>
                </p>
                <div className="mt-8 flex gap-4 justify-center">
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-500">.CSV</span>
                  <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-500">Max 500MB</span>
                </div>
              </div>
            )}
          </div>
        </div>
        ) : uploadMethod === 'link' ? (
          <div className="relative group">
            <div className="absolute -inset-1 rounded-3xl blur-xl transition duration-1000 bg-[var(--color-brand-green)] opacity-0 group-hover:opacity-20"></div>
            <form onSubmit={onLinkSubmit} className="relative glass-card border border-white/10 rounded-3xl p-10 py-16 flex flex-col items-center justify-center bg-black/40">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 shadow-[0_0_20px_rgba(0,255,163,0.2)]">
              <LinkIcon size={32} className="text-[var(--color-brand-green)]" />
            </div>
            
            {isUploading ? (
              <div className="w-full max-w-xs relative z-10 text-center">
                <p className="text-xl font-bold mb-4 text-white animate-pulse">Fetching from URL...</p>
              </div>
            ) : (
              <>
                <p className="text-xl font-bold text-white mb-3">Paste public CSV URL</p>
                <p className="text-slate-400 mb-8 text-center max-w-md">Provide a direct download link to a public CSV file (e.g. raw GitHub content, open S3 bucket).</p>
                
                <div className="w-full max-w-lg flex gap-3">
                  <input 
                    type="url" 
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com/dataset.csv" 
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none transition-all placeholder:text-slate-600"
                    required
                  />
                  <button type="submit" className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/80 text-black font-bold py-4 px-8 rounded-xl transition-colors whitespace-nowrap">
                    Fetch Data
                  </button>
                </div>
              </>
            )}
            </form>
          </div>
        ) : (
          <div className="relative group">
            <div className="absolute -inset-1 rounded-3xl blur-xl transition duration-1000 bg-[var(--color-brand-green)] opacity-0 group-hover:opacity-20"></div>
            <form onSubmit={onKaggleSubmit} className="relative glass-card border border-white/10 rounded-3xl p-10 py-16 flex flex-col items-center justify-center bg-black/40">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 shadow-[0_0_20px_rgba(0,255,163,0.2)]">
              <Database size={32} className="text-[var(--color-brand-green)]" />
            </div>
            
            {isUploading ? (
              <div className="w-full max-w-xs relative z-10 text-center">
                <p className="text-xl font-bold mb-4 text-white animate-pulse">Downloading from Kaggle...</p>
                <p className="text-slate-400 text-sm">This may take a few minutes for large datasets.</p>
              </div>
            ) : (
              <>
                <p className="text-xl font-bold text-white mb-3">Import from Kaggle</p>
                <p className="text-slate-400 mb-8 text-center max-w-md">Enter the Kaggle dataset identifier (e.g. <span className="font-mono text-white">rashadrmammadov/customer-churn-dataset</span>). Only public datasets are supported.</p>
                
                <div className="w-full max-w-lg flex gap-3">
                  <input 
                    type="text" 
                    value={kaggleId}
                    onChange={(e) => setKaggleId(e.target.value)}
                    placeholder="username/dataset-name" 
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none transition-all placeholder:text-slate-600 font-mono"
                    required
                  />
                  <button type="submit" className="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/80 text-black font-bold py-4 px-8 rounded-xl transition-colors whitespace-nowrap">
                    Download
                  </button>
                </div>
              </>
            )}
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}