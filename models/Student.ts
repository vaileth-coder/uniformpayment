import mongoose, { Schema, model, models } from "mongoose";

const StudentSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["primary", "secondary"],
    },
  },
  { timestamps: true }
);

const Student = models.Student || model("Student", StudentSchema, "students");

export default Student;
