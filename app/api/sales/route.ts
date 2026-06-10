import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Sale from "@/models/Sale";
import Inventory from "@/models/Inventory";

export async function GET() {
  try {
    await dbConnect();
    const sales = await Sale.find({}).sort({ paidAt: -1 });
    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Failed to fetch sales:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { receiptNo, student, lines, total, paymentMethod } = await req.json();

    if (!receiptNo || !student || !lines || !total || !paymentMethod) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const newSale = await Sale.create({
      receiptNo,
      student,
      lines,
      total,
      paymentMethod,
      status: "pending", // Start as pending until director approves
    });

    return NextResponse.json({ message: "Sale recorded as pending", sale: newSale });
  } catch (error) {
    console.error("Failed to record sale:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const { id, action } = await req.json();

    if (!id || action !== "approve") {
      return NextResponse.json({ error: "Invalid action or ID" }, { status: 400 });
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    if (sale.status === "approved") {
      return NextResponse.json({ error: "Sale is already approved" }, { status: 400 });
    }

    // Update sale status
    sale.status = "approved";
    await sale.save();

    // Reduce inventory stock for each item sold
    for (const line of sale.lines) {
      // Find the uniform item name matching or query by searching item name in inventory
      // In UniformPaymentApp, items are mapped from UNIFORM_ITEMS (id like 'u1', name like 'School shirt / blouse')
      // Let's find inventory document by matching name
      const invItem = await Inventory.findOne({ itemName: line.name });
      if (invItem) {
        const stockSize = invItem.stock.find((s: { size: string; sold: number; remaining: number; initial: number }) => s.size === line.size);
        if (stockSize) {
          stockSize.sold += line.quantity;
          stockSize.remaining = Math.max(0, stockSize.initial - stockSize.sold);
          invItem.markModified("stock");
          await invItem.save();
        }
      }
    }

    return NextResponse.json({ message: "Sale approved and stock updated", sale });
  } catch (error) {
    console.error("Failed to approve sale:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Sale ID is required" }, { status: 400 });
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // If sale was already approved, restock items back into inventory
    if (sale.status === "approved") {
      for (const line of sale.lines) {
        const invItem = await Inventory.findOne({ itemName: line.name });
        if (invItem) {
          const stockSize = invItem.stock.find((s: { size: string; sold: number; remaining: number; initial: number }) => s.size === line.size);
          if (stockSize) {
            stockSize.sold = Math.max(0, stockSize.sold - line.quantity);
            stockSize.remaining = Math.max(0, stockSize.initial - stockSize.sold);
            invItem.markModified("stock");
            await invItem.save();
          }
        }
      }
    }

    await Sale.findByIdAndDelete(id);

    return NextResponse.json({ message: "Sale deleted successfully and inventory adjusted" });
  } catch (error) {
    console.error("Failed to delete sale:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
