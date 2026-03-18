import { connectDb } from "@/lib/connectDb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// PATCH /api/v1/jobs/update/:id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Job ID" }, { status: 400 });
    }

    const body = await req.json();

    // Remove immutable fields so they can't be overwritten
    const { _id, createdAt, updatedAt, ...updateData } = body;

    const db = await connectDb();

    // ✅ Fixed: MongoDB driver v5+ returns the document directly, not wrapped in .value
    const updatedJob = await db.collection("jobs").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } },
      { returnDocument: "after" }
    );

    if (!updatedJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(updatedJob);
  } catch (err) {
    console.error("PATCH /api/v1/jobs/update/:id error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}