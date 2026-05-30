import React, { useEffect, useState } from 'react';
import { Database, FileText, Upload, ChevronRight, Loader2, Table } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface Project {
  id: number;
  dataset_name: string;
  target_column: string;
  created_at: string;
}

export default function Datasets() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/api/projects`, { headers });
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = async (project: Project) => {
    setSelectedProject(project);
    setPreviewLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/api/projects/${project.id}/data`, { headers });
      // Just take the first 10 rows for preview
      setPreviewData(res.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching preview:', error);
      setPreviewData([]);
    } finally {
      setPreviewLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="text-[var(--color-brand-green)]" />
            Data Catalog
          </h1>
          <p className="text-gray-400 mt-2">Manage and preview all your uploaded datasets.</p>
        </div>
        <Link 
          to="/dashboard"
          className="flex items-center gap-2 bg-[var(--color-brand-green)] text-black px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Upload size={20} />
          New Dataset
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dataset List */}
        <div className="lg:col-span-1 space-y-4">
          {projects.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center border border-white/5">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Datasets Found</h3>
              <p className="text-sm text-gray-400">Upload a dataset to get started.</p>
            </div>
          ) : (
            projects.map(project => (
              <motion.button
                key={project.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSelectProject(project)}
                className={`w-full text-left glass-card p-5 rounded-2xl border transition-all ${
                  selectedProject?.id === project.id 
                    ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/5' 
                    : 'border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white truncate">{project.dataset_name}</h3>
                  <ChevronRight size={18} className="text-gray-500" />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    Target: <span className="text-[var(--color-brand-green)]">{project.target_column || 'Unset'}</span>
                  </span>
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Dataset Preview */}
        <div className="lg:col-span-2">
          {selectedProject ? (
            <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedProject.dataset_name}</h2>
                  <p className="text-sm text-gray-400 mt-1">Data Preview (First 10 Rows)</p>
                </div>
                <Link
                  to={`/project/${selectedProject.id}/dashboard`}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors"
                >
                  Analyze Dataset
                </Link>
              </div>
              
              <div className="flex-1 p-6 overflow-x-auto relative">
                {previewLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-green)]" />
                  </div>
                ) : previewData.length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-black/40">
                      <tr>
                        {Object.keys(previewData[0]).map((key) => (
                          <th key={key} className="px-6 py-4 whitespace-nowrap">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {previewData.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="px-6 py-4 text-gray-300 whitespace-nowrap">
                              {typeof val === 'number' ? val.toFixed(2).replace(/\.00$/, '') : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Table size={48} className="mb-4 opacity-50" />
                    <p>No preview data available.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-white/5 h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8">
              <Database size={64} className="text-gray-600 mb-6" />
              <h2 className="text-xl font-medium text-white mb-2">Select a Dataset</h2>
              <p className="text-gray-400">Choose a dataset from the list to preview its contents and structure.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}