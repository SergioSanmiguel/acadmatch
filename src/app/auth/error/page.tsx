'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, BookOpen } from 'lucide-react';
import { Suspense } from 'react';

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get('error');

  const messages: Record<string, { title: string; desc: string }> = {
    NotAcademic: {
      title: 'Academic email required',
      desc: 'AcadMatch is exclusively for researchers with institutional email addresses (.edu, .ac.uk, etc.). Please sign in with your university account.',
    },
    OAuthSignin: {
      title: 'Sign in failed',
      desc: 'There was an issue connecting to Google. Please try again.',
    },
    default: {
      title: 'Authentication error',
      desc: 'Something went wrong during sign in. Please try again.',
    },
  };

  const msg = messages[error || 'default'] || messages.default;

  return (
    <div className="min-h-screen bg-slate-950 mesh-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md card p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle size={24} className="text-rose-400" />
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-3">{msg.title}</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">{msg.desc}</p>
        <Link href="/auth/signin" className="btn-primary inline-flex items-center gap-2">
          <BookOpen size={16} />
          Try again
        </Link>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <ErrorContent />
    </Suspense>
  );
}
