import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BrainCircuit, ArrowLeft, Shield } from "lucide-react";

export default function AuthPage({ isLogin = true }: { isLogin?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual Auth logic here later
    console.log("Mock Auth Attempt:", { email, password });
    
    // Set the mock token that the FastAPI backend is expecting
    localStorage.setItem('token', 'mock-jwt-token');
    
    // Simulate successful login/register
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,_rgba(0,255,163,0.05)_0%,_transparent_70%)] blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_rgba(0,217,255,0.03)_0%,_transparent_70%)] blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10 mb-8">
        <Link to="/" className="group flex items-center text-slate-400 hover:text-[var(--color-brand-green)] transition-colors w-fit">
          <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" /> 
          Back to System Root
        </Link>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card p-10 relative"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-brand-green)] to-[var(--color-brand-cyan)] rounded-t-3xl opacity-50"></div>
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto bg-black/50 border border-[var(--color-brand-green)]/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,255,163,0.15)] relative">
            <div className="absolute inset-0 bg-[var(--color-brand-green)]/20 blur-xl rounded-full"></div>
            <BrainCircuit className="text-[var(--color-brand-green)] relative z-10" size={32} />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            {isLogin ? "System Access" : "Initialize Account"}
          </h2>
          <p className="text-slate-400 font-medium">
            {isLogin ? "Authenticate to access workspace neural nets." : "Deploy your secure AI workspace today."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider text-xs">Email Coordinate</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] transition-all placeholder:text-slate-600"
              placeholder="operator@company.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wider text-xs">Security Key</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] transition-all placeholder:text-slate-600"
              placeholder="••••••••••••"
            />
          </div>

          <button 
            type="submit"
            className="btn-primary w-full justify-center py-4 mt-4 text-lg"
          >
            {isLogin ? "Authenticate" : "Establish Link"}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-400 text-sm border-t border-white/10 pt-6">
          {isLogin ? (
            <p>No active link? <Link to="/register" className="text-[var(--color-brand-green)] hover:text-white font-bold transition-colors">Initialize account</Link></p>
          ) : (
            <p>Already established? <Link to="/login" className="text-[var(--color-brand-green)] hover:text-white font-bold transition-colors">Authenticate here</Link></p>
          )}
        </div>
        
        <div className="mt-6 flex justify-center items-center text-xs text-slate-500 font-mono gap-2">
          <Shield size={12} /> Encrypted Connection
        </div>
      </motion.div>
    </div>
  );
}
