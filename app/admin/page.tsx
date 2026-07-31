'use client';

import { useEffect, useState } from 'react';

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

  const loadProjects = async () => {
    setLoadingList(true);
    const res = await fetch('/api/admin/projects');
    const data = await res.json();
    setProjects(data.projects || []);
    setLoadingList(false);
  };

  const loadLinks = async () => {
    const res = await fetch('/api/admin/social-links');
    const data = await res.json();
    const map: Record<string, string> = {};
    (data.links || []).forEach((l: { platform: string; url: string }) => {
      map[l.platform] = l.url;
    });
    setLinks(map);
  };

  useEffect(() => {
    loadProjects();
    loadLinks();
  }, []);

  const generate = async () => {
    setGenerating(true);
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
      setDescription(data.description || '');
    } finally {
      setGenerating(false);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setScreenshotUrl(data.url);
    } finally {
      setUploading(false);
    }
  };

  const saveProject = async () => {
    setSaving(true);
    try {
      await fetch('/api/admin/projects', {
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
      setTitle('');
      setLiveUrl('');
      setNotes('');
      setTech('');
      setDescription('');
      setScreenshotUrl('');
      setFile(null);
      await loadProjects();
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
    await loadProjects();
  };

  const saveLinks = async () => {
    await fetch('/api/admin/social-links', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(links),
    });
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-display mb-8">Admin</h1>

      <section>
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
                <button
                  onClick={() => deleteProject(p.id)}
                  className="text-oct-pink text-sm"
                >
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
          <button
            onClick={saveLinks}
            className="bg-white text-black px-5 py-3 rounded-lg font-medium"
          >
            Save Links
          </button>
        </div>
      </section>
    </main>
  );
}
