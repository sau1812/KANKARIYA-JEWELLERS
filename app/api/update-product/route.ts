import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function POST(req: Request) {
  try {
    const { productId, price, stock } = await req.json();

    if (!productId) {
      return NextResponse.json({ message: "Product ID required" }, { status: 400 });
    }

    // Sanity Patch
    await client
      .patch(productId)
      .set({ 
          price: price,
          stockQuantity: stock 
      })
      .commit();

    return NextResponse.json({ message: "Product Updated" }, { status: 200 });

  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ message: "Error updating product" }, { status: 500 });
  }
}