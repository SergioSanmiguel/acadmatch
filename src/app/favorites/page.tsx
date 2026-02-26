import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, GraduationCap } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/signin');

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      favorited: {
        select: {
          id: true, name: true, image: true, university: true, country: true,
          mainField: true, collaborationInterests: true, bio: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white mb-1 flex items-center gap-3">
            <Star size={26} className="text-amber-400" />
            Favorites
          </h1>
          <p className="text-slate-400">{favorites.length} saved profiles</p>
        </div>

        {favorites.length === 0 ? (
          <div className="card p-12 text-center">
            <Star size={40} className="mx-auto mb-4 text-slate-700" />
            <h3 className="font-display text-xl font-bold text-white mb-2">No favorites yet</h3>
            <p className="text-slate-400 text-sm mb-6">Star profiles in the feed to save them here.</p>
            <Link href="/feed" className="btn-primary">Discover researchers</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favorites.map(({ favorited }) => (
              <div key={favorited.id} className="card p-5">
                <div className="flex items-start gap-4 mb-3">
                  {favorited.image ? (
                    <Image src={favorited.image} alt={favorited.name || ''} width={48} height={48} className="rounded-full ring-2 ring-amber-500/20 flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-700/50 flex items-center justify-center font-bold text-white flex-shrink-0">
                      {favorited.name?.[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{favorited.name}</p>
                    <p className="text-sm text-indigo-300">{favorited.mainField}</p>
                    <div className="flex gap-3 mt-1">
                      {favorited.university && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <GraduationCap size={10} /> {favorited.university}
                        </span>
                      )}
                      {favorited.country && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={10} /> {favorited.country}
                        </span>
                      )}
                    </div>
                  </div>
                  <Star size={14} className="text-amber-400 fill-current flex-shrink-0 mt-1" />
                </div>
                {favorited.bio && <p className="text-xs text-slate-400 line-clamp-2 mb-3">{favorited.bio}</p>}
                {favorited.collaborationInterests?.slice(0, 2).map((i) => (
                  <span key={i} className="tag-emerald mr-1.5">{i}</span>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
