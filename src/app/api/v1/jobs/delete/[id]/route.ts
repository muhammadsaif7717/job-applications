import { buildOwnerFilter, getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { connectDb } from "@/lib/connectDb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
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
        { success: false, data: null, message: "Invalid ID" },
        { status: 400 },
      );
    }

    const db = await connectDb();

    const result = await db
      .collection("jobs")
      .deleteOne({
        _id: new ObjectId(id),
        ...buildOwnerFilter(userId, userEmail),
      });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, data: null, message: "Job not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: "Job deleted successfully",
    });
  } catch (err) {
    console.error("DELETE job error:", err);
    return NextResponse.json(
      { success: false, data: null, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
