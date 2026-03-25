// sanity/lib/queries.ts (ya utils/queries.ts)
import { groq } from "next-sanity";

// 1. Common Fields Snippet: Ye wo fields hain jo har product card me chahiye hi chahiye
export const productCardFields = groq`
  _id,
  title,
  "slug": slug.current,
  "imageUrl": image[0].asset->url,      // Pehli image (Primary)
  "images": image[].asset->url,         // Saari images ka array (Hover ke liye)
  category,
  isHotDeal,
  stockQuantity,
  weight,
  makingCharges,
  originalPrice,
  pricingType, 
  fixedPrice,
  extraOptions[]{
    optionName,
    price,
    description
  }
`;
// 2. Category ke hisaab se fetch karne wali query (ProductGrid ke liye)
export const getProductsByCategoryQuery = groq`
  *[_type == "product" && category == $category]{
    ${productCardFields}
  }
`;

// 3. Home page pe saare products fetch karne wali query (Initial load ke liye)
export const getAllProductsQuery = groq`
  *[_type == "product"]{
    ${productCardFields}
  }
`;

// 4. Single Product ki puri details (Product Details Page ke liye)
export const getSingleProductQuery = groq`
  *[_type == "product" && slug.current == $slug][0]{
    ${productCardFields},
    description,
    "images": image[].asset->url,
    gender,
    extraOptions
  }
`;