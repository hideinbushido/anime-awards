'use client';

import { useEffect, useState } from 'react';
import {
  getActiveEvent,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/firestore';
import type { Category } from '@/lib/types';
import { Plus, Pencil, Trash2, X, Check, GripVertical } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const emptyForm = {
  titleFr: '',
  titleEn: '',
  descriptionFr: '',
  descriptionEn: '',
  order: 1,
  active: true,
};

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const event = await getActiveEvent();
      if (event) {
        setEventId(event.id);
        const cats = await getAllCategories(event.id);
        setCategories(cats);
      }
    } catch (e) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, order: categories.length + 1 });
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({
      titleFr: cat.titleFr,
      titleEn: cat.titleEn,
      descriptionFr: cat.descriptionFr,
      descriptionEn: cat.descriptionEn,
      order: cat.order,
      active: cat.active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!eventId) return;
    if (!form.titleFr.trim() || !form.titleEn.trim()) {
      toast.error('Les titres FR et EN sont requis');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, {
          ...form,
          title: form.titleFr,
          description: form.descriptionFr,
        });
        toast.success('Catégorie mise à jour');
      } else {
        await createCategory({
          eventId,
          ...form,
          title: form.titleFr,
          description: form.descriptionFr,
        });
        toast.success('Catégorie créée');
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
      await deleteCategory(id);
      toast.success('Catégorie supprimée');
      setDeleteConfirm(null);
      await load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleActive = async (cat: Category) => {
    try {
      await updateCategory(cat.id, { active: !cat.active });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, active: !c.active } : c))
      );
    } catch {
      toast.error('Erreur');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          <span className="gradient-text">Catégories</span>
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[#111118] border border-purple-500/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">
              {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Titre (FR) *</label>
              <input
                value={form.titleFr}
                onChange={(e) => setForm((p) => ({ ...p, titleFr: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                placeholder="Best Anime"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Titre (EN) *</label>
              <input
                value={form.titleEn}
                onChange={(e) => setForm((p) => ({ ...p, titleEn: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
                placeholder="Best Anime"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description (FR)</label>
              <textarea
                value={form.descriptionFr}
                onChange={(e) => setForm((p) => ({ ...p, descriptionFr: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 h-20 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description (EN)</label>
              <textarea
                value={form.descriptionEn}
                onChange={(e) => setForm((p) => ({ ...p, descriptionEn: e.target.value }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 h-20 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ordre</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 1 }))}
                className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-500">Actif</label>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, active: !p.active }))}
                className={clsx(
                  'relative w-11 h-6 rounded-full transition-colors',
                  form.active ? 'bg-purple-600' : 'bg-gray-600'
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
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-[#1e1e2e] rounded-xl text-gray-400 hover:text-white text-sm transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50"
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

      {/* List */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-4 flex items-center gap-4"
          >
            <GripVertical className="w-4 h-4 text-gray-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-white truncate">{cat.titleFr}</p>
                <span className="text-gray-500 text-xs">/</span>
                <p className="text-gray-400 text-sm truncate">{cat.titleEn}</p>
              </div>
              {cat.descriptionFr && (
                <p className="text-gray-600 text-xs mt-0.5 truncate">{cat.descriptionFr}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleActive(cat)}
                className={clsx(
                  'px-2 py-1 rounded-lg text-xs font-medium transition-all',
                  cat.active
                    ? 'text-green-400 bg-green-400/10'
                    : 'text-gray-500 bg-gray-500/10'
                )}
              >
                {cat.active ? 'Actif' : 'Inactif'}
              </button>
              <button
                onClick={() => openEdit(cat)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <Pencil className="w-4 h-4" />
              </button>
              {deleteConfirm === cat.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="p-1.5 text-gray-400 hover:bg-white/5 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(cat.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            Aucune catégorie. Cliquez sur "Ajouter" pour commencer.
          </div>
        )}
      </div>
    </div>
  );
}
