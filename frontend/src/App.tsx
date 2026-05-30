import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, LayoutDashboard, Database, Activity, BarChart3, Settings, Bot } from "lucide-react";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ProjectDashboard from "./pages/ProjectDashboard";
import UploadData from "./pages/UploadData";
import DataAnalysis from "./pages/DataAnalysis";
import Leaderboard from "./pages/Leaderboard";

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Datasets', path: '/datasets', icon: Database },
  { name: 'Models', path: '/models', icon: Activity },
  { name: 'Predictions', path: '/predictions', icon: BarChart3 },
  { name: 'Assistant', path: '/assistant', icon: Bot },
  { name: 'Settings', path: '/settings', icon: Settings },
];

function Navbar() {
  const location = useLocation();
  // Don't show navbar on auth pages or landing page
  if (['/', '/login', '/register'].includes(location.pathname)) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-8 py-3 rounded-full">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center bg-black rounded-xl border border-[var(--color-brand-green)]/30 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--color-brand-green)]/20 blur-xl group-hover:bg-[var(--color-brand-green)]/40 transition-all duration-500"></div>
            <BrainCircuit className="text-[var(--color-brand-green)] relative z-10" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-glow transition-all duration-300">
            CHURN.AI
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            // Simplified active state check
            const isActive = location.pathname.includes(item.path) || 
                             (item.name === 'Dashboard' && location.pathname.includes('/project/'));
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                  ${isActive ? 'text-[var(--color-brand-green)]' : 'text-slate-400 hover:text-white'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-[var(--color-brand-green)]/10 border border-[var(--color-brand-green)]/30 rounded-full shadow-[0_0_15px_rgba(0,255,163,0.2)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={16} className="relative z-10" />
                <span className="relative z-10">{item.name}</span>
              </Link>
            )
          })}
        </div>
        
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[var(--color-brand-green)] transition-colors">
            <img src="https://ui-avatars.com/api/?name=User&background=00F5A0&color=000" alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </nav>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage />
          </motion.div>
        } />
        <Route path="/login" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthPage isLogin={true} />
          </motion.div>
        } />
        <Route path="/register" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuthPage isLogin={false} />
          </motion.div>
        } />
        <Route path="/dashboard" element={
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
            <ProjectDashboard />
          </motion.div>
        } />
        <Route path="/project/:id/upload" element={
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
            <UploadData />
          </motion.div>
        } />
        <Route path="/project/:id/dashboard" element={
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
            <DataAnalysis />
          </motion.div>
        } />
        <Route path="/project/:id/leaderboard" element={
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
            <Leaderboard />
          </motion.div>
        } />
        {/* Placeholder routes for the top nav */}
        <Route path="/datasets" element={<Navigate to="/dashboard" />} />
        <Route path="/models" element={<Navigate to="/dashboard" />} />
        <Route path="/predictions" element={<Navigate to="/dashboard" />} />
        <Route path="/assistant" element={<Navigate to="/dashboard" />} />
        <Route path="/settings" element={<Navigate to="/dashboard" />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}
