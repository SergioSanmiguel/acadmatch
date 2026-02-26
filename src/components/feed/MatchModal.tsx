'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageSquare, X } from 'lucide-react';
import { UserProfile } from '@/types';

interface MatchModalProps {
  isOpen: boolean;
  matchedUser: UserProfile | null;
  matchId: string | null;
  onClose: () => void;
}

export function MatchModal({ isOpen, matchedUser, matchId, onClose }: MatchModalProps) {
  return (
    <AnimatePresence>
      {isOpen && matchedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative card p-8 max-w-sm w-full mx-4 text-center overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-rose-600/10 pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Matched icon */}
            <div className="relative flex justify-center mb-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center"
              >
                <Heart size={28} className="text-white" fill="white" />
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="font-display text-2xl font-bold text-white mb-1">
                It&apos;s a Match! 🎉
              </h2>
              <p className="text-slate-400 text-sm mb-5">
                You and <span className="text-white font-medium">{matchedUser.name}</span> are both interested in collaborating!
              </p>

              {matchedUser.image && (
                <div className="flex justify-center mb-5">
                  <Image
                    src={matchedUser.image}
                    alt={matchedUser.name || ''}
                    width={64}
                    height={64}
                    className="rounded-full ring-4 ring-indigo-500/30"
                  />
                </div>
              )}

              <p className="text-xs text-slate-500 mb-5">
                {matchedUser.mainField} · {matchedUser.university}
              </p>

              <div className="flex flex-col gap-3">
                {matchId && (
                  <Link href={`/messages/${matchId}`} className="btn-primary flex items-center justify-center gap-2">
                    <MessageSquare size={16} />
                    Send a message
                  </Link>
                )}
                <button onClick={onClose} className="btn-secondary text-sm">
                  Keep discovering
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
