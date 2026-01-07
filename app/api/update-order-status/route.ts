import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function POST(req: Request) {
  try {
    const { orderId, status } = await req.json();

    // Debugging ke liye console log
    console.log("Received Update Request:", { orderId, status });

    if (!orderId || !status) {
      return NextResponse.json({ message: "Invalid Data" }, { status: 400 });
    }

    // 👇 Ensure token is used for write operations
    const clientWithToken = client.withConfig({
      token: process.env.SANITY_API_TOKEN, 
      useCdn: false, // Write karte waqt CDN false hona chahiye
    });

    // Sanity Patch
    await clientWithToken
      .patch(orderId)
      .set({ status: status })
      .commit();

    return NextResponse.json({ message: "Status Updated" }, { status: 200 });

  } catch (error) {
    console.error("Status Update Failed:", error);
    return NextResponse.json({ message: "Error updating status", error }, { status: 500 });
  }
}