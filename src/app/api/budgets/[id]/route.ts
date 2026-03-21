import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { BudgetService } from "@/services/budget.service";

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

    const budgetId = resolvedParams.id;
    if (!budgetId) {
      return NextResponse.json({ error: "Budget ID is required" }, { status: 400 });
    }

    await BudgetService.delete(session.user.id, budgetId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Budget delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
