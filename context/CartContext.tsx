"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/nextjs"; 
import { Product } from "@/src/types"; // 👈 Global Type Import kiya

// 👇 CartItem ab Global Product se inherit karega + quantity add karega
export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void; // Input type fix kiya
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getCartTotal: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // User ID Logic (Clerk)
  const { user, isSignedIn } = useUser();
  
  // Unique key per user (taaki user A ka cart user B ko na dikhe)
  const userKey = isSignedIn && user ? `cart_${user.id}` : "cart_guest";

  // 1. Load Cart
  useEffect(() => {
    // Client-side check ensure karne ke liye
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

  const addToCart = (product: Product, quantity: number) => {
    setCartItems((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // Product properties spread karke quantity add ki
      return [...prevCart, { ...product, quantity }];
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
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
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