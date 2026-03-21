import type { Metadata } from "next";
import { Poppins } from "next/font/google"; 
import localFont from "next/font/local";
import "../globals.css"; 
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClerkProvider } from '@clerk/nextjs';
import { CartProvider } from "@/context/CartContext"; 
import { WishlistProvider } from "@/context/WishlistContext"; 
import WhatsAppButton from "@/components/WhatsAppButton"; // 👈 1. Button import kiya

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const nanoFont = localFont({
  src: "../../public/fonts/nano.ttf", 
  variable: "--font-nano",
});

export const metadata: Metadata = {
  title: "Kankariya Jewellers",
  description: "Premium Silver Jewelry Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${poppins.className} ${nanoFont.variable} antialiased text-stone-700 bg-[#fffcf8] overflow-x-hidden`}>
          
          <CartProvider>
            <WishlistProvider>
            
              <div className="flex flex-col min-h-screen w-full">
                
                <Header/>
                
                <main className="flex-1 pt-10 md:pt-3">
                    {children}
                </main>
                
                <Footer/>

                {/* 👇 2. WhatsApp Button yahan place kiya taaki har page pe dikhe */}
                <WhatsAppButton />
                
              </div>

            </WishlistProvider> 
          </CartProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}