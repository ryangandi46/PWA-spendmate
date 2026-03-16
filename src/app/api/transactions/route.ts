import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { TransactionService } from "@/services/transaction.service";
import { createTransactionSchema } from "@/schemas/transaction.schema";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const transaction = await TransactionService.create(
      session.user.id,
      parsed.data
    );

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Transaction create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const type = searchParams.get("type") as "income" | "expense" | null;
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const result = await TransactionService.getByUser(session.user.id, {
      month: month ? parseInt(month) : undefined,
      year: year ? parseInt(year) : undefined,
      type: type || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Transaction list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
