import { buildOwnerFilter, getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { connectDb } from "@/lib/connectDb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  void req;
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

    const db = await connectDb();
    const job = await db.collection("jobs").findOne({
      _id: new ObjectId(id),
      ...buildOwnerFilter(userId, userEmail),
    });

    if (!job) {
      return NextResponse.json(
        { success: false, data: null, message: "Job not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { ...job, _id: job._id.toString() },
      message: "Application fetched successfully.",
    });
  } catch (err) {
    console.error("GET /api/v1/jobs/get/:id error:", err);
    return NextResponse.json(
      { success: false, data: null, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
