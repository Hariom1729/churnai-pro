import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart2, ShieldCheck, Zap, BrainCircuit } from "lucide-react";

export default function LandingPage() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="w-full relative overflow-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto relative z-20">
        <div className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center bg-black rounded-xl border border-[var(--color-brand-green)]/30 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--color-brand-green)]/20 blur-xl group-hover:bg-[var(--color-brand-green)]/40 transition-all duration-500"></div>
            <BrainCircuit className="text-[var(--color-brand-green)] relative z-10" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-glow transition-all duration-300">
            CHURN.AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link to="/dashboard" className="btn-primary py-2 px-5 text-sm">
              Enter Hub
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-[var(--color-brand-green)] transition-colors">
                System Login
              </Link>
              <Link to="/register" className="btn-primary py-2 px-5 text-sm">
                Initialize Access
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] text-xs font-bold tracking-widest uppercase mb-8 shadow-[0_0_20px_rgba(0,255,163,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-green)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brand-green)]"></span>
            </span>
            Neural Engine Active
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]">
            Predict <span className="text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-brand-green)] to-[var(--color-brand-cyan)] text-glow">Churn</span> Before <br /> It Happens.
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Ingest raw customer data, orchestrate advanced machine learning pipelines autonomously, and extract actionable intelligence to retain your highest-value users.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {isLoggedIn ? (
              <Link to="/dashboard" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto justify-center">
                Access Dashboard <ArrowRight size={20} className="ml-2" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto justify-center">
                  Deploy Workspace <ArrowRight size={20} className="ml-2" />
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-10 py-4 w-full sm:w-auto justify-center">
                  View Documentation
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-40">
          <FeatureCard 
            icon={<Zap className="text-[var(--color-brand-green)]" size={28} />}
            title="AutoML Pipeline"
            description="Our architecture automatically vectorizes data and trains distributed models (XGBoost, LightGBM) to optimize prediction accuracy."
            delay={0.1}
          />
          <FeatureCard 
            icon={<BarChart2 className="text-[var(--color-brand-cyan)]" size={28} />}
            title="Explainable Analytics"
            description="Interpret neural pathways and understand exactly why a user might churn using SHAP feature impact visualization."
            delay={0.2}
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-[var(--color-brand-green)]" size={28} />}
            title="Encrypted Vault"
            description="Your dataset vectors are cryptographically secured. Access is managed via strict role-based authentication protocols."
            delay={0.3}
          />
        </div>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,_rgba(0,255,163,0.05)_0%,_transparent_70%)] blur-3xl"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-[radial-gradient(circle,_rgba(0,217,255,0.03)_0%,_transparent_70%)] blur-3xl"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYzAgMTEuMDQ2LTguOTU0IDIwLTIwIDIwcy0yMC04Ljk1NC0yMC0yMCA4Ljk1NC0yMCAyMC0yMCAyMCA4Ljk1NCAyMCAyMHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-20 mask-image:linear-gradient(to_bottom,transparent,black,transparent)"></div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8 }}
      className="glass-card p-8 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-green)]/0 to-[var(--color-brand-green)]/0 group-hover:from-[var(--color-brand-green)]/5 group-hover:to-transparent transition-all duration-500"></div>
      
      <div className="relative z-10">
        <div className="mb-6 w-14 h-14 bg-black/50 border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-[var(--color-brand-green)]/50 group-hover:shadow-[0_0_20px_rgba(0,255,163,0.2)] transition-all duration-300">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-[var(--color-brand-green)] transition-colors">{title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
