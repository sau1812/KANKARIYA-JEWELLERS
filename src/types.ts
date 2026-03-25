export interface ExtraOption {
    optionName: string;
    price: number;
    description?: string;
}

export interface Product {
    _id: string;
    title: string;
    description?: string; 
    
    // Core Logic
    weight: number;
    makingCharges: number;

    // Pricing Fields
    pricingType?: 'calculated' | 'fixed'; 
    fixedPrice?: number;

    // Pricing
    price?: number; 
    originalPrice?: number;

    // Details
    slug: string; 
    imageUrl: string;
    
    // 👇 YAHAN CHANGE KIYA HAI (images array add ki hai hover ke liye)
    image?: any[]; 
    images?: string[]; // Isse ProductCard wala error chala jayega
    
    category: string;
    isHotDeal?: boolean;
    stockQuantity: number;

    // Extras
    extraOptions?: ExtraOption[];   
    selectedExtras?: ExtraOption[]; 
}

export interface Address {
    name: string;
    phone: string;
    streetAddress: string;
    city: string;
    state: string;
    pinCode: string;
}