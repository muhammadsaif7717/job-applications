import { buildOwnerFilter, getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { connectDb } from "@/lib/connectDb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const authenticatedUser = await getAuthenticatedUser();

    if (!authenticatedUser) {
      return unauthorizedResponse();
    }

    const { userId, userEmail } = authenticatedUser;
    const db = await connectDb();
    const jobs = await db
      .collection("jobs")
      .find(buildOwnerFilter(userId, userEmail))
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: jobs.map((job) => ({ ...job, _id: job._id.toString() })),
      message: "Applications fetched successfully.",
    });
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json(
      { success: false, data: [], message: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}
