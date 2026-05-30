import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart2, ShieldCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          ChurnAI Pro
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium hover:text-indigo-400 transition-colors">
            Log in
          </Link>
          <Link to="/register" className="px-4 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-slate-200 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Predict Churn Before <br /> It Happens.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Upload your customer data, automatically train advanced machine learning models, and get actionable business insights to retain your highest-value users.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all">
              Start Free Trial <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32 text-left">
          <FeatureCard 
            icon={<Zap className="text-yellow-400" size={24} />}
            title="AutoML Engine"
            description="Our system automatically cleans data and trains multiple models (XGBoost, LightGBM) to find the best fit."
          />
          <FeatureCard 
            icon={<BarChart2 className="text-blue-400" size={24} />}
            title="Explainable AI"
            description="Understand exactly why a customer might churn using SHAP feature importance analytics."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-green-400" size={24} />}
            title="Enterprise Security"
            description="Your data is encrypted and secure. Manage team access with robust role-based authentication."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl"
    >
      <div className="mb-4 p-3 bg-white/[0.05] inline-block rounded-lg">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
