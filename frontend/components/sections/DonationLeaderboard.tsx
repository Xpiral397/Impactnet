'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Trophy } from 'lucide-react';

const topDonors = [
  { rank: 1, name: 'Sarah Mitchell', role: 'Tech Philanthropist', country: 'United States', badge: 'Diamond', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', amount: 125000, trend: '+12%' },
  { rank: 2, name: 'Michael Chen', role: 'Software Engineer', country: 'Singapore', badge: 'Platinum', avatar: 'https://randomuser.me/api/portraits/men/46.jpg', amount: 98500, trend: '+8%' },
  { rank: 3, name: 'Amira Yusuf', role: 'Community Organizer', country: 'Nigeria', badge: 'Gold', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', amount: 87300, trend: '+10%' },
  { rank: 4, name: 'John Rivera', role: 'Entrepreneur', country: 'Mexico', badge: 'Silver', avatar: 'https://randomuser.me/api/portraits/men/72.jpg', amount: 76200, trend: '+6%' },
  { rank: 5, name: 'Lila Patel', role: 'Educator', country: 'India', badge: 'Bronze', avatar: 'https://randomuser.me/api/portraits/women/77.jpg', amount: 64800, trend: '+9%' },
];

function badgeGradient(badge: string) {
  switch (badge) {
    case 'Diamond':
      return 'from-cyan-300 via-white to-cyan-600';
    case 'Platinum':
      return 'from-slate-200 via-white to-slate-500';
    case 'Gold':
      return 'from-amber-300 via-white to-amber-600';
    case 'Silver':
      return 'from-zinc-200 via-white to-zinc-500';
    case 'Bronze':
      return 'from-orange-300 via-white to-amber-700';
    default:
      return 'from-emerald-300 via-white to-emerald-600';
  }
}

export default function DonationLeaderboard() {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 text-sm font-semibold">Top Supporters</span>
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">Leaders of Impact</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base mt-2">Meet the inspiring individuals creating real-world change this month.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topDonors.map((d, i) => (
            <motion.div
              key={d.rank}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-emerald-400 transition-all"
            >
              {/* Custom badge (top-left) */}
              <div className="absolute -top-2 -left-2 pointer-events-none">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide text-emerald-950 border border-emerald-100 bg-gradient-to-r ${badgeGradient(d.badge)}`}>
                  {d.badge}
                </div>
              </div>

              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-100">
                  <img src={d.avatar} alt={d.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{d.name}</h3>
                  <p className="text-sm text-slate-600 truncate">{d.role}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{d.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-700 font-bold text-lg">${d.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{d.trend} growth</p>
                </div>
              </div>

              {/* Progress */}
              <div className="relative h-2 bg-emerald-50 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-700"
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${(d.amount / 150000) * 100}%` } : { width: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.08 }}
                />
              </div>

              {/* Description */}
              <div className="mt-3 text-sm text-slate-600 leading-snug">
                {d.name.split(' ')[0]} has consistently contributed to impactful causes, inspiring others to follow in their footsteps and drive sustainable progress.
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
