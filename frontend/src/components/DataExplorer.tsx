import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Filter, Database, FileSpreadsheet, Sparkles, ChevronRight } from 'lucide-react';

interface DataExplorerProps {
  projectId: string;
  columns: string[];
}

export default function DataExplorer({ projectId, columns }: DataExplorerProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-16 flex flex-col items-center justify-center shadow-2xl">
        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
        <div className="relative z-10 w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <Database className="absolute inset-0 m-auto text-indigo-400" size={24} />
        </div>
        <h3 className="relative z-10 text-xl font-bold text-white mb-2 tracking-wide">Loading Dataset</h3>
        <p className="relative z-10 text-slate-400 text-sm">Preparing billions of bytes for exploration...</p>
      </div>
    );
  }

  return (
    <div className="group relative mt-10">
      {/* Decorative background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative bg-[#0b1120] border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Section */}
        <div className="relative p-6 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-4 z-20">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mr-4 shadow-inner">
              <Database className="text-indigo-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight flex items-center">
                Data Explorer
                <Sparkles className="ml-2 text-yellow-400 opacity-80" size={18} />
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-medium">Interact, filter, and inspect your raw data</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-80 group/search">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within/search:scale-110">
              <Search size={18} className="text-indigo-400" />
            </div>
            <input
              type="text"
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
              placeholder="Omnisearch your dataset..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <thead className="bg-slate-900/90 backdrop-blur-xl sticky top-0 z-30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]">
              <tr>
                <th className="px-6 py-4 border-b border-slate-700/50 w-10"></th>
                {columns.map(col => (
                  <th key={col} className="px-6 py-4 font-bold text-slate-200 border-b border-slate-700/50 tracking-wide">
                    <div className="flex flex-col space-y-3">
                      <span className="flex items-center text-[13px] uppercase tracking-wider text-indigo-200">
                        {col}
                      </span>
                      <div className="relative group/filter">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform group-focus-within/filter:text-indigo-400">
                          <Filter size={14} className="text-slate-500 transition-colors" />
                        </div>
                        <input
                          type="text"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                          placeholder="Filter column..."
                          value={filters[col] || ''}
                          onChange={(e) => handleFilterChange(col, e.target.value)}
                        />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 bg-slate-950/20">
              {filteredData.slice(0, 100).map((row, idx) => (
                <tr 
                  key={idx} 
                  className="transition-all duration-200 hover:bg-indigo-900/20 hover:shadow-[inset_4px_0_0_0_#6366f1]"
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs text-center border-r border-slate-800/30">
                    {idx + 1}
                  </td>
                  {columns.map(col => (
                    <td key={col} className={`px-6 py-4 text-[13px] transition-colors ${hoveredRow === idx ? 'text-indigo-100' : 'text-slate-300'}`}>
                      {row[col] !== null ? (
                        <span className="font-medium">{String(row[col])}</span>
                      ) : (
                        <span className="text-slate-600 italic px-2 py-1 bg-slate-900 rounded-md text-xs">null</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="p-20 flex flex-col items-center justify-center text-center bg-slate-900/20">
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-700">
                <FileSpreadsheet size={40} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Matching Records</h3>
              <p className="text-slate-400 max-w-sm">We couldn't find any rows matching your current filter criteria. Try adjusting your search parameters.</p>
              <button 
                onClick={() => { setFilters({}); setGlobalFilter(''); }}
                className="mt-6 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium border border-slate-600"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="relative z-20 bg-slate-900 border-t border-slate-800/80 p-4 px-6 flex justify-between items-center text-[13px] font-medium text-slate-400 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.5)]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Data Connection</span>
          </div>
          <div className="flex items-center bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800">
            <span className="text-indigo-400 mr-2 font-bold">{filteredData.length}</span> 
            <span>rows matched</span>
            <span className="mx-3 text-slate-700">|</span>
            <span>Showing top {Math.min(filteredData.length, 100)} rows</span>
          </div>
        </div>
      </div>
    </div>
  );
}
