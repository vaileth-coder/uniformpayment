import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Student from "@/models/Student";

const DEMO_STUDENTS = [
  {
    id: "STU001",
    fullName: "Amina Hassan Juma",
    className: "Grade 5",
    level: "primary",
  },
  {
    id: "STU002",
    fullName: "John Michael Mwenda",
    className: "Form 2",
    level: "secondary",
  },
  {
    id: "STU003",
    fullName: "Neema Godfrey Lyimo",
    className: "Grade 7",
    level: "primary",
  },
  {
    id: "STU004",
    fullName: "Kelvin Peter Msigwa",
    className: "Form 4",
    level: "secondary",
  },
];

export async function GET() {
  try {
    await dbConnect();
    let students = await Student.find({}).sort({ createdAt: -1 });

    // Seed if empty
    if (students.length === 0) {
      await Student.insertMany(DEMO_STUDENTS);
      students = await Student.find({}).sort({ createdAt: -1 });
    }

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { id, fullName, className, level } = await req.json();

    if (!id || !fullName || !className || !level) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingStudent = await Student.findOne({ id: id.toUpperCase() });
    if (existingStudent) {
      return NextResponse.json({ error: "Student ID already exists" }, { status: 400 });
    }

    const newStudent = await Student.create({
      id: id.toUpperCase(),
      fullName,
      className,
      level,
    });

    return NextResponse.json({ message: "Student registered successfully", student: newStudent });
  } catch (error) {
    console.error("Failed to register student:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const deletedStudent = await Student.findOneAndDelete({ id: id.toUpperCase() });
    if (!deletedStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Failed to delete student:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
