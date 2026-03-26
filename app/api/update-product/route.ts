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
    const { productId, stock, weight, makingCharges, fixedPrice, isArchived } = await req.json();

    if (!productId) {
      return NextResponse.json({ message: "Product ID required" }, { status: 400 });
    }

    // --- DATA PREPARATION ---
    // ✅ FIX: Khaali object se start karein aur sirf wahi update karein jo frontend se aaya hai
    const updateData: any = {};

    if (stock !== undefined) updateData.stockQuantity = Number(stock);
    if (weight !== undefined) updateData.weight = Number(weight);
    if (makingCharges !== undefined) updateData.makingCharges = Number(makingCharges);
    if (fixedPrice !== undefined) updateData.fixedPrice = Number(fixedPrice);

    // 🛡️ ARCHIVE LOGIC: 
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