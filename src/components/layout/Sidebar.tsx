'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard, Layers, Heart, MessageSquare,
  User, LogOut, BookOpen, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/feed', icon: Layers, label: 'Discover' },
  { href: '/matches', icon: Heart, label: 'Matches' },
  { href: '/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/favorites', icon: Star, label: 'Favorites' },
  { href: '/profile', icon: User, label: 'My Profile' },
];

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-950 border-r border-slate-800/50 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800/50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-bold text-white">Acad</span>
            <span className="font-display text-lg font-bold gradient-text">Match</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(isActive ? 'nav-link-active' : 'nav-link')}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {session?.user && (
        <div className="p-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3 mb-3">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || ''}
                width={36}
                height={36}
                className="rounded-full ring-2 ring-indigo-500/30"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                {session.user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
              <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
