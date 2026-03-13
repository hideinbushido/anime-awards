'use client';

import { useEffect, useState } from 'react';
import { getActiveEvent, getAllEvents, createEvent, updateEvent } from '@/lib/firestore';
import type { AnimeEvent, EventStatus } from '@/lib/types';
import { Save, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'preparation', label: 'Préparation' },
  { value: 'voting_open', label: 'Votes ouverts' },
  { value: 'voting_closed', label: 'Votes fermés' },
  { value: 'results_published', label: 'Résultats publiés' },
];

const emptyForm = {
  name: 'Anime Awards 2026',
  year: 2026,
  status: 'preparation' as EventStatus,
  voteOpenDate: '',
  voteCloseDate: '',
  liveDate: '',
  description: '',
  tiktokUrl: '',
  instagramUrl: '',
  discordUrl: '',
};

export default function SettingsAdmin() {
  const [event, setEvent] = useState<AnimeEvent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const ev = await getActiveEvent();
      if (ev) {
        setEvent(ev);
        setForm({
          name: ev.name,
          year: ev.year,
          status: ev.status,
          voteOpenDate: ev.voteOpenDate || '',
          voteCloseDate: ev.voteCloseDate || '',
          liveDate: ev.liveDate || '',
          description: ev.description || '',
          tiktokUrl: ev.tiktokUrl || '',
          instagramUrl: ev.instagramUrl || '',
          discordUrl: ev.discordUrl || '',
        });
      }
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      if (event && !creatingNew) {
        await updateEvent(event.id, form);
        toast.success('Paramètres sauvegardés');
      } else {
        await createEvent(form);
        toast.success('Événement créé');
        setCreatingNew(false);
      }
      await load();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          <span className="gradient-text">Paramètres</span>
        </h1>
        {!event && (
          <button
            onClick={() => setCreatingNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#c9a227] hover:bg-[#9e7c1e] text-white rounded-xl text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Créer l'événement
          </button>
        )}
      </div>

      {!event && !creatingNew ? (
        <div className="bg-[#0f0d09] border border-[#2a1e0a] rounded-2xl p-8 text-center">
          <p className="text-[#9a8870] mb-4">Aucun événement configuré.</p>
          <button
            onClick={() => setCreatingNew(true)}
            className="px-6 py-3 bg-[#c9a227] hover:bg-[#9e7c1e] text-white rounded-xl font-medium transition-all"
          >
            Créer le premier événement
          </button>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">
          {/* Infos de base */}
          <div className="bg-[#0f0d09] border border-[#2a1e0a] rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Informations de l'événement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#665544] mb-1">Nom de l'événement</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-[#080600] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#665544] mb-1">Année</label>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm((p) => ({ ...p, year: parseInt(e.target.value) || 2026 }))}
                  className="w-full bg-[#080600] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#665544] mb-1">Statut</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as EventStatus }))}
                  className="w-full bg-[#080600] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227]"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#665544] mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-[#080600] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227] h-20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-[#0f0d09] border border-[#2a1e0a] rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Dates importantes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-[#665544] mb-1">Ouverture des votes</label>
                <input
                  type="datetime-local"
                  value={form.voteOpenDate ? form.voteOpenDate.replace('Z', '') : ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, voteOpenDate: new Date(e.target.value).toISOString() }))
                  }
                  className="w-full bg-[#080600] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#665544] mb-1">Fermeture des votes</label>
                <input
                  type="datetime-local"
                  value={form.voteCloseDate ? form.voteCloseDate.replace('Z', '') : ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, voteCloseDate: new Date(e.target.value).toISOString() }))
                  }
                  className="w-full bg-[#080600] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#665544] mb-1">Date du live TikTok</label>
                <input
                  type="datetime-local"
                  value={form.liveDate ? form.liveDate.replace('Z', '') : ''}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, liveDate: new Date(e.target.value).toISOString() }))
                  }
                  className="w-full bg-[#080600] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227]"
                />
              </div>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="bg-[#0f0d09] border border-[#2a1e0a] rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Réseaux sociaux</h2>
            <div className="space-y-3">
              {[
                { key: 'tiktokUrl', label: 'TikTok', placeholder: 'https://www.tiktok.com/@...' },
                { key: 'instagramUrl', label: 'Instagram', placeholder: 'https://www.instagram.com/...' },
                { key: 'discordUrl', label: 'Discord', placeholder: 'https://discord.gg/...' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs text-[#665544] mb-1">{field.label}</label>
                  <input
                    value={(form as any)[field.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-[#080600] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#9e7c1e] hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 rounded-xl text-white font-bold transition-all"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Enregistrer les paramètres
          </button>
        </div>
      )}
    </div>
  );
}
