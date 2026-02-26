'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { COLLABORATION_INTERESTS } from '@/lib/utils';

interface FiltersPanelProps {
  onApply: (filters: any) => void;
  initialFilters: any;
}

export function FiltersPanel({ onApply, initialFilters }: FiltersPanelProps) {
  const [options, setOptions] = useState<{ countries: string[]; universities: string[]; fields: string[] }>({
    countries: [], universities: [], fields: [],
  });
  const [filters, setFilters] = useState({
    country: initialFilters.country || '',
    university: initialFilters.university || '',
    mainField: initialFilters.mainField || '',
    collaborationInterest: initialFilters.collaborationInterest || '',
  });

  useEffect(() => {
    fetch('/api/filters').then((r) => r.json()).then(setOptions).catch(() => {});
  }, []);

  const handleReset = () => {
    const empty = { country: '', university: '', mainField: '', collaborationInterest: '' };
    setFilters(empty);
    onApply({});
  };

  return (
    <div className="card p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white text-sm">Filter Researchers</h3>
        <button onClick={handleReset} className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors">
          <X size={12} /> Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="label">Country</label>
          <select
            value={filters.country}
            onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}
            className="input text-sm"
          >
            <option value="">All countries</option>
            {options.countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Field</label>
          <select
            value={filters.mainField}
            onChange={(e) => setFilters((f) => ({ ...f, mainField: e.target.value }))}
            className="input text-sm"
          >
            <option value="">All fields</option>
            {options.fields.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="label">University</label>
          <select
            value={filters.university}
            onChange={(e) => setFilters((f) => ({ ...f, university: e.target.value }))}
            className="input text-sm"
          >
            <option value="">All universities</option>
            {options.universities.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Collaboration type</label>
          <select
            value={filters.collaborationInterest}
            onChange={(e) => setFilters((f) => ({ ...f, collaborationInterest: e.target.value }))}
            className="input text-sm"
          >
            <option value="">Any collaboration</option>
            {COLLABORATION_INTERESTS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <button onClick={() => onApply(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)))} className="btn-primary w-full text-sm">
        Apply Filters
      </button>
    </div>
  );
}
