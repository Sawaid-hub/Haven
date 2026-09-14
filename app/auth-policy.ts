export function safeReturnTo(value: string | null): string {
  try {
    const url = new URL(value || '/', 'https://haven.local');
    return url.origin === 'https://haven.local' && !url.pathname.startsWith('/signin') && !url.pathname.startsWith('/api/auth')
      ? url.pathname + url.search + url.hash : '/';
  } catch { return '/'; }
}

export function sameOrigin(request: Request): boolean {
  return request.headers.get('origin') === new URL(request.url).origin;
}
