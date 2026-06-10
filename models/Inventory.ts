import mongoose, { Schema, model, models } from "mongoose";

const StockLevelSchema = new Schema({
  size: { type: String, required: true },
  initial: { type: Number, required: true, default: 50 },
  sold: { type: Number, required: true, default: 0 },
  remaining: { type: Number, required: true, default: 50 },
});

const InventorySchema = new Schema(
  {
    itemId: {
      type: String,
      required: true,
      unique: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    stock: [StockLevelSchema],
  },
  { timestamps: true }
);

const Inventory = models.Inventory || model("Inventory", InventorySchema, "inventory");

export default Inventory;
