import type { Metadata } from "next";
import { Poppins } from "next/font/google"; 
import "../globals.css"; 
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClerkProvider } from '@clerk/nextjs';
import { CartProvider } from "@/context/CartContext"; 
import { WishlistProvider } from "@/context/WishlistContext"; 

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

// 👇 Updated Metadata
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
        <body className={`${poppins.className} antialiased text-stone-700 bg-[#fffcf8] overflow-x-hidden`}>
          
          <CartProvider>
            <WishlistProvider>
            
              <div className="flex flex-col min-h-screen w-full">
                
                <Header/>
                
                <main className="flex-1 pt-10 md:pt-3">
                    {children}
                </main>
                
                <Footer/>
                
              </div>

            </WishlistProvider> 
          </CartProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}