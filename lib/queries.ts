// lib/queries.js ya jaha aap queries rakhte hain

export const productAndRateQuery = `
{
  "products": *[_type == "product"] {
    _id,
    title,
    slug,
    weight,
    makingCharges, // Ye ab % me hai
    stockQuantity,
    "imageUrl": image[0].asset->url,
    category
  },
  "silverRate": *[_type == "silverRate"][0].ratePerGram
}`;