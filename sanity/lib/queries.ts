import { groq } from "next-sanity";

// 1. Optimized Fields: Home page/Grid ke liye zaruri cheezein + Naye schema ke fields
export const productCardFields = groq`
  _id,
  title,
  "slug": slug.current,
  "imageUrl": image[0].asset->url, 
  category,
  // 👇 Yahan se saari NAYI fields add kar di hain
  pricingType,
  weight,
  makingCharges,
  fixedPrice,
  // 👇 Purani fields (price, originalPrice) ab nikal di hain kyunki unki zarurat nahi 
  isHotDeal,
  stockQuantity
`;

// 2. Category Query (Optimized)
export const getProductsByCategoryQuery = groq`
  *[_type == "product" && category == $category && isArchived != true]{
    ${productCardFields}
  }
`;

// 3. All Products (Home Page ke liye - SABSE FAST)
export const getAllProductsQuery = groq`
  *[_type == "product" && isArchived != true] | order(_createdAt desc) {
    ${productCardFields}
  }
`;

// 4. Single Product (Isme saari images mangwayein, kyunki ye alag page hai)
export const getSingleProductQuery = groq`
  *[_type == "product" && slug.current == $slug && isArchived != true][0]{
    ${productCardFields},
    description,
    "images": image[].asset->url, 
    gender,
    // (weight, makingCharges, pricingType already productCardFields se aa jayenge, isliye yahan se hata sakte ho par rakhe bhi toh error nahi hai)
    extraOptions
  }
`;