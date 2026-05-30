import React from 'react';
import { Book, FileText, Database, ShieldCheck, ArrowLeft, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Documentation() {
  return (
    <div className="min-h-screen bg-[#020202] text-slate-300">
      {/* Top Bar */}
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-black text-white mb-6">Data Preparation Guide</h1>
          <p className="text-lg text-slate-400 mb-12">
            Churn.AI's autonomous AutoML pipeline is designed to be highly resilient, but providing clean, well-formatted data will significantly improve your predictive accuracy. Below is the expected raw data schema.
          </p>

          <div className="space-y-12">
            
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <FileText className="text-[var(--color-brand-cyan)]" /> 1. Accepted Formats
              </h2>
              <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5">
                <p className="mb-4">Currently, the platform strictly accepts <code className="bg-black/50 text-[var(--color-brand-green)] px-2 py-1 rounded font-mono text-sm">.csv</code> files.</p>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>Maximum file size: <span className="text-white font-medium">50 MB</span></li>
                  <li>Encoding: <span className="text-white font-medium">UTF-8</span></li>
                  <li>Header row: <span className="text-white font-medium">Required</span> (First row must contain column names)</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Database className="text-[var(--color-brand-cyan)]" /> 2. Required Schema
              </h2>
              <p className="text-slate-400 mb-6">
                Your dataset should represent individual customer profiles. Each row is one customer. While the pipeline handles automated feature engineering, we highly recommend the following standard attributes:
              </p>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 border-b border-white/10 text-slate-300">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Column Name</th>
                      <th className="px-6 py-4 font-semibold">Data Type</th>
                      <th className="px-6 py-4 font-semibold">Description / Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-400">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-white">customerID</td>
                      <td className="px-6 py-4">String</td>
                      <td className="px-6 py-4">Unique identifier (e.g., "7590-VHVEG"). <span className="text-orange-400 text-xs block mt-1">Automatically dropped during training.</span></td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-white">tenure</td>
                      <td className="px-6 py-4">Integer</td>
                      <td className="px-6 py-4">Number of months the customer has stayed with the company.</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-white">MonthlyCharges</td>
                      <td className="px-6 py-4">Float</td>
                      <td className="px-6 py-4">The amount charged to the customer monthly (e.g., 29.85).</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-white">TotalCharges</td>
                      <td className="px-6 py-4">Float</td>
                      <td className="px-6 py-4">The total amount charged. Missing values are automatically imputed by the pipeline.</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-white">Contract</td>
                      <td className="px-6 py-4">Categorical</td>
                      <td className="px-6 py-4">The contract term (e.g., "Month-to-month", "One year", "Two year").</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-[var(--color-brand-green)] font-bold">Churn (Target)</td>
                      <td className="px-6 py-4">Categorical</td>
                      <td className="px-6 py-4">Whether the customer churned or not. Must be strictly "Yes" or "No", or 1 / 0.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <ShieldCheck className="text-[var(--color-brand-cyan)]" /> 3. Automated Preprocessing
              </h2>
              <div className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5 space-y-4">
                <p>You do not need to manually clean everything. Our system automatically performs:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-black/50 p-4 rounded-lg border border-white/5">
                    <h4 className="text-white font-bold mb-1">Missing Value Imputation</h4>
                    <p className="text-sm text-slate-400">Numeric columns use median imputation. Categorical columns use mode imputation.</p>
                  </div>
                  <div className="bg-black/50 p-4 rounded-lg border border-white/5">
                    <h4 className="text-white font-bold mb-1">Categorical Encoding</h4>
                    <p className="text-sm text-slate-400">One-Hot Encoding applied to low-cardinality features. Target Encoding for high-cardinality.</p>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
