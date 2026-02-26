'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, X, Save, CheckCircle } from 'lucide-react';
import { ACADEMIC_FIELDS, COLLABORATION_INTERESTS, COUNTRIES } from '@/lib/utils';

interface UserData {
  id: string; name: string | null; email: string; image: string | null;
  university: string | null; country: string | null; mainField: string | null;
  secondaryFields: string[]; researchLines: string[]; bio: string | null;
  orcidUrl: string | null; googleScholarUrl: string | null;
  personalWebsite: string | null; researchGateUrl: string | null;
  collaborationInterests: string[];
}

export function ProfileEditClient({ user }: { user: UserData }) {
  const [form, setForm] = useState({
    name: user.name || '',
    university: user.university || '',
    country: user.country || '',
    mainField: user.mainField || '',
    secondaryFields: user.secondaryFields || [],
    researchLines: user.researchLines || [],
    bio: user.bio || '',
    orcidUrl: user.orcidUrl || '',
    googleScholarUrl: user.googleScholarUrl || '',
    personalWebsite: user.personalWebsite || '',
    researchGateUrl: user.researchGateUrl || '',
    collaborationInterests: user.collaborationInterests || [],
  });
  const [researchInput, setResearchInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const toggleArrayItem = (field: 'secondaryFields' | 'collaborationInterests', value: string) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((i) => i !== value) : [...f[field], value],
    }));
  };

  const addResearchLine = () => {
    if (researchInput.trim() && form.researchLines.length < 10) {
      setForm((f) => ({ ...f, researchLines: [...f.researchLines, researchInput.trim()] }));
      setResearchInput('');
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Validation error');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar + basic */}
      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6">
          {user.image ? (
            <Image src={user.image} alt="" width={72} height={72} className="rounded-full ring-2 ring-indigo-500/30" />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-indigo-700 flex items-center justify-center text-2xl font-bold text-white">
              {user.name?.[0]}
            </div>
          )}
          <div>
            <p className="font-semibold text-white">{user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">University</label>
            <input className="input" value={form.university} onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))} />
          </div>
          <div>
            <label className="label">Country</label>
            <select className="input" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Bio</label>
          <textarea className="input resize-none" rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} maxLength={1000} />
        </div>
      </div>

      {/* Research */}
      <div className="card p-6 space-y-5">
        <h3 className="font-display text-lg font-semibold text-white">Research</h3>
        <div>
          <label className="label">Main field</label>
          <select className="input" value={form.mainField} onChange={(e) => setForm((f) => ({ ...f, mainField: e.target.value }))}>
            {ACADEMIC_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Secondary fields</label>
          <div className="flex flex-wrap gap-2">
            {ACADEMIC_FIELDS.filter((f) => f !== form.mainField).map((field) => (
              <button key={field} type="button" onClick={() => toggleArrayItem('secondaryFields', field)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors border ${
                  form.secondaryFields.includes(field)
                    ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}>
                {field}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Research lines</label>
          <div className="flex gap-2 mb-2">
            <input className="input flex-1 text-sm" placeholder="Add a research topic" value={researchInput} onChange={(e) => setResearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addResearchLine()} />
            <button type="button" onClick={addResearchLine} className="btn-secondary px-3"><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {form.researchLines.map((line) => (
              <span key={line} className="tag flex items-center gap-1.5">{line}
                <button onClick={() => setForm((f) => ({ ...f, researchLines: f.researchLines.filter((l) => l !== line) }))} className="hover:text-rose-400"><X size={10} /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Collaboration */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold text-white mb-4">Collaboration Interests</h3>
        <div className="flex flex-wrap gap-2">
          {COLLABORATION_INTERESTS.map((interest) => (
            <button key={interest} type="button" onClick={() => toggleArrayItem('collaborationInterests', interest)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                form.collaborationInterests.includes(interest)
                  ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}>
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold text-white mb-4">Academic Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { field: 'googleScholarUrl', label: 'Google Scholar' },
            { field: 'orcidUrl', label: 'ORCID' },
            { field: 'personalWebsite', label: 'Personal Website' },
            { field: 'researchGateUrl', label: 'ResearchGate' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="label">{label}</label>
              <input className="input text-sm" placeholder="https://..." value={(form as any)[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      {error && <p className="text-rose-400 text-sm">{error}</p>}
      <button onClick={handleSave} disabled={isSubmitting} className="btn-primary flex items-center gap-2 w-full justify-center">
        {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> {isSubmitting ? 'Saving...' : 'Save changes'}</>}
      </button>
    </div>
  );
}
