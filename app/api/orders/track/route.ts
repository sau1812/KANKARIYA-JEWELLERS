import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function POST(req: Request) {
  try {
    const { userId, phone } = await req.json();

    let query = "";
    let params = {};

    if (userId) {
      // Login user ke liye query
      query = `*[_type == "order" && clerkUserId == $userId] | order(orderDate desc)`;
      params = { userId };
    } else if (phone) {
      // Guest user ke liye phone number query
      query = `*[_type == "order" && phone == $phone] | order(orderDate desc)`;
      params = { phone };
    } else {
      return NextResponse.json({ message: "No identifier provided" }, { status: 400 });
    }

    const orders = await client.fetch(query, params);
    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}