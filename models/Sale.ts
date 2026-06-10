import mongoose, { Schema, model, models } from "mongoose";

const SaleLineSchema = new Schema({
  name: { type: String, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  subtotal: { type: Number, required: true },
});

const SaleSchema = new Schema(
  {
    receiptNo: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved"],
      default: "pending",
    },
    paidAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    student: {
      id: { type: String, required: true },
      fullName: { type: String, required: true },
      className: { type: String, required: true },
      level: { type: String, required: true },
    },
    lines: [SaleLineSchema],
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Sale = models.Sale || model("Sale", SaleSchema, "sales");

export default Sale;
