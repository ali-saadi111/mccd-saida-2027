import { NextResponse, type NextRequest } from 'next/server';
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/' || !/^\/(en|ar)(\/|$)/.test(path))
    return NextResponse.redirect(
      new URL('/en' + (path === '/' ? '' : path), request.url),
    );
  return NextResponse.next();
}
export const config = {
  matcher: ['/((?!api|_next|brand|favicon.ico|.*\\..*).*)'],
};
