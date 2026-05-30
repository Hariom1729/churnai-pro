import React, { useState, useEffect } from 'react';
import { Plus, Database, Activity, FileDown, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      const res = await axios.get('http://localhost:8000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
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
      await axios.post('http://localhost:8000/api/projects', {
        project_name: newProjectName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewProjectName('');
      setShowCreate(false);
      fetchProjects();
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Workspaces</h1>
          <button 
            onClick={() => setShowCreate(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <Plus className="mr-2" size={18} />
            New Project
          </button>
        </div>

        {showCreate && (
          <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-xl">
            <h2 className="text-xl mb-4 font-semibold">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="flex gap-4">
              <input 
                type="text" 
                placeholder="e.g. Q3 SaaS Churn Data"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
              <button type="submit" className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition">
                Create
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition">
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{project.project_name}</h3>
                <Database className="text-slate-500" size={20} />
              </div>
              <div className="text-slate-400 text-sm mb-6 flex-1">
                {project.dataset_name ? (
                  <span className="text-green-400 flex items-center">
                    <FileDown size={14} className="mr-1" /> Dataset: {project.dataset_name}
                  </span>
                ) : (
                  <span className="text-orange-400">No dataset uploaded yet</span>
                )}
              </div>
              <div className="flex justify-between items-center mt-auto border-t border-slate-800 pt-4">
                <span className="text-xs text-slate-500">Created: {new Date(project.created_at).toLocaleDateString()}</span>
                {project.dataset_name ? (
                  <button 
                    onClick={() => navigate(`/project/${project.id}/dashboard`)}
                    className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                  >
                    Open Dashboard <ArrowRight size={14} className="ml-1" />
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate(`/project/${project.id}/upload`)}
                    className="flex items-center text-sm text-orange-400 hover:text-orange-300"
                  >
                    Upload Data <ArrowRight size={14} className="ml-1" />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {projects.length === 0 && !showCreate && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
              <Database size={48} className="mb-4 opacity-50" />
              <p>You haven't created any projects yet.</p>
              <button onClick={() => setShowCreate(true)} className="mt-4 text-blue-400 hover:underline">Create your first project</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
