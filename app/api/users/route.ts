import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { decrypt } from "@/lib/session";
import bcrypt from "bcryptjs";

// Helper to get and verify session
async function verifyDirector() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  try {
    const payload = await decrypt(token);
    if (payload.role !== "director") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET() {
  const directorSession = await verifyDirector();
  if (!directorSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await dbConnect();
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (error: unknown) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const directorSession = await verifyDirector();
  if (!directorSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await dbConnect();
    const { name, username, password, role } = await req.json();

    if (!name || !username || !password || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (role !== "accountant" && role !== "seller") {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      username,
      password: hashedPassword,
      role,
    });

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const directorSession = await verifyDirector();
  if (!directorSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Do not allow deleting self
    if (id === directorSession.userId) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

