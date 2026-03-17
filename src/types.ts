export interface ExtraOption {
    optionName: string;
    price: number;
    description?: string;
}

export interface Product {
    _id: string;
    title: string;
    description?: string; // Add this for product info
    
    // Core Logic
    weight: number;
    makingCharges: number;

    // 👇 Naye Pricing Fields (In 2 lines se pricingType wali error chali jayegi) 👇
    pricingType?: 'calculated' | 'fixed'; 
    fixedPrice?: number;

    // Pricing
    price?: number; 
    originalPrice?: number;

    // Details
    slug: string; 
    imageUrl: string;
    image?: any[]; // Gallery ke liye zaroori he
    category: string;
    isHotDeal?: boolean;
    stockQuantity: number;

    // Extras
    extraOptions?: ExtraOption[];   // Sanity data ke liye
    selectedExtras?: ExtraOption[]; // Selection store karne ke liye
}

export interface Address {
    name: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    pinCode: string;
}