import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 1. Sirf un routes ko define karein jinpe LOGIN compulsory hai
const isProtectedRoute = createRouteMatcher([
  // '/checkout(.*)', 👈 YAHAN SE CHECKOUT HATA DIYA HAI taaki Guest Form chal sake!
  '/orders(.*)',   // (Optional) User ke order history page ke liye
  '/profile(.*)'   // (Optional) User profile ke liye
]);

// 2. Admin Route Define karein
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // 3. Agar user '/admin' route par ja raha hai
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

  // 4. Agar user protected routes (Profile/Orders) par ja raha hai, tabhi roko
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  
  // Ab tumhara /checkout bhi automatically PUBLIC ban gaya hai! 🎉
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};