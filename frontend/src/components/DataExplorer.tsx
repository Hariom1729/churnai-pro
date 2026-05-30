import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Filter, Database, FileSpreadsheet, Sparkles, ChevronRight, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import WhatIfSimulator from './WhatIfSimulator';

interface DataExplorerProps {
  projectId: string;
  columns: string[];
  targetColumn?: string;
}

export default function DataExplorer({ projectId, columns, targetColumn }: DataExplorerProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  
  const [selectedRowData, setSelectedRowData] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8000/api/projects/${projectId}/data`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data', err);
        setLoading(false);
      }
    };
    
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (globalFilter) {
        const rowString = Object.values(row).join(' ').toLowerCase();
        if (!rowString.includes(globalFilter.toLowerCase())) {
          return false;
        }
      }
      
      for (const col of Object.keys(filters)) {
        const filterVal = filters[col].toLowerCase();
        if (!filterVal) continue;
        
        const cellVal = String(row[col] ?? '').toLowerCase();
        if (!cellVal.includes(filterVal)) {
          return false;
        }
      }
      return true;
    });
  }, [data, filters, globalFilter]);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl glass-card p-16 flex flex-col items-center justify-center shadow-2xl">
        <div className="absolute inset-0 bg-[var(--color-brand-cyan)]/10 animate-pulse"></div>
        <div className="relative z-10 w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-[var(--color-brand-cyan)]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[var(--color-brand-cyan)] border-t-transparent rounded-full animate-spin"></div>
          <Database className="absolute inset-0 m-auto text-[var(--color-brand-cyan)]" size={24} />
        </div>
        <h3 className="relative z-10 text-xl font-bold text-white mb-2 tracking-wide">Connecting to Data Vectors</h3>
        <p className="relative z-10 text-slate-400 text-sm">Preparing high-dimensional space for exploration...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative mt-16"
    >
      {/* Decorative background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-brand-cyan)] to-[var(--color-brand-green)] rounded-3xl blur-xl opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-500"></div>
      
      <div className="relative glass-card rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,255,163,0.05)] flex flex-col border border-white/10">
        {/* Header Section */}
        <div className="relative p-6 border-b border-white/10 bg-black/40 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-4 z-20">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-cyan)]/10 border border-[var(--color-brand-cyan)]/30 flex items-center justify-center mr-4 shadow-inner">
              <Database className="text-[var(--color-brand-cyan)]" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center">
                Vector Explorer
                <Sparkles className="ml-2 text-[var(--color-brand-green)] opacity-80" size={18} />
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-medium">Query and inspect your high-dimensional records</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-80 group/search">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within/search:scale-110">
              <Search size={18} className="text-[var(--color-brand-cyan)]" />
            </div>
            <input
              type="text"
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-cyan)] focus:border-[var(--color-brand-cyan)] transition-all"
              placeholder="Omnisearch your dataset..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <thead className="bg-black/80 backdrop-blur-xl sticky top-0 z-30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <tr>
                {targetColumn && <th className="px-6 py-4 border-b border-white/10 w-24">Action</th>}
                <th className="px-6 py-4 border-b border-white/10 w-10"></th>
                {columns.map(col => (
                  <th key={col} className="px-6 py-4 font-bold text-slate-200 border-b border-white/10 tracking-wide">
                    <div className="flex flex-col space-y-3">
                      <span className="flex items-center text-[13px] font-bold text-white tracking-wider">
                        {col}
                      </span>
                      <div className="relative group/filter">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform group-focus-within/filter:text-[var(--color-brand-green)]">
                          <Filter size={14} className="text-slate-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          className="w-full bg-black/50 border border-white/10 rounded-lg text-xs pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-green)] transition-all"
                          placeholder="Filter vector..."
                          value={filters[col] || ''}
                          onChange={(e) => handleFilterChange(col, e.target.value)}
                        />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-transparent">
              {filteredData.slice(0, 100).map((row, idx) => (
                <tr 
                  key={idx} 
                  className="transition-all duration-200 hover:bg-[var(--color-brand-cyan)]/5 hover:shadow-[inset_4px_0_0_0_var(--color-brand-cyan)] cursor-crosshair"
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {targetColumn && (
                    <td className="px-6 py-4 text-center border-r border-white/5">
                      <button 
                        onClick={() => setSelectedRowData(row)}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 rounded text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1 border border-indigo-500/30"
                      >
                        <Target size={12} />
                        Simulate
                      </button>
                    </td>
                  )}
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs text-center border-r border-white/5">
                    {idx + 1}
                  </td>
                  {columns.map(col => (
                    <td key={col} className={`px-6 py-4 text-[13px] transition-colors ${hoveredRow === idx ? 'text-white' : 'text-slate-400'}`}>
                      {row[col] !== null ? (
                        <span className="font-medium">{String(row[col])}</span>
                      ) : (
                        <span className="text-slate-600 italic px-2 py-1 bg-white/5 rounded-md text-xs border border-white/5">null</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="p-20 flex flex-col items-center justify-center text-center bg-transparent">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                <FileSpreadsheet size={40} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Vectors Found</h3>
              <p className="text-slate-400 max-w-sm">We couldn't find any data points matching your current query parameters.</p>
              <button 
                onClick={() => { setFilters({}); setGlobalFilter(''); }}
                className="mt-6 px-6 py-2.5 bg-transparent border border-white/20 hover:border-[var(--color-brand-cyan)] text-white rounded-lg transition-colors text-sm font-medium"
              >
                Reset Query
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="relative z-20 bg-black/60 backdrop-blur-md border-t border-white/10 p-4 px-6 flex justify-between items-center text-[13px] font-medium text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-green)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-brand-green)]"></span>
            </span>
            <span className="text-white">Active Database Uplink</span>
          </div>
          <div className="flex items-center bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
            <span className="text-[var(--color-brand-cyan)] mr-2 font-bold">{filteredData.length}</span> 
            <span>records matched</span>
            <span className="mx-3 text-slate-700">|</span>
            <span>Displaying top {Math.min(filteredData.length, 100)}</span>
          </div>
        </div>
      </div>

      {selectedRowData && targetColumn && (
        <WhatIfSimulator 
          projectId={projectId}
          targetColumn={targetColumn}
          initialRowData={selectedRowData}
          onClose={() => setSelectedRowData(null)}
        />
      )}
    </motion.div>
  );
}
