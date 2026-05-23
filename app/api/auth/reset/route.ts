import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();
    await User.deleteMany({});
    return NextResponse.json({ message: "All users deleted. Now visit /api/auth/seed to create admin." });
  } catch (error: unknown) {
    console.error("Reset error:", error);
    return NextResponse.json({ error: "Failed to reset users" }, { status: 500 });
  }
}
