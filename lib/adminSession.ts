const encoder = new TextEncoder();

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Buffer.from(sig).toString('hex');
}

export async function createAdminSessionToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const expiry = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  const sig = await hmac(secret, String(expiry));
  return `${expiry}.${sig}`;
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiryStr, sig] = token.split('.');
  if (!expiryStr || !sig) return false;
  const expiry = Number(expiryStr);
  if (Number.isNaN(expiry) || Date.now() > expiry) return false;
  const secret = process.env.ADMIN_SESSION_SECRET!;
  const expected = await hmac(secret, expiryStr);
  return expected === sig;
}
