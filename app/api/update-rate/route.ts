import { NextResponse } from "next/server";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(req: Request) {
  try {
    const { rate } = await req.json();

    // 1. Check if rate document exists
    const query = `*[_type == "silverRate"][0]._id`;
    const docId = await writeClient.fetch(query);

    if (docId) {
       await writeClient.patch(docId).set({ ratePerGram: rate }).commit();
    } else {
       await writeClient.create({ _type: 'silverRate', ratePerGram: rate });
    }

    return NextResponse.json({ message: "Rate Updated" });
  } catch (error) {
    console.error("Rate Update Error:", error); // 👈 Terminal me error dikhayega
    return NextResponse.json({ message: "Failed to update rate" }, { status: 500 });
  }
}