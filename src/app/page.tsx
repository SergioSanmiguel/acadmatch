import Link from 'next/link';
import { BookOpen, Users, Sparkles, ArrowRight, Globe, FlaskConical } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 mesh-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/50 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold">
              <span className="text-white">Acad</span>
              <span className="gradient-text">Match</span>
            </span>
          </div>
          <Link href="/auth/signin" className="btn-primary text-sm">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
            <Sparkles size={14} />
            Interdisciplinary Research Collaboration
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Find your next
            <br />
            <span className="gradient-text">research partner</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            AcadMatch connects university professors and researchers looking for
            interdisciplinary collaboration. Swipe, match, and build breakthrough science together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin" className="btn-primary flex items-center gap-2 justify-center text-base px-8 py-3.5">
              Get Started
              <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-secondary flex items-center gap-2 justify-center text-base px-8 py-3.5">
              How it works
            </a>
          </div>
        </div>
      </main>

      {/* Features */}
      <section id="how-it-works" className="px-8 py-20 border-t border-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-12">
            Built for academic collaboration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: 'Swipe & Match',
                desc: 'Browse researcher profiles in your area of interest. Express collaboration intent and get matched when it\'s mutual.',
              },
              {
                icon: Globe,
                title: 'Across disciplines',
                desc: 'Our algorithm prioritizes complementary fields — because the best science happens at intersections.',
              },
              {
                icon: FlaskConical,
                title: 'Real collaboration',
                desc: 'From co-authored papers to grant applications, define the type of collaboration you\'re looking for.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-indigo-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 px-8 py-6 text-center text-slate-600 text-sm">
        © {new Date().getFullYear()} AcadMatch. For researchers, by researchers.
      </footer>
    </div>
  );
}
