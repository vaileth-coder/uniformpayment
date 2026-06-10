import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

const UNIFORM_ITEMS_SEED = [
  {
    itemId: "u1",
    itemName: "School shirt / blouse",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    itemId: "u2",
    itemName: "Trousers / skirt",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    itemId: "u3",
    itemName: "Sweater / jersey",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    itemId: "u4",
    itemName: "School tie",
    sizes: ["One size"],
  },
  {
    itemId: "u5",
    itemName: "School socks",
    sizes: ["S", "M", "L"],
  },
  {
    itemId: "u6",
    itemName: "School shoes",
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
  },
  {
    itemId: "u7",
    itemName: "PE kit (sports)",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    itemId: "u8",
    itemName: "Full uniform set",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
];

export async function GET() {
  try {
    await dbConnect();
    let inventory = await Inventory.find({});

    // Seed if empty
    if (inventory.length === 0) {
      const itemsToSeed = UNIFORM_ITEMS_SEED.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        stock: item.sizes.map((size) => ({
          size,
          initial: 50,
          sold: 0,
          remaining: 50,
        })),
      }));
      await Inventory.insertMany(itemsToSeed);
      inventory = await Inventory.find({});
    }

    return NextResponse.json({ inventory });
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
