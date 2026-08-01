'use client';

import { useEffect, useState } from 'react';
import { supabasePublic } from '@/lib/supabase';

type Project = {
  id: string;
  title: string;
  description: string;
  live_url: string;
  screenshot_url: string | null;
  tech: string[];
};

const PLATFORMS = ['x', 'instagram', 'whatsapp', 'facebook'] as const;

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [loadingList, setLoadingList] = useState(true);
  const [banner, setBanner] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // hero image
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroSaving, setHeroSaving] = useState(false);

  // form state
  const [title, setTitle] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [tech, setTech] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const showError = (text: string) => setBanner({ type: 'error', text });
  const showSuccess = (text: string) => setBanner({ type: 'success', text });

  // Uploads go straight from the browser to Supabase Storage instead of
  // through our API route. Routing large files through a Vercel serverless
  // function hits its ~4.5MB body limit and fails with a generic "Load
  // failed" - this was the actual bug behind the hero upload not working.
  const uploadToStorage = async (file: File, prefix: string): Promise<string> => {
    const supabase = supabasePublic();
    const ext = file.name.split('.').pop();
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from('octopusfur-media')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('octopusfur-media').getPublicUrl(path);
    return data.publicUrl;
  };

  const loadProjects = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load projects');
      setProjects(data.projects || []);
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoadingList(false);
    }
  };

  const loadLinks = async () => {
    try {
      const res = await fetch('/api/admin/social-links');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load social links');
      const map: Record<string, string> = {};
      (data.links || []).forEach((l: { platform: string; url: string }) => {
        map[l.platform] = l.url;
      });
      setLinks(map);
    } catch (err: any) {
      showError(err.message);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load settings');
      setHeroImageUrl(data.settings?.hero_image_url || '');
    } catch (err: any) {
      showError(err.message);
    }
  };

  useEffect(() => {
    loadProjects();
    loadLinks();
    loadSettings();
  }, []);

  const saveHeroImage = async () => {
    setHeroSaving(true);
    setBanner(null);
    try {
      let urlToSave = heroImageUrl;

      // If a new file was chosen, upload it first and use the fresh URL -
      // previously this required a separate "Upload" click, and skipping
      // it meant the old (or empty) URL got saved instead.
      if (heroFile) {
        urlToSave = await uploadToStorage(heroFile, 'portfolio');
        setHeroImageUrl(urlToSave);
      }

      if (!urlToSave) throw new Error('Choose an image first');

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hero_image_url: urlToSave }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Save failed');

      setHeroFile(null);
      showSuccess('Hero image saved — live on the site now.');
    } catch (err: any) {
      showError(`Hero image save failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setHeroSaving(false);
    }
  };

  const generate = async () => {
    setGenerating(true);
    setBanner(null);
    try {
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          notes,
          tech: tech.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'AI generation failed');
      setDescription(data.description || '');
    } catch (err: any) {
      showError(`AI write-up failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setBanner(null);
    try {
      const url = await uploadToStorage(file, 'portfolio');
      setScreenshotUrl(url);
    } catch (err: any) {
      showError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const saveProject = async () => {
    setSaving(true);
    setBanner(null);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          live_url: liveUrl,
          screenshot_url: screenshotUrl,
          tech: tech.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Save failed');

      setTitle('');
      setLiveUrl('');
      setNotes('');
      setTech('');
      setDescription('');
      setScreenshotUrl('');
      setFile(null);
      showSuccess('Project saved.');
      await loadProjects();
    } catch (err: any) {
      showError(`Save failed: ${err.message}. If you were logged out, refresh and log in again.`);
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Delete failed');
      await loadProjects();
    } catch (err: any) {
      showError(`Delete failed: ${err.message}`);
    }
  };

  const saveLinks = async () => {
    setBanner(null);
    try {
      const res = await fetch('/api/admin/social-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(links),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Save failed');
      showSuccess('Links saved.');
    } catch (err: any) {
      showError(`Save failed: ${err.message}`);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-display mb-6">Admin</h1>

      {banner && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            banner.type === 'error' ? 'bg-red-500/15 text-red-300 border border-red-500/40' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {banner.text}
        </div>
      )}

      <section>
        <h2 className="text-xl font-display mb-4">Hero Image</h2>
        <p className="text-white/50 text-sm mb-4">
          This is the composite image shown on the homepage hero, behind the color reflection.
        </p>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          {heroImageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={heroImageUrl} alt="hero preview" className="w-48 rounded-lg" />
          )}
          <button
            onClick={saveHeroImage}
            disabled={heroSaving || (!heroFile && !heroImageUrl)}
            className="bg-oct-orange px-5 py-3 rounded-lg font-medium disabled:opacity-40"
          >
            {heroSaving ? 'Saving…' : 'Set as Hero Image'}
          </button>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-display mb-4">Add Project</h2>
        <div className="space-y-4">
          <input
            placeholder="Project title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />
          <input
            placeholder="Live URL"
            value={liveUrl}
            onChange={(e) => setLiveUrl(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />
          <input
            placeholder="Tech stack (comma separated)"
            value={tech}
            onChange={(e) => setTech(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />

          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
            <button
              onClick={uploadFile}
              disabled={!file || uploading}
              className="bg-white/10 px-4 py-2 rounded-lg text-sm disabled:opacity-40"
            >
              {uploading ? 'Uploading…' : 'Upload screenshot'}
            </button>
          </div>
          {screenshotUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={screenshotUrl} alt="screenshot preview" className="w-40 rounded-lg" />
          )}

          <textarea
            placeholder="Rough notes about the project (AI turns this into copy)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          />
          <button
            onClick={generate}
            disabled={generating || !title}
            className="bg-oct-orange px-5 py-3 rounded-lg font-medium disabled:opacity-40"
          >
            {generating ? 'Generating…' : 'Generate write-up with AI'}
          </button>

          {description && (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-white/10 border border-oct-orange rounded-lg px-4 py-3"
            />
          )}

          <button
            onClick={saveProject}
            disabled={saving || !title || !liveUrl}
            className="w-full bg-white text-black py-3 rounded-lg font-medium disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save Project'}
          </button>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-display mb-4">Projects</h2>
        {loadingList ? (
          <p className="text-white/50">Loading…</p>
        ) : projects.length === 0 ? (
          <p className="text-white/50">No projects yet.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3"
              >
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-white/50 text-sm">{p.live_url}</p>
                </div>
                <button onClick={() => deleteProject(p.id)} className="text-oct-pink text-sm">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-display mb-4">Social Links</h2>
        <div className="space-y-3">
          {PLATFORMS.map((platform) => (
            <input
              key={platform}
              placeholder={`${platform} URL`}
              value={links[platform] || ''}
              onChange={(e) => setLinks((prev) => ({ ...prev, [platform]: e.target.value }))}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3"
            />
          ))}
          <button onClick={saveLinks} className="bg-white text-black px-5 py-3 rounded-lg font-medium">
            Save Links
          </button>
        </div>
      </section>
    </main>
  );
}
