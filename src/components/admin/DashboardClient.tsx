'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  getActiveEvent,
  getAllCategories,
  getAllNominees,
  getVoteCount,
  getVotes,
} from '@/lib/firestore';
import { Trophy, Tag, Users, Vote, Download, TrendingUp } from 'lucide-react';
import type { AnimeEvent, Vote as VoteType } from '@/lib/types';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  preparation: 'Préparation',
  voting_open: 'Votes ouverts',
  voting_closed: 'Votes fermés',
  results_published: 'Résultats publiés',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-[#9a8870] bg-gray-400/10',
  preparation: 'text-amber-400 bg-amber-400/10',
  voting_open: 'text-green-400 bg-green-400/10',
  voting_closed: 'text-red-400 bg-red-400/10',
  results_published: 'text-blue-400 bg-blue-400/10',
};

export default function DashboardClient() {
  const locale = useLocale();
  const [event, setEvent] = useState<AnimeEvent | null>(null);
  const [voteCount, setVoteCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [nomineeCount, setNomineeCount] = useState(0);
  const [recentVotes, setRecentVotes] = useState<VoteType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ev = await getActiveEvent();
        setEvent(ev);
        if (ev) {
          const [cats, nominees, count, votes] = await Promise.all([
            getAllCategories(ev.id),
            getAllNominees(ev.id),
            getVoteCount(ev.id),
            getVotes(ev.id),
          ]);
          setCategoryCount(cats.length);
          setNomineeCount(nominees.length);
          setVoteCount(count);
          setRecentVotes(
            votes
              .sort((a, b) => new Date(b.votedAt).getTime() - new Date(a.votedAt).getTime())
              .slice(0, 10)
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExport = async () => {
    if (!event) return;
    const res = await fetch(`/api/admin/export?eventId=${event.id}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anime-awards-2026-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Votes total', value: voteCount, icon: Vote, color: 'from-purple-600 to-purple-800' },
    { label: 'Catégories', value: categoryCount, icon: Tag, color: 'from-pink-600 to-pink-800' },
    { label: 'Nominés', value: nomineeCount, icon: Users, color: 'from-amber-600 to-amber-800' },
    { label: 'Statut', value: event ? STATUS_LABELS[event.status] : '—', icon: TrendingUp, color: 'from-green-600 to-green-800' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          <span className="gradient-text">Dashboard</span>
        </h1>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-[#c9a227] hover:bg-[#9e7c1e] text-white rounded-xl text-sm font-medium transition-all"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Event status */}
      {event && (
        <div className="bg-[#0f0d09] border border-[#2a1e0a] rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-[#665544]">Événement actif</p>
            <p className="font-bold text-white">{event.name}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[event.status]}`}
          >
            {STATUS_LABELS[event.status]}
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#0f0d09] border border-[#2a1e0a] rounded-2xl p-5">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}
            >
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
            <p className="text-xs text-[#665544] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { href: `/${locale}/admin/categories`, label: 'Gérer les catégories', icon: Tag },
          { href: `/${locale}/admin/nominees`, label: 'Gérer les nominés', icon: Users },
          { href: `/${locale}/admin/settings`, label: 'Paramètres', icon: Trophy },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 bg-[#0f0d09] border border-[#2a1e0a] hover:border-[#c9a227]/50 rounded-xl p-4 text-gray-300 hover:text-white transition-all group"
          >
            <item.icon className="w-5 h-5 text-[#c9a227]" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent votes */}
      {recentVotes.length > 0 && (
        <div className="bg-[#0f0d09] border border-[#2a1e0a] rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4">Derniers votes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#665544] border-b border-[#2a1e0a]">
                  <th className="pb-3 text-left font-medium">Votant</th>
                  <th className="pb-3 text-left font-medium">Email</th>
                  <th className="pb-3 text-left font-medium">Pays</th>
                  <th className="pb-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2e]">
                {recentVotes.map((vote) => (
                  <tr key={vote.id}>
                    <td className="py-3 text-white font-medium">{vote.voterName}</td>
                    <td className="py-3 text-[#9a8870]">{vote.voterEmail || '—'}</td>
                    <td className="py-3 text-[#9a8870]">{vote.voterCountry || '—'}</td>
                    <td className="py-3 text-[#665544] text-xs">
                      {new Date(vote.votedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
