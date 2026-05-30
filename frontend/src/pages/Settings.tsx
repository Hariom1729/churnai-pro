import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, User, Key, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  gemini_api_key: string | null;
}

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('http://localhost:8000/api/users/me', { headers });
      setProfile(res.data);
      setName(res.data.name || '');
      setApiKey(res.data.gemini_api_key || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put('http://localhost:8000/api/users/me', {
        name: name,
        gemini_api_key: apiKey
      }, { headers });
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--color-brand-green)]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="text-[var(--color-brand-green)]" />
          Account Settings
        </h1>
        <p className="text-gray-400 mt-2">Manage your personal profile and API configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/20 font-medium flex items-center gap-3">
            <User size={18} /> Profile & Keys
          </button>
        </div>

        {/* Form Content */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="glass-card p-8 rounded-2xl border border-white/5 space-y-8">
            
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                <User size={20} className="text-gray-400" /> General Profile
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  disabled 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-500 focus:outline-none cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Your email is managed by your authentication provider.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-green)] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                <Key size={20} className="text-gray-400" /> API Configuration
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Google Gemini API Key</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-green)] transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required to generate Strategic Business Recommendations and use the AI Assistant. This key is stored securely.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button 
                type="submit" 
                disabled={saving}
                className="flex items-center gap-2 bg-[var(--color-brand-green)] text-black px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-[var(--color-brand-green)] text-sm font-medium"
                >
                  <CheckCircle2 size={18} />
                  {successMsg}
                </motion.div>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
