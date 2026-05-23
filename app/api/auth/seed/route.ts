import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await dbConnect();

    // Check if admin user already exists
    const adminExists = await User.findOne({ username: "admin" });
    if (adminExists) {
      return NextResponse.json(
        { message: "Admin user already exists. Skipping seed." },
        { status: 200 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("admin123", salt);

    const users = [
      {
        username: "admin",
        password,
        name: "School Director",
        role: "director",
      },
    ];

    await User.insertMany(users);

    return NextResponse.json({ message: "Seed successful. Created admin user." });
  } catch (error: unknown) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
