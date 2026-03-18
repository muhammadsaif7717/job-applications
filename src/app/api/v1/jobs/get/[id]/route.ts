import { connectDb } from "@/lib/connectDb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ Next.js 15: params is a Promise
) {
  try {
    const { id } = await params; // ✅ must be awaited — was missing before

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Job ID" }, { status: 400 });
    }

    const db = await connectDb();
    const job = await db.collection("jobs").findOne({ _id: new ObjectId(id) });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (err) {
    console.error("GET /api/v1/jobs/get/:id error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}