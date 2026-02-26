'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, GraduationCap, ExternalLink, Star, BookOpen } from 'lucide-react';
import { UserProfile } from '@/types';
import { cn } from '@/lib/utils';

interface ProfileCardProps {
  profile: UserProfile;
  onLike: () => void;
  onPass: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
  dragControls?: any;
}

export function ProfileCard({
  profile,
  onLike,
  onPass,
  onFavorite,
  isFavorited,
}: ProfileCardProps) {
  return (
    <motion.div
      className="relative w-full max-w-md mx-auto"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="card overflow-hidden shadow-2xl">
        {/* Header with avatar */}
        <div className="relative bg-gradient-to-br from-indigo-900/50 to-slate-900 p-6 pb-4">
          <div className="flex items-start gap-4">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={profile.name || ''}
                width={72}
                height={72}
                className="rounded-full ring-2 ring-indigo-500/40 flex-shrink-0"
              />
            ) : (
              <div className="w-18 h-18 flex-shrink-0 w-[72px] h-[72px] rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-2xl font-bold text-white">
                {profile.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold text-white leading-tight">{profile.name}</h2>
                  {profile.mainField && (
                    <p className="text-indigo-300 text-sm font-medium mt-0.5">{profile.mainField}</p>
                  )}
                </div>
                {onFavorite && (
                  <button
                    onClick={onFavorite}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      isFavorited
                        ? 'text-amber-400 bg-amber-400/10'
                        : 'text-slate-600 hover:text-amber-400 hover:bg-amber-400/10'
                    )}
                  >
                    <Star size={16} fill={isFavorited ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {profile.university && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <GraduationCap size={12} />
                    {profile.university}
                  </span>
                )}
                {profile.country && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={12} />
                    {profile.country}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">{profile.bio}</p>
          )}

          {/* Research lines */}
          {profile.researchLines?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                <BookOpen size={12} />
                RESEARCH LINES
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.researchLines.slice(0, 4).map((line) => (
                  <span key={line} className="tag text-xs">{line}</span>
                ))}
              </div>
            </div>
          )}

          {/* Collaboration interests */}
          {profile.collaborationInterests?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">OPEN TO</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.collaborationInterests.slice(0, 3).map((interest) => (
                  <span key={interest} className="tag-emerald text-xs">{interest}</span>
                ))}
              </div>
            </div>
          )}

          {/* Secondary fields */}
          {profile.secondaryFields?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.secondaryFields.slice(0, 3).map((field) => (
                <span key={field} className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700">
                  {field}
                </span>
              ))}
            </div>
          )}

          {/* External links */}
          <div className="flex gap-3 pt-1">
            {profile.googleScholarUrl && (
              <a href={profile.googleScholarUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors">
                <ExternalLink size={10} /> Scholar
              </a>
            )}
            {profile.orcidUrl && (
              <a href={profile.orcidUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors">
                <ExternalLink size={10} /> ORCID
              </a>
            )}
            {profile.personalWebsite && (
              <a href={profile.personalWebsite} target="_blank" rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 transition-colors">
                <ExternalLink size={10} /> Website
              </a>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-4 pt-0 flex gap-3">
          <button
            onClick={onPass}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium text-sm transition-all duration-200 active:scale-95"
          >
            Not relevant
          </button>
          <button
            onClick={onLike}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all duration-200 active:scale-95"
          >
            Interested in collaborating ✨
          </button>
        </div>
      </div>
    </motion.div>
  );
}
