export interface Product {
    _id: string;
    title: string;
    price: number;
    originalPrice?: number;
    slug: string; // Slug string format mein chahiye
    imageUrl: string;
    category: string;
    isHotDeal: boolean;
    stockQuantity: number;
}

// ... purane types ke neeche add karein

export interface Address {
  name: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  pinCode: string;
}