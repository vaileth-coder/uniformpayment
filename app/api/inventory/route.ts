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

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { itemId, itemName, sizes } = await req.json();

    if (!itemId || !itemName || !sizes || !Array.isArray(sizes)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const existing = await Inventory.findOne({ itemId });
    if (existing) {
      return NextResponse.json({ error: "Uniform code (itemId) already exists" }, { status: 400 });
    }

    const newInventoryItem = await Inventory.create({
      itemId,
      itemName,
      stock: sizes.map((size: string) => ({
        size,
        initial: 50,
        sold: 0,
        remaining: 50,
      })),
    });

    return NextResponse.json({ message: "Inventory item created", item: newInventoryItem });
  } catch (error) {
    console.error("Failed to create inventory item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const { id, stock } = await req.json(); // stock: array of { size, initial }

    if (!id || !stock || !Array.isArray(stock)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const invItem = await Inventory.findById(id);
    if (!invItem) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }

    // Update each size's initial and remaining stock
    for (const update of stock) {
      const sizeStock = invItem.stock.find((s: { size: string }) => s.size === update.size);
      if (sizeStock) {
        sizeStock.initial = Number(update.initial);
        // remaining = initial - sold
        sizeStock.remaining = Math.max(0, sizeStock.initial - sizeStock.sold);
      }
    }

    invItem.markModified("stock");
    await invItem.save();

    return NextResponse.json({ message: "Stock updated successfully", item: invItem });
  } catch (error) {
    console.error("Failed to update inventory stock:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedItem = await Inventory.findByIdAndDelete(id);
    if (!deletedItem) {
      return NextResponse.json({ error: "Inventory item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("Failed to delete inventory item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
