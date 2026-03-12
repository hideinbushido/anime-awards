'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  getActiveEvent,
  getAllCategories,
  getNominees,
  createNominee,
  updateNominee,
  deleteNominee,
} from '@/lib/firestore';
import type { Category, Nominee } from '@/lib/types';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  anime: '',
  imageUrl: '',
  audioUrl: '',
  descriptionFr: '',
  descriptionEn: '',
  categoryId: '',
  active: true,
};

export default function NomineesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [nomineesByCategory, setNomineesByCategory] = useState<Record<string, Nominee[]>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const event = await getActiveEvent();
      if (event) {
        const cats = await getAllCategories(event.id);
        setCategories(cats);
        if (cats.length > 0 && !activeCategory) setActiveCategory(cats[0].id);
        const byCategory: Record<string, Nominee[]> = {};
        for (const cat of cats) {
          byCategory[cat.id] = await getNominees(cat.id);
        }
        setNomineesByCategory(byCategory);
      }
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, categoryId: activeCategory || categories[0]?.id || '' });
    setShowForm(true);
  };

  const openEdit = (nominee: Nominee) => {
    setEditingId(nominee.id);
    setForm({
      name: nominee.name,
      anime: nominee.anime,
      imageUrl: nominee.imageUrl,
      audioUrl: nominee.audioUrl ?? '',
      descriptionFr: nominee.descriptionFr,
      descriptionEn: nominee.descriptionEn,
      categoryId: nominee.categoryId,
      active: nominee.active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.anime.trim() || !form.categoryId) {
      toast.error('Nom, anime et catégorie sont requis');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateNominee(editingId, {
          ...form,
          description: form.descriptionFr,
        });
        toast.success('Nominé mis à jour');
      } else {
        await createNominee({
          ...form,
          description: form.descriptionFr,
        });
        toast.success('Nominé créé');
      }
      setShowForm(false);
      await load();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNominee(id);
      toast.success('Nominé supprimé');
      setDeleteConfirm(null);
      await load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentNominees = activeCategory ? (nomineesByCategory[activeCategory] || []) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          <span className="gradient-text">Nominés</span>
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#c9a227] hover:bg-[#9e7c1e] text-white rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeCategory === cat.id
                ? 'bg-[#c9a227] text-white'
                : 'bg-[#0f0d09] border border-[#2a1e0a] text-[#9a8870] hover:text-white'
            )}
          >
            {cat.titleFr}{' '}
            <span className="text-xs opacity-70">
              ({(nomineesByCategory[cat.id] || []).length})
            </span>
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[#0f0d09] border border-[#c9a227]/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">
              {editingId ? 'Modifier le nominé' : 'Nouveau nominé'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-[#665544] hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#665544] mb-1">Nom *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-[#07060a] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227]"
                placeholder="Frieren"
              />
            </div>
            <div>
              <label className="block text-xs text-[#665544] mb-1">Anime *</label>
              <input
                value={form.anime}
                onChange={(e) => setForm((p) => ({ ...p, anime: e.target.value }))}
                className="w-full bg-[#07060a] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227]"
                placeholder="Sousou no Frieren"
              />
            </div>
            <div>
              <label className="block text-xs text-[#665544] mb-1">URL de l'image</label>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                className="w-full bg-[#07060a] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227]"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-xs text-[#665544] mb-1">URL audio (extrait hover)</label>
              <input
                value={form.audioUrl}
                onChange={(e) => setForm((p) => ({ ...p, audioUrl: e.target.value }))}
                className="w-full bg-[#07060a] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227]"
                placeholder="/audio/mon-fichier.mp3"
              />
            </div>
            <div>
              <label className="block text-xs text-[#665544] mb-1">Description (FR)</label>
              <textarea
                value={form.descriptionFr}
                onChange={(e) => setForm((p) => ({ ...p, descriptionFr: e.target.value }))}
                className="w-full bg-[#07060a] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227] h-20 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#665544] mb-1">Description (EN)</label>
              <textarea
                value={form.descriptionEn}
                onChange={(e) => setForm((p) => ({ ...p, descriptionEn: e.target.value }))}
                className="w-full bg-[#07060a] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227] h-20 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#665544] mb-1">Catégorie *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full bg-[#07060a] border border-[#2a1e0a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a227]"
              >
                <option value="">Choisir...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.titleFr}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-[#665544]">Actif</label>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                className={clsx(
                  'relative w-11 h-6 rounded-full transition-colors',
                  form.active ? 'bg-[#c9a227]' : 'bg-gray-600'
                )}
              >
                <div
                  className={clsx(
                    'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                    form.active ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>
          {form.imageUrl && (
            <div className="mt-4">
              <p className="text-xs text-[#665544] mb-2">Aperçu de l'image :</p>
              <Image
                src={form.imageUrl}
                alt="Aperçu"
                width={80}
                height={107}
                className="rounded-lg object-cover"
                unoptimized
                onError={() => {}}
              />
            </div>
          )}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-[#2a1e0a] rounded-xl text-[#9a8870] hover:text-white text-sm transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#c9a227] hover:bg-[#9e7c1e] rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Nominees grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currentNominees.map((nominee) => (
          <div
            key={nominee.id}
            className="bg-[#0f0d09] border border-[#2a1e0a] rounded-xl overflow-hidden group"
          >
            <div className="relative aspect-[3/4] bg-[#07060a]">
              <Image
                src={nominee.imageUrl || `https://placehold.co/300x400/111118/8b5cf6?text=${encodeURIComponent(nominee.name)}`}
                alt={nominee.name}
                fill
                className="object-cover"
                unoptimized
              />
              {!nominee.active && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-xs text-[#9a8870] bg-black/80 px-2 py-1 rounded">Inactif</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold text-white text-xs truncate">{nominee.name}</p>
              <p className="text-[#c9a227] text-xs truncate">{nominee.anime}</p>
              <div className="flex items-center gap-1 mt-2">
                <button
                  onClick={() => openEdit(nominee)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-[#9a8870] hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                {deleteConfirm === nominee.id ? (
                  <>
                    <button
                      onClick={() => handleDelete(nominee.id)}
                      className="flex-1 flex items-center justify-center py-1.5 text-xs text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 flex items-center justify-center py-1.5 text-xs text-[#9a8870] hover:bg-white/5 rounded-lg transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(nominee.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-[#9a8870] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {currentNominees.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#665544] text-sm">
            Aucun nominé dans cette catégorie.
          </div>
        )}
      </div>
    </div>
  );
}
