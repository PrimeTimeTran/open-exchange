import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const requestHeaders = new Headers(request.headers);

  const url = new URL(request.url);
  const pathname = url.pathname;

  const isRootUrl = pathname === '/';
  if (!isRootUrl) {
    requestHeaders.set('x-url', request.url);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
