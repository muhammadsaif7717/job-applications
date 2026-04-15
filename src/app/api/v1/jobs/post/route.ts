import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth";
import { connectDb } from "@/lib/connectDb";
import { sanitizeJobPayload } from "@/lib/job";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const authenticatedUser = await getAuthenticatedUser();

    if (!authenticatedUser) {
      return unauthorizedResponse();
    }

    const { userId, userEmail } = authenticatedUser;
    const body = await req.json();
    const payload = sanitizeJobPayload(body);

    if (!payload) {
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
    const timestamp = new Date().toISOString();

    const newJob = {
      ...payload,
      userId,
      userEmail,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const result = await db.collection("jobs").insertOne(newJob);

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId.toString(), ...newJob },
      message: "Application created successfully.",
    });
  } catch (error) {
    console.error("POST ERROR:", error);

    return NextResponse.json(
      { success: false, data: null, message: "Server error" },
      { status: 500 },
    );
  }
}
