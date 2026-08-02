'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabasePublic } from '@/lib/supabase';

type ArtworkImage = { id: string; url: string; sort_order: number };
type Artwork = {
  id: string;
  title: string;
  description: string;
  story: string | null;
  category: string | null;
  screenshot_url: string | null;
  portfolio_project_images: ArtworkImage[];
};

export default function AyodeleartAdmin() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [banner, setBanner] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [extraUrls, setExtraUrls] = useState<string[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingExtras, setUploadingExtras] = useState(false);
  const [saving, setSaving] = useState(false);

  const showError = (text: string) => setBanner({ type: 'error', text });
  const showSuccess = (text: string) => setBanner({ type: 'success', text });

  // Same direct-to-storage pattern as the main admin: uploads go straight
  // from the browser to Supabase Storage, not through a serverless function,
  // to avoid Vercel's ~4.5MB request body limit.
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
      if (!res.ok) throw new Error(data.error || 'Failed to load artworks');
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

  const uploadCover = async () => {
    if (!coverFile) return;
    setUploadingCover(true);
    setBanner(null);
    try {
      setCoverUrl(await uploadToStorage(coverFile));
    } catch (err: any) {
      showError(`Cover upload failed: ${err.message}`);
    } finally {
      setUploadingCover(false);
    }
  };

  const uploadExtras = async () => {
    if (extraFiles.length === 0) return;
    setUploadingExtras(true);
    setBanner(null);
    try {
      const urls = await Promise.all(extraFiles.map(uploadToStorage));
      setExtraUrls((prev) => [...prev, ...urls]);
      setExtraFiles([]);
    } catch (err: any) {
      showError(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingExtras(false);
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
          category,
          year: year ? parseInt(year, 10) : null,
          dimensions,
          description,
          story,
          screenshot_url: coverUrl,
          images: extraUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Save failed');

      setTitle('');
      setCategory('');
      setYear('');
      setDimensions('');
      setDescription('');
      setStory('');
      setCoverFile(null);
      setCoverUrl('');
      setExtraFiles([]);
      setExtraUrls([]);
      showSuccess('Artwork added to the collection.');
      await loadArtworks();
    } catch (err: any) {
      showError(`Save failed: ${err.message}. If you were logged out, refresh and log in again.`);
    } finally {
      setSaving(false);
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

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 max-w-3xl mx-auto">
      <Link href="/admin" className="text-white/50 text-sm hover:text-white">
        ← Portfolio admin
      </Link>
      <h1 className="text-3xl font-display mt-3 mb-1">Ayodeleart</h1>
      <p className="text-white/50 text-sm mb-6">
        Managing the art collection — separate content from the dev portfolio projects above,
        same login.
      </p>

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
          <input
            placeholder="Category (e.g. Oil on canvas)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />
          <div className="flex gap-4">
            <input
              placeholder="Year (e.g. 2026)"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-1/2 bg-white/5 border border-white/20 rounded-lg px-4 py-3"
            />
            <input
              placeholder="Dimensions (e.g. 24 x 36 in)"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="w-1/2 bg-white/5 border border-white/20 rounded-lg px-4 py-3"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
            <button
              onClick={uploadCover}
              disabled={!coverFile || uploadingCover}
              className="bg-white/10 px-4 py-2 rounded-lg text-sm disabled:opacity-40"
            >
              {uploadingCover ? 'Uploading…' : 'Upload cover'}
            </button>
          </div>
          {coverUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={coverUrl} alt="cover preview" className="w-40 rounded-lg" />
          )}

          <textarea
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />
          <textarea
            placeholder="Story / inspiration behind the piece"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={5}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />

          <div>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setExtraFiles(Array.from(e.target.files || []))}
                className="text-sm"
              />
              <button
                onClick={uploadExtras}
                disabled={extraFiles.length === 0 || uploadingExtras}
                className="bg-white/10 px-4 py-2 rounded-lg text-sm disabled:opacity-40"
              >
                {uploadingExtras ? 'Uploading…' : 'Add detail-page images'}
              </button>
            </div>
            {extraUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {extraUrls.map((url) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img key={url} src={url} alt="" className="w-20 h-20 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={saveArtwork}
            disabled={saving || !title || !coverUrl}
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
            {artworks.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="text-white/50 text-sm">
                    {a.category || 'Uncategorized'} · {a.portfolio_project_images?.length || 0} extra
                    image{a.portfolio_project_images?.length === 1 ? '' : 's'}
                  </p>
                </div>
                <button onClick={() => deleteArtwork(a.id)} className="text-oct-pink text-sm">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
