'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BookOpen, Plus, X } from 'lucide-react';
import { ACADEMIC_FIELDS, COLLABORATION_INTERESTS, COUNTRIES } from '@/lib/utils';

export default function ProfileSetupPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    university: '',
    country: '',
    mainField: '',
    secondaryFields: [] as string[],
    researchLines: [] as string[],
    bio: '',
    orcidUrl: '',
    googleScholarUrl: '',
    personalWebsite: '',
    researchGateUrl: '',
    collaborationInterests: [] as string[],
  });
  const [researchInput, setResearchInput] = useState('');
  const [error, setError] = useState('');

  const toggleArrayItem = (field: 'secondaryFields' | 'collaborationInterests', value: string) => {
    setForm((f) => {
      const arr = f[field];
      return {
        ...f,
        [field]: arr.includes(value) ? arr.filter((i) => i !== value) : [...arr, value],
      };
    });
  };

  const addResearchLine = () => {
    if (researchInput.trim() && form.researchLines.length < 10) {
      setForm((f) => ({ ...f, researchLines: [...f.researchLines, researchInput.trim()] }));
      setResearchInput('');
    }
  };

  const removeResearchLine = (line: string) => {
    setForm((f) => ({ ...f, researchLines: f.researchLines.filter((l) => l !== line) }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.formErrors?.join(', ') || 'Validation error');
        return;
      }
      await update();
      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 mesh-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Set up your profile</h1>
            <p className="text-slate-400 text-sm">Step {step} of 3</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-indigo-500' : 'bg-slate-800'}`} />
          ))}
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-white mb-4">Basic Information</h2>
              <div>
                <label className="label">Full name *</label>
                <input className="input" placeholder="Dr. Jane Smith" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">University / Institution *</label>
                <input className="input" placeholder="MIT, Stanford, UCL..." value={form.university} onChange={(e) => setForm((f) => ({ ...f, university: e.target.value }))} />
              </div>
              <div>
                <label className="label">Country *</label>
                <select className="input" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea className="input resize-none" rows={3} placeholder="Brief description of your research background..." value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} maxLength={1000} />
              </div>
            </div>
          )}

          {/* Step 2: Research */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-white mb-4">Research Profile</h2>
              <div>
                <label className="label">Main field *</label>
                <select className="input" value={form.mainField} onChange={(e) => setForm((f) => ({ ...f, mainField: e.target.value }))}>
                  <option value="">Select field</option>
                  {ACADEMIC_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Secondary fields (select up to 5)</label>
                <div className="flex flex-wrap gap-2">
                  {ACADEMIC_FIELDS.filter((f) => f !== form.mainField).map((field) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => toggleArrayItem('secondaryFields', field)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                        form.secondaryFields.includes(field)
                          ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {field}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Research lines / topics</label>
                <div className="flex gap-2 mb-2">
                  <input
                    className="input flex-1"
                    placeholder="e.g. Machine Learning for Drug Discovery"
                    value={researchInput}
                    onChange={(e) => setResearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addResearchLine()}
                  />
                  <button type="button" onClick={addResearchLine} className="btn-secondary px-3">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.researchLines.map((line) => (
                    <span key={line} className="tag flex items-center gap-1.5">
                      {line}
                      <button onClick={() => removeResearchLine(line)} className="hover:text-rose-400 transition-colors">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Collaboration & Links */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold text-white mb-4">Collaboration & Links</h2>
              <div>
                <label className="label">Collaboration interests (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {COLLABORATION_INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleArrayItem('collaborationInterests', interest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                        form.collaborationInterests.includes(interest)
                          ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Google Scholar URL</label>
                  <input className="input text-sm" placeholder="https://scholar.google.com/..." value={form.googleScholarUrl} onChange={(e) => setForm((f) => ({ ...f, googleScholarUrl: e.target.value }))} />
                </div>
                <div>
                  <label className="label">ORCID URL</label>
                  <input className="input text-sm" placeholder="https://orcid.org/..." value={form.orcidUrl} onChange={(e) => setForm((f) => ({ ...f, orcidUrl: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Personal Website</label>
                  <input className="input text-sm" placeholder="https://..." value={form.personalWebsite} onChange={(e) => setForm((f) => ({ ...f, personalWebsite: e.target.value }))} />
                </div>
                <div>
                  <label className="label">ResearchGate</label>
                  <input className="input text-sm" placeholder="https://researchgate.net/..." value={form.researchGateUrl} onChange={(e) => setForm((f) => ({ ...f, researchGateUrl: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-secondary">
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={
                  (step === 1 && (!form.name || !form.university || !form.country)) ||
                  (step === 2 && !form.mainField)
                }
                className="btn-primary flex-1"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || form.collaborationInterests.length === 0}
                className="btn-primary flex-1"
              >
                {isSubmitting ? 'Creating profile...' : 'Complete profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
