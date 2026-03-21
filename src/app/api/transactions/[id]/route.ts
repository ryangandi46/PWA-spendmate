import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { TransactionService } from "@/services/transaction.service";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactionId = resolvedParams.id;
    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    await TransactionService.delete(session.user.id, transactionId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Transaction delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
