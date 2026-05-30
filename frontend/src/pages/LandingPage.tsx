import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart2, ShieldCheck, Zap, BrainCircuit, Activity, Database, Key, Server, Target, Users, PlayCircle, Layers, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="w-full relative overflow-hidden bg-[#020202]">
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
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative z-10">
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
            {isLoggedIn ? (
              <Link to="/dashboard" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto justify-center">
                Access Dashboard <ArrowRight size={20} className="ml-2" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-10 py-4 w-full sm:w-auto justify-center">
                  Deploy Workspace <ArrowRight size={20} className="ml-2" />
                </Link>
                <Link to="/docs" className="btn-secondary text-lg px-10 py-4 w-full sm:w-auto justify-center">
                  View Documentation
                </Link>
              </>
            )}
          </div>
        </motion.div>

        {/* Hero Mock Dashboard UI */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-brand-green)] to-[var(--color-brand-cyan)] rounded-2xl blur opacity-20"></div>
          <div className="relative glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-black/80">
            {/* Window header */}
            <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <div className="mx-auto text-xs font-mono text-gray-500 flex items-center gap-2"><Server size={12}/> neural-cluster-01</div>
            </div>
            {/* Window body */}
            <div className="p-8 grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="h-6 w-1/3 bg-white/5 rounded"></div>
                <div className="h-4 w-full bg-white/5 rounded"></div>
                <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                
                <div className="mt-8 flex gap-4">
                  <div className="flex-1 h-32 bg-gradient-to-t from-[var(--color-brand-green)]/20 to-transparent border-b-2 border-[var(--color-brand-green)] rounded-t-lg"></div>
                  <div className="flex-1 h-24 bg-gradient-to-t from-[var(--color-brand-cyan)]/20 to-transparent border-b-2 border-[var(--color-brand-cyan)] rounded-t-lg mt-8"></div>
                  <div className="flex-1 h-40 bg-gradient-to-t from-[var(--color-brand-green)]/20 to-transparent border-b-2 border-[var(--color-brand-green)] rounded-t-lg -mt-8"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                  <p className="text-xs text-gray-400 mb-1">Peak Model Accuracy</p>
                  <p className="text-3xl font-bold text-white">94.2<span className="text-[var(--color-brand-green)]">%</span></p>
                </div>
                <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                  <p className="text-xs text-gray-400 mb-1">High Risk Profiles</p>
                  <p className="text-3xl font-bold text-white">1,204</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Social Proof / Logo Cloud */}
      <section className="border-y border-white/5 bg-black/40 relative z-10 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 font-medium tracking-widest uppercase mb-8">Trusted by Data Teams Worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale">
            <div className="flex items-center gap-2 text-xl font-bold"><Zap /> Acme Corp</div>
            <div className="flex items-center gap-2 text-xl font-bold"><Layers /> GlobalTech</div>
            <div className="flex items-center gap-2 text-xl font-bold"><Target /> Nexus Systems</div>
            <div className="flex items-center gap-2 text-xl font-bold"><Activity /> Pulse AI</div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Workflow */}
      <section className="py-32 relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">From Raw Data to Retention in Minutes.</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">No complex engineering required. Our platform automates the entire machine learning lifecycle.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[var(--color-brand-green)]/10 via-[var(--color-brand-cyan)]/50 to-[var(--color-brand-green)]/10 -translate-y-1/2 -z-10"></div>
          
          {[
            { step: '01', title: 'Ingest Data', desc: 'Securely upload your customer behavior and subscription history via CSV.', icon: <Database className="text-[var(--color-brand-cyan)]" /> },
            { step: '02', title: 'AutoML Engine', desc: 'Our neural engine autonomously tests hundreds of hyperparameter combinations.', icon: <BrainCircuit className="text-[var(--color-brand-green)]" /> },
            { step: '03', title: 'Extract Insights', desc: 'Download batch predictions and generate strategic interventions instantly.', icon: <BarChart2 className="text-[var(--color-brand-cyan)]" /> }
          ].map((item, i) => (
            <div key={i} className="glass-card p-8 text-center relative border border-white/5 bg-black/60 rounded-2xl group hover:border-[var(--color-brand-green)]/30 transition-colors">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center font-mono font-bold text-[var(--color-brand-green)] shadow-lg z-20">
                {item.step}
              </div>
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Deep-Dives */}
      <section className="py-20 relative z-10 max-w-7xl mx-auto px-6 space-y-32">
        {/* Feature 1 */}
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-green)]/10 flex items-center justify-center mb-6 border border-[var(--color-brand-green)]/20">
              <Zap className="text-[var(--color-brand-green)]" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">State-of-the-art <br/><span className="text-[var(--color-brand-green)]">AutoML Pipeline.</span></h2>
            <p className="text-lg text-gray-400 mb-6 leading-relaxed">
              We leverage advanced ensemble architectures like XGBoost and LightGBM to extract maximum signal from your noise. Missing values, categorical encoding, and feature scaling are handled autonomously.
            </p>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3"><CheckCircle2 className="text-[var(--color-brand-green)]" size={20} /> Zero-configuration training environment</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-[var(--color-brand-green)]" size={20} /> Automated hyperparameter optimization</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-[var(--color-brand-green)]" size={20} /> Model registry and version control</li>
            </ul>
          </div>
          <div className="md:w-1/2 w-full">
            <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-2xl relative">
              <div className="absolute top-4 right-4 animate-pulse"><Activity className="text-[var(--color-brand-green)]" /></div>
              <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                <code className="language-python">
                  <span className="text-purple-400">import</span> churnai<br/><br/>
                  <span className="text-gray-500"># The pipeline operates autonomously</span><br/>
                  engine = churnai.NeuralEngine(data=dataset)<br/>
                  model = engine.train_distributed()<br/><br/>
                  <span className="text-blue-400">print</span>(f<span className="text-green-300">"Optimal F1 Score: </span><span className="text-orange-300">{'{model.f1}'}</span><span className="text-green-300">"</span>)<br/>
                  <span className="text-gray-500"># Output: Optimal F1 Score: 0.942</span>
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-16">
          <div className="md:w-1/2">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-cyan)]/10 flex items-center justify-center mb-6 border border-[var(--color-brand-cyan)]/20">
              <BarChart2 className="text-[var(--color-brand-cyan)]" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">Crystal Clear <br/><span className="text-[var(--color-brand-cyan)]">Explainability.</span></h2>
            <p className="text-lg text-gray-400 mb-6 leading-relaxed">
              Never trust a black box. Our platform uses SHAP (SHapley Additive exPlanations) to break down exactly which features are driving churn at a macroscopic level.
            </p>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3"><CheckCircle2 className="text-[var(--color-brand-cyan)]" size={20} /> Global feature importance charts</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-[var(--color-brand-cyan)]" size={20} /> Impact directionality (positive/negative)</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-[var(--color-brand-cyan)]" size={20} /> AI-powered strategic recommendations</li>
            </ul>
          </div>
          <div className="md:w-1/2 w-full">
            <div className="glass-card p-6 rounded-2xl border border-white/5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-mono">MonthlyCharges</span>
                <div className="w-2/3 h-3 bg-red-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[80%] rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-mono">Contract_Two_Year</span>
                <div className="w-2/3 h-3 bg-green-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[60%] rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-mono">Tenure</span>
                <div className="w-2/3 h-3 bg-green-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[45%] rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 font-mono">TechSupport_No</span>
                <div className="w-2/3 h-3 bg-red-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[70%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[var(--color-brand-green)]/10 to-[var(--color-brand-cyan)]/10 border border-white/10 rounded-3xl p-12 grid md:grid-cols-3 gap-8 text-center backdrop-blur-md">
            <div>
              <p className="text-5xl font-black text-white mb-2">94.2<span className="text-[var(--color-brand-green)]">%</span></p>
              <p className="text-gray-400 font-medium">Peak Prediction Accuracy</p>
            </div>
            <div>
              <p className="text-5xl font-black text-white mb-2">10<span className="text-[var(--color-brand-cyan)]">x</span></p>
              <p className="text-gray-400 font-medium">Faster Model Deployment</p>
            </div>
            <div>
              <p className="text-5xl font-black text-white mb-2">0</p>
              <p className="text-gray-400 font-medium">Lines of Code Required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/60 pt-20 pb-10 relative z-10 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-green)]/20 flex items-center justify-center border border-[var(--color-brand-green)]/30">
                  <BrainCircuit className="text-[var(--color-brand-green)]" size={16} />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">CHURN.AI</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                The most advanced predictive analytics platform for proactive customer retention and intelligence.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">AutoML Engine</li>
                <li className="hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">Explainability</li>
                <li className="hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">Batch Predictions</li>
                <li className="hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">Integrations</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">Documentation</li>
                <li className="hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">API Reference</li>
                <li className="hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">Case Studies</li>
                <li className="hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">Careers</li>
                <li className="hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">Security</li>
                <li className="hover:text-[var(--color-brand-green)] cursor-pointer transition-colors">Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
            <p>&copy; {new Date().getFullYear()} ChurnAI Technologies, Inc. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,_rgba(0,255,163,0.05)_0%,_transparent_70%)] blur-3xl"></div>
        <div className="absolute top-[40%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-[radial-gradient(circle,_rgba(0,217,255,0.03)_0%,_transparent_70%)] blur-3xl"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYzAgMTEuMDQ2LTguOTU0IDIwLTIwIDIwcy0yMC04Ljk1NC0yMC0yMCA4Ljk1NC0yMCAyMC0yMCAyMCA4Ljk1NCAyMCAyMHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] opacity-20 mask-image:linear-gradient(to_bottom,transparent,black,transparent)"></div>
      </div>
    </div>
  );
}
