import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

// 🔴 Secure Client with Write Access
const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN, 
  useCdn: false, 
});

export async function POST(req: Request) {
  try {
    // 👇 Admin Panel se ab ye extra fields bhi handle honge
    const { productId, stock, weight, makingCharges, fixedPrice, isArchived } = await req.json();

    if (!productId) {
      return NextResponse.json({ message: "Product ID required" }, { status: 400 });
    }

    // --- DATA PREPARATION ---
    const updateData: any = {
        stockQuantity: Number(stock),
        weight: Number(weight),
        makingCharges: Number(makingCharges),
    };

    // Agar Admin ne fixedPrice bheja hai toh use set karein
    if (fixedPrice !== undefined) {
        updateData.fixedPrice = Number(fixedPrice);
    }

    // 🛡️ ARCHIVE LOGIC: 
    // Delete ki jagah hum is document par 'isArchived' flag laga denge
    if (isArchived !== undefined) {
        updateData.isArchived = Boolean(isArchived);
        // Agar archive kar rahe hain toh stock automatically 0 kar dete hain
        if (isArchived === true) updateData.stockQuantity = 0;
    }

    // Sanity Patch Execution
    const result = await writeClient
      .patch(productId)
      .set(updateData)
      .commit();

    return NextResponse.json({ 
        message: "Product Updated Successfully", 
        result 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Update failed:", error);
    return NextResponse.json({ 
        message: "Error updating product", 
        error: error.message 
    }, { status: 500 });
  }
}