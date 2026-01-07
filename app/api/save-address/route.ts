import { createClient } from "next-sanity";
import { NextResponse } from "next/server";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false, // Write karte waqt false rakhein
  token: process.env.SANITY_API_TOKEN, // 👈 Token zaroori hai
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, streetAddress, city, state, pinCode, isDefault, userId } = body;

    if (!name || !streetAddress || !city || !pinCode || !userId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newAddress = await client.create({
      _type: "address",
      name,
      email,
      phone,
      streetAddress,
      city,
      state,
      pinCode,
      isDefault,
      userId // 👈 User ID save ho raha hai
    });

    return NextResponse.json({ message: "Address Saved!", data: newAddress }, { status: 200 });
  } catch (error) {
    console.error("Sanity Error:", error);
    return NextResponse.json({ message: "Error saving address" }, { status: 500 });
  }
}