import { connectDb } from "@/lib/connectDb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            companyName,
            position,
            jobLink,
            location,
            jobType,
            status,
            via,
            note,
            priority,
            date,
        } = body;

        // 🔹 Basic validation
        if (!companyName || !position || !jobLink) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        const db = await connectDb();

        const newJob = {
            companyName,
            position,
            jobLink,
            location,
            jobType,
            status: status || "applied",
            via,
            note,
            priority: priority || "medium",
            date: date || new Date().toISOString().split("T")[0],

            isActive: true,

            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const result = await db.collection("jobs").insertOne(newJob);

        return NextResponse.json({
            success: true,
            data: { _id: result.insertedId, ...newJob },
        });
    } catch (error) {
        console.error("POST ERROR:", error);

        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}