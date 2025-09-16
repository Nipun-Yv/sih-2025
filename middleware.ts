import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import { UserRole } from '@/types/User';

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/unauthorized',
  '/select-role',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/.well-known(.*)',
  '/_next(.*)',
  '/api(.*)',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isVendorRoute = createRouteMatcher(['/vendor(.*)']);
const isTouristRoute = createRouteMatcher(['/tourist(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const pathname = req.nextUrl.pathname;
  
  if (pathname.startsWith('/_next/') ||
       pathname.startsWith('/api/') ||
       pathname === '/favicon.ico' ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml' ||
      (pathname.includes('.') && !pathname.includes('/sign-'))) {
    return NextResponse.next();
  }

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  
  console.log("User id in the frontend is ", userId)
  
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }
  const userRole = (sessionClaims?.metadata as any)?.role as UserRole;
     
  console.log("Userrole in the frontend is", userRole)
  console.log("UserRole in middleware:", userRole, "for path:", pathname);

  if (!userRole && pathname !== '/select-role' && !pathname.startsWith('/api/')) {
    console.log("No user role found, redirecting to select-role");
    return NextResponse.redirect(new URL('/select-role', req.url));
  }

  if (!userRole) {
    return NextResponse.next();
  }

  if (isAdminRoute(req) && userRole !== UserRole.ADMIN) {
    console.log(`Access denied: ${userRole} trying to access admin route`);
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (isVendorRoute(req) && userRole !== UserRole.VENDOR) {
    console.log(`Access denied: ${userRole} trying to access vendor route`);
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (isTouristRoute(req) && userRole !== UserRole.TOURIST) {
    console.log(`Access denied: ${userRole} trying to access tourist route`);
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};