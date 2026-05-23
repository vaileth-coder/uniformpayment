import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await dbConnect();

    // Check if users already exist
    const count = await User.countDocuments();
    if (count > 0) {
      return NextResponse.json(
        { message: "Users already exist. Skipping seed." },
        { status: 200 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("password", salt);

    const users = [
      {
        username: "director",
        password,
        name: "School Director",
        role: "director",
      },
      {
        username: "mhasibu",
        password,
        name: "Accountant",
        role: "accountant",
      },
      {
        username: "muuzaji",
        password,
        name: "Seller / Cashier",
        role: "seller",
      },
    ];

    await User.insertMany(users);

    return NextResponse.json({ message: "Seed successful. Created 3 users." });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
