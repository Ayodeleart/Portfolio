'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Wrong password.');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-display mb-6">Admin Access</h1>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3"
          autoFocus
        />
        {error && <p className="text-oct-pink text-sm mt-2">{error}</p>}
        <button
          onClick={submit}
          disabled={loading || !password}
          className="mt-4 w-full bg-oct-orange py-3 rounded-lg font-medium disabled:opacity-40"
        >
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </div>
    </main>
  );
}
