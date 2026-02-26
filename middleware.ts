import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server'; // 👈 Ye import zaroori hai redirect ke liye

// 1. Public Routes Define karein (Jo sabke liye khule hain)
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/shop(.*)',      // Shop page public
  '/product(.*)',   // Product details public
  '/success(.*)',   // Success page Public
  '/api(.*)'        // APIs public
]);

// 2. Admin Route Define karein 👈 Naya addition
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Auth object se current user ki details nikalein
  const { userId, redirectToSignIn } = await auth();

  // 3. Agar user '/admin' route par ja raha hai 👈 Main logic yahan hai
  if (isAdminRoute(req)) {
    // Agar login hi nahi hai, toh login page par bhejo
    if (!userId) {
      return redirectToSignIn();
    }

    // .env se admin IDs nikal kar array banayein
    const adminIds = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',') || [];
    const isAdmin = adminIds.includes(userId);

    // Agar user logged in hai par ADMIN nahi hai, toh usko home page '/' par bhej do
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // 4. Agar route Public NAHI hai aur Admin route bhi NAHI hai (jaise /my-orders), to bas login protect karo
  if (!isPublicRoute(req) && !isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};