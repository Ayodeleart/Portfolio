'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabasePublic } from '@/lib/supabase';

type ArtworkImage = { id: string; url: string; sort_order: number };
type Artwork = {
  id: string;
  title: string;
  image_url: string | null;
  story: string | null;
  inspiration: string | null;
  medium: string | null;
  year: number | null;
  dimensions: string | null;
  featured: boolean;
  frame_position: 'left' | 'center' | 'right' | null;
  sort_order: number;
  artwork_images: ArtworkImage[];
};

const FRAME_OPTIONS = [
  { value: '', label: 'Not in hero' },
  { value: 'left', label: 'Left frame' },
  { value: 'right', label: 'Right frame' },
  { value: 'center', label: 'Center (no physical frame yet)' },
];

export default function AyodeleartAdmin() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [banner, setBanner] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // --- add form state ---
  const [title, setTitle] = useState('');
  const [medium, setMedium] = useState('');
  const [year, setYear] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [story, setStory] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [featured, setFeatured] = useState(false);
  const [framePosition, setFramePosition] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [polishing, setPolishing] = useState<'story' | 'inspiration' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showError = (text: string) => setBanner({ type: 'error', text });
  const showSuccess = (text: string) => setBanner({ type: 'success', text });

  // Direct-to-storage upload, same pattern as the main admin — avoids
  // Vercel's serverless function body-size limit.
  const uploadToStorage = async (file: File): Promise<string> => {
    const supabase = supabasePublic();
    const ext = file.name.split('.').pop();
    const path = `ayodeleart/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('octopusfur-media')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('octopusfur-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const loadArtworks = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/admin/artworks');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setArtworks(data.artworks || []);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadArtworks();
  }, []);

  // Multiple files at once — first becomes the cover, the rest become the
  // detail-page gallery images.
  const handleFilesSelected = async (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    const list = Array.from(selected);
    setFiles((prev) => [...prev, ...list]);
    setUploading(true);
    setBanner(null);
    try {
      const urls = await Promise.all(list.map(uploadToStorage));
      setUploadedUrls((prev) => [...prev, ...urls]);
    } catch (err: any) {
      showError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const removeUploaded = (url: string) => {
    setUploadedUrls((prev) => prev.filter((u) => u !== url));
  };

  const polish = async (field: 'story' | 'inspiration') => {
    const text = field === 'story' ? story : inspiration;
    if (!text.trim()) return;
    setPolishing(field);
    setBanner(null);
    try {
      const res = await fetch('/api/admin/artworks/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, field, text }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Polish failed');
      if (field === 'story') setStory(data.polished);
      else setInspiration(data.polished);
    } catch (err: any) {
      showError(`Polish failed: ${err.message}`);
    } finally {
      setPolishing(null);
    }
  };

  const saveArtwork = async () => {
    setSaving(true);
    setBanner(null);
    try {
      const res = await fetch('/api/admin/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          medium,
          year: year ? parseInt(year, 10) : null,
          dimensions,
          story,
          inspiration,
          featured,
          frame_position: framePosition || null,
          images: uploadedUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Save failed');

      setTitle('');
      setMedium('');
      setYear('');
      setDimensions('');
      setStory('');
      setInspiration('');
      setFeatured(false);
      setFramePosition('');
      setFiles([]);
      setUploadedUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showSuccess('Artwork added to the collection.');
      await loadArtworks();
    } catch (err: any) {
      showError(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateField = async (id: string, patch: Partial<Artwork>) => {
    try {
      const res = await fetch(`/api/admin/artworks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Update failed');
      await loadArtworks();
    } catch (err: any) {
      showError(`Update failed: ${err.message}`);
    }
  };

  const replaceImage = async (id: string, file: File) => {
    try {
      const url = await uploadToStorage(file);
      await updateField(id, { image_url: url } as Partial<Artwork>);
    } catch (err: any) {
      showError(`Replace failed: ${err.message}`);
    }
  };

  const deleteArtwork = async (id: string) => {
    if (!confirm('Delete this piece?')) return;
    try {
      const res = await fetch(`/api/admin/artworks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Delete failed');
      await loadArtworks();
    } catch (err: any) {
      showError(`Delete failed: ${err.message}`);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= artworks.length) return;
    const a = artworks[index];
    const b = artworks[target];
    await Promise.all([
      updateField(a.id, { sort_order: b.sort_order } as Partial<Artwork>),
      updateField(b.id, { sort_order: a.sort_order } as Partial<Artwork>),
    ]);
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 max-w-3xl mx-auto">
      <Link href="/admin" className="text-white/50 text-sm hover:text-white">
        ← Portfolio admin
      </Link>
      <h1 className="text-3xl font-display mt-3 mb-1">Ayodeleart</h1>
      <p className="text-white/50 text-sm mb-6">Managing the art collection — same login, separate content.</p>

      {banner && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            banner.type === 'error'
              ? 'bg-red-500/15 text-red-300 border border-red-500/40'
              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {banner.text}
        </div>
      )}

      <section>
        <h2 className="text-xl font-display mb-4">Add a piece</h2>
        <div className="space-y-4">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />

          <div className="flex gap-4">
            <input
              placeholder="Medium (e.g. Oil on canvas)"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3"
            />
            <input
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-28 bg-white/5 border border-white/20 rounded-lg px-4 py-3"
            />
            <input
              placeholder="Dimensions"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="w-40 bg-white/5 border border-white/20 rounded-lg px-4 py-3"
            />
          </div>

          <div className="flex items-center gap-4">
            <select
              value={framePosition}
              onChange={(e) => setFramePosition(e.target.value)}
              className="bg-white/5 border border-white/20 rounded-lg px-4 py-3"
            >
              {FRAME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Featured
            </label>
          </div>

          <div>
            <label className="block text-sm text-white/50 mb-2">
              Images — select multiple at once. First one is the cover, the rest become detail-page images.
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="text-sm"
            />
            {uploading && <p className="text-white/50 text-sm mt-2">Uploading…</p>}
            {uploadedUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {uploadedUrls.map((url, i) => (
                  <div key={url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                    {i === 0 && (
                      <span className="absolute -top-2 -left-2 bg-white text-black text-[10px] px-1.5 py-0.5 rounded">
                        cover
                      </span>
                    )}
                    <button
                      onClick={() => removeUploaded(url)}
                      className="absolute -top-2 -right-2 bg-black border border-white/30 rounded-full w-5 h-5 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-white/50">Story</label>
              <button
                onClick={() => polish('story')}
                disabled={!story.trim() || polishing === 'story'}
                className="text-xs text-brass hover:underline disabled:opacity-40"
              >
                {polishing === 'story' ? 'Polishing…' : '✨ Polish with AI'}
              </button>
            </div>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={4}
              placeholder="Rough notes are fine — polish will clean it up"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-white/50">Inspiration</label>
              <button
                onClick={() => polish('inspiration')}
                disabled={!inspiration.trim() || polishing === 'inspiration'}
                className="text-xs text-brass hover:underline disabled:opacity-40"
              >
                {polishing === 'inspiration' ? 'Polishing…' : '✨ Polish with AI'}
              </button>
            </div>
            <textarea
              value={inspiration}
              onChange={(e) => setInspiration(e.target.value)}
              rows={4}
              placeholder="Rough notes are fine — polish will clean it up"
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3"
            />
          </div>

          <button
            onClick={saveArtwork}
            disabled={saving || uploading || !title || uploadedUrls.length === 0}
            className="w-full bg-white text-black py-3 rounded-lg font-medium disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Add to collection'}
          </button>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-display mb-4">Collection</h2>
        {loadingList ? (
          <p className="text-white/50">Loading…</p>
        ) : artworks.length === 0 ? (
          <p className="text-white/50">No pieces yet.</p>
        ) : (
          <div className="space-y-3">
            {artworks.map((a, i) => (
              <div key={a.id} className="bg-white/5 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  {a.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.image_url} alt="" className="w-14 h-14 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{a.title}</p>
                    <p className="text-white/50 text-xs">
                      {a.medium || 'No medium'} · {a.frame_position ? `${a.frame_position} frame` : 'not in hero'}
                      {a.featured ? ' · featured' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="px-2 text-white/60 disabled:opacity-20">
                      ↑
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === artworks.length - 1}
                      className="px-2 text-white/60 disabled:opacity-20"
                    >
                      ↓
                    </button>
                    <label className="px-2 text-white/60 text-sm cursor-pointer">
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && replaceImage(a.id, e.target.files[0])}
                      />
                    </label>
                    <select
                      value={a.frame_position || ''}
                      onChange={(e) => updateField(a.id, { frame_position: (e.target.value || null) as any })}
                      className="bg-white/10 rounded px-2 py-1 text-xs"
                    >
                      {FRAME_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => deleteArtwork(a.id)} className="px-2 text-red-400 text-sm">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
