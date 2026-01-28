import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    // Sanity mein document create karna
    await client.create({
      _type: "marketingNumber",
      phoneNumber: phoneNumber,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Subscribed successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error saving number" }, { status: 500 });
  }
}