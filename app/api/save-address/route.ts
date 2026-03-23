import { createClient } from "next-sanity";
import { NextResponse } from "next/server";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Ensure this token has 'Editor' permissions
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, streetAddress, city, state, pinCode, isDefault, userId } = body;

    if (!name || !streetAddress || !city || !pinCode || !phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1. Pehle check karo ki kya is phone number se koi address pehle se hai?
    const existingAddress = await client.fetch(
      `*[_type == "address" && phone == $phone][0]._id`,
      { phone }
    );

    let result;

    if (existingAddress) {
      // 2. Agar hai, toh use UPDATE (patch) karo
      result = await client
        .patch(existingAddress)
        .set({
          name,
          email,
          streetAddress,
          city,
          state,
          pinCode,
          isDefault,
          userId,
          _updatedAt: new Date().toISOString(),
        })
        .commit();
      console.log("Address Updated:", result._id);
    } else {
      // 3. Agar nahi hai, toh NAYA create karo
      result = await client.create({
        _type: "address",
        name,
        email,
        phone,
        streetAddress,
        city,
        state,
        pinCode,
        isDefault,
        userId,
      });
      console.log("New Address Created:", result._id);
    }

    return NextResponse.json({ 
      message: existingAddress ? "Address Updated!" : "Address Saved!", 
      data: result 
    }, { status: 200 });

  } catch (error) {
    console.error("Sanity Error:", error);
    return NextResponse.json({ message: "Error processing address" }, { status: 500 });
  }
}