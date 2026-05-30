import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Filter, Database, FileSpreadsheet } from 'lucide-react';

interface DataExplorerProps {
  projectId: string;
  columns: string[];
}

export default function DataExplorer({ projectId, columns }: DataExplorerProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [globalFilter, setGlobalFilter] = useState('');

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
      // Global Search
      if (globalFilter) {
        const rowString = Object.values(row).join(' ').toLowerCase();
        if (!rowString.includes(globalFilter.toLowerCase())) {
          return false;
        }
      }
      
      // Column-specific filters
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Loading dataset for exploration...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-8 shadow-xl">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
        <div className="flex items-center">
          <Database className="text-indigo-400 mr-3" size={24} />
          <div>
            <h2 className="text-xl font-bold text-white">Data Explorer</h2>
            <p className="text-sm text-slate-400">Preview and filter your raw dataset before training</p>
          </div>
        </div>
        
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-500" />
          </div>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            placeholder="Search across all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-800 sticky top-0 z-10 shadow-md">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-3 font-semibold text-slate-300 border-b border-slate-700">
                  <div className="flex flex-col space-y-2">
                    <span>{col}</span>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <Filter size={12} className="text-slate-500" />
                      </div>
                      <input
                        type="text"
                        className="w-full bg-slate-900 border border-slate-700 rounded text-xs pl-6 pr-2 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        placeholder="Filter..."
                        value={filters[col] || ''}
                        onChange={(e) => handleFilterChange(col, e.target.value)}
                      />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredData.slice(0, 50).map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                {columns.map(col => (
                  <td key={col} className="px-4 py-3 text-slate-300">
                    {row[col] !== null ? String(row[col]) : <span className="text-slate-600 italic">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredData.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <FileSpreadsheet size={48} className="mx-auto mb-4 opacity-50" />
            <p>No rows match your current filters.</p>
          </div>
        )}
      </div>
      
      <div className="bg-slate-950/80 p-4 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
        <span>Showing top 50 matches (for performance)</span>
        <span>{filteredData.length} total rows matched</span>
      </div>
    </div>
  );
}
