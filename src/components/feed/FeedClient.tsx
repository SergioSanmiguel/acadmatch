'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProfileCard } from '@/components/cards/ProfileCard';
import { MatchModal } from '@/components/feed/MatchModal';
import { FiltersPanel } from '@/components/feed/FiltersPanel';
import { UserProfile } from '@/types';
import { SlidersHorizontal, RefreshCw, Search } from 'lucide-react';

export function FeedClient() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [matchModal, setMatchModal] = useState<{
    open: boolean; user: UserProfile | null; matchId: string | null;
  }>({ open: false, user: null, matchId: null });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  const loadFeed = useCallback(async (activeFilters = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(activeFilters as any).toString();
      const res = await fetch(`/api/feed${params ? `?${params}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data);
        setCurrentIndex(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const currentProfile = profiles[currentIndex];

  const handleSwipe = async (type: 'LIKE' | 'PASS') => {
    if (!currentProfile) return;

    try {
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: currentProfile.id, type }),
      });
      const data = await res.json();

      if (data.isMatch && data.match) {
        setMatchModal({ open: true, user: currentProfile, matchId: data.match.id });
      }
    } catch (err) {
      console.error('Swipe error:', err);
    }

    setCurrentIndex((i) => i + 1);
  };

  const handleFavorite = async (userId: string) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favoritedId: userId }),
      });
      const data = await res.json();
      setFavorites((prev) => {
        const next = new Set(prev);
        if (data.favorited) next.add(userId);
        else next.delete(userId);
        return next;
      });
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    loadFeed(newFilters);
    setShowFilters(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw size={20} className="animate-spin" />
          Finding researchers...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Search size={14} />
          {profiles.length - currentIndex} profiles remaining
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
          <button
            onClick={() => loadFeed(filters)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <FiltersPanel onApply={handleFilterChange} initialFilters={filters} />
      )}

      {/* Feed */}
      {!currentProfile ? (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h3 className="font-display text-xl font-bold text-white mb-2">
            You&apos;ve seen all profiles!
          </h3>
          <p className="text-slate-400 text-sm mb-5">
            Check back later or adjust your filters to discover more researchers.
          </p>
          <button onClick={() => loadFeed(filters)} className="btn-primary">
            Reload feed
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <ProfileCard
            key={currentProfile.id}
            profile={currentProfile}
            onLike={() => handleSwipe('LIKE')}
            onPass={() => handleSwipe('PASS')}
            onFavorite={() => handleFavorite(currentProfile.id)}
            isFavorited={favorites.has(currentProfile.id)}
          />
        </AnimatePresence>
      )}

      <MatchModal
        isOpen={matchModal.open}
        matchedUser={matchModal.user}
        matchId={matchModal.matchId}
        onClose={() => setMatchModal({ open: false, user: null, matchId: null })}
      />
    </div>
  );
}
