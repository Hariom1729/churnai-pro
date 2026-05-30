import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function UploadData() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`http://localhost:8000/api/projects/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard'); // Go back to projects or to project details
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload dataset.');
    } finally {
      setIsUploading(false);
    }
  }, [id, navigate, token]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-400 hover:text-white mb-8 transition">
          <ArrowLeft size={16} className="mr-2" /> Back to Projects
        </button>
        
        <h1 className="text-3xl font-bold mb-2">Upload Dataset</h1>
        <p className="text-slate-400 mb-8">Upload your customer data (CSV) for project #{id}. We will automatically analyze it and prepare it for modeling.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-xl flex items-center text-red-200">
            <AlertCircle className="mr-3 text-red-500" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500 rounded-xl flex items-center text-green-200">
            <CheckCircle className="mr-3 text-green-500" />
            Dataset uploaded successfully! Redirecting...
          </div>
        )}

        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-900/20' : 'border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800'
          } ${isUploading || success ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />
          <UploadCloud size={64} className={`mb-6 ${isDragActive ? 'text-blue-400' : 'text-slate-500'}`} />
          
          {isUploading ? (
            <p className="text-xl font-medium">Uploading your data...</p>
          ) : isDragActive ? (
            <p className="text-xl font-medium text-blue-400">Drop the CSV file here...</p>
          ) : (
            <>
              <p className="text-xl font-medium mb-2">Drag & drop your CSV here</p>
              <p className="text-slate-500">or click to select a file from your computer</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
