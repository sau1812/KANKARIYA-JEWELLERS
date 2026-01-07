import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Public Routes Define karein (Jo sabke liye khule hain)
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/shop(.*)',      // Shop page public
  '/product(.*)',   // Product details public
  '/success(.*)',   // 👈 Success page Public
  '/api(.*)'        // APIs public (ya protect kar sakte ho zaroorat padne par)
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. Agar route Public NAHI hai, to protect karo
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};