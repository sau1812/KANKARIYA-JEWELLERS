// src/types.ts (Update this file)

export interface Product {
    _id: string;
    title: string;
    
    // 👇 Ye 2 naye fields add karna zaroori hai (Error fix karne ke liye)
    weight: number;
    makingCharges: number;

    // Price ab optional (?) rakhein, kyunki database se fixed price nahi aayega
    price?: number; 
    originalPrice?: number;

    slug: string; 
    imageUrl: string;
    category: string;
    isHotDeal: boolean;
    stockQuantity: number;
}

export interface Address {
    name: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    pinCode: string;
}