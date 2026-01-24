"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/nextjs"; 
import { Product } from "@/src/types"; 

// 👇 FIX: CartItem mein 'price' ko Required banana padega
// Hum 'Omit' use kar rahe hain taaki Product ka optional price hata sakein aur required price laga sakein
export interface CartItem extends Omit<Product, 'price'> {
  quantity: number;
  price: number; // ✅ Cart me price hamesha hona chahiye (Calculated wala)
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getCartTotal: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user, isSignedIn } = useUser();
  
  // Unique Storage Key
  const userKey = isSignedIn && user ? `cart_${user.id}` : "cart_guest";

  // 1. Load Cart
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedCart = localStorage.getItem(userKey);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart", error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [userKey]);

  // 2. Save Cart
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(userKey, JSON.stringify(cartItems));
  }, [cartItems, userKey]);

  // 👇 ADD TO CART UPDATE
  const addToCart = (product: Product, quantity: number) => {
    // Safety Check: Agar price undefined hai (DB se), toh add mat karo
    // Lekin ProductCard se hum calculated price bhej rahe hain, so it should work.
    const priceToStore = product.price || 0; 

    setCartItems((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // Naya item add karte waqt ensure karein ki 'price' number hai
      const newItem: CartItem = {
          ...product,
          quantity,
          price: priceToStore // ✅ Type safe assignment
      };

      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevCart) => prevCart.filter((item) => item._id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCartItems((prevCart) =>
      prevCart.map((item) =>
        item._id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, getCartTotal, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};