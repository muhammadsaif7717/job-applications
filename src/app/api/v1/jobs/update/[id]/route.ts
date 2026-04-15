import { buildOwnerFilter, getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { connectDb } from "@/lib/connectDb";
import { sanitizeJobPayload } from "@/lib/job";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// PATCH /api/v1/jobs/update/:id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authenticatedUser = await getAuthenticatedUser();

    if (!authenticatedUser) {
      return unauthorizedResponse();
    }

    const { userId, userEmail } = authenticatedUser;
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, data: null, message: "Invalid Job ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const updateData = sanitizeJobPayload(body);

    if (!updateData) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Company name, position, and location are required.",
        },
        { status: 400 },
      );
    }

    const db = await connectDb();

    const updatedJob = await db.collection("jobs").findOneAndUpdate(
      {
        _id: new ObjectId(id),
        ...buildOwnerFilter(userId, userEmail),
      },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } },
      { returnDocument: "after" },
    );

    if (!updatedJob) {
      return NextResponse.json(
        { success: false, data: null, message: "Job not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...updatedJob, _id: updatedJob._id.toString() },
      message: "Application updated successfully.",
    });
  } catch (err) {
    console.error("PATCH /api/v1/jobs/update/:id error:", err);
    return NextResponse.json(
      { success: false, data: null, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
