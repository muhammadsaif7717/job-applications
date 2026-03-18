import { connectDb } from "@/lib/connectDb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await connectDb();
    const jobs = await db.collection("jobs").find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}