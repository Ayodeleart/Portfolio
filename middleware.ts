import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/adminSession';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin/login') || pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = req.cookies.get('admin_session')?.value;
    const valid = await verifyAdminSessionToken(token);
    if (!valid) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
      // A redirect (3xx) is what actually drops an installed iOS PWA out
      // to Safari - a rewrite serves the login page's content at the same
      // URL without triggering that navigation event, so the admin app
      // stays inside its own standalone shell.
      return NextResponse.rewrite(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
