import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

// Sanity Client setup with Write Token
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Aapka secret token yahan use hoga
  apiVersion: '2023-05-03',
});

export async function POST(req: Request) {
  try {
    const { productId, name, rating, comment } = await req.json();

    if (!productId || !name || !rating || !comment) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a new review document in Sanity
    const newReview = await writeClient.create({
      _type: 'review',
      name,
      rating: Number(rating),
      comment,
      product: {
        _type: 'reference',
        _ref: productId, // Yeh product ID ko review se connect karega
      },
      approved: false, // Default false taaki admin pehle check kare
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: "Review submitted successfully", reviewId: newReview._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sanity Write Error:", error);
    return NextResponse.json(
      { message: "Failed to create review", error },
      { status: 500 }
    );
  }
}