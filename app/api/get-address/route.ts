import { createClient } from "next-sanity";
import { NextResponse } from "next/server";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false, // Fresh data ke liye false
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ message: "User ID missing" }, { status: 400 });
    }

    // Sirf usi user ke address fetch karo
    const query = `*[_type == "address" && userId == $userId]`;
    const addresses = await client.fetch(query, { userId });

    return NextResponse.json({ addresses }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error fetching addresses" }, { status: 500 });
  }
}