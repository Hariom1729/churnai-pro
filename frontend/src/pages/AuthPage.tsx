import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BrainCircuit, ArrowLeft, Shield } from "lucide-react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

export default function AuthPage({ isLogin = true }: { isLogin?: boolean }) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get Firebase ID Token
      const token = await user.getIdToken();
      localStorage.setItem("token", token);
      
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to authenticate with Google");
    }
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

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-4 px-6 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-3"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
            Continue with Google
          </button>
        </div>

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
