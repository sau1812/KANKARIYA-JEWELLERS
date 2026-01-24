import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

// 🔴 Secure Client with Write Access
const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN, // 👈 Environment variable se token le raha hai
  useCdn: false, // Fresh data ke liye CDN band
});

export async function POST(req: Request) {
  try {
    // 👇 Admin Panel se ye 4 cheezein aa rahi hain
    const { productId, stock, weight, makingCharges } = await req.json();

    if (!productId) {
      return NextResponse.json({ message: "Product ID required" }, { status: 400 });
    }

    // Sanity Patch
    await writeClient
      .patch(productId)
      .set({ 
          stockQuantity: Number(stock),
          weight: Number(weight),
          makingCharges: Number(makingCharges)
          // Note: Hum 'price' update nahi kar rahe kyunki wo ab calculate hota hai
      })
      .commit();

    return NextResponse.json({ message: "Product Updated Successfully" }, { status: 200 });

  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ message: "Error updating product" }, { status: 500 });
  }
}