import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { RecurringService } from "@/services/recurring.service";
import { createRecurringSchema } from "@/schemas/transaction.schema";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createRecurringSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const rule = await RecurringService.create(session.user.id, parsed.data);
    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Recurring create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rules = await RecurringService.getByUser(session.user.id);
    return NextResponse.json(rules);
  } catch (error) {
    console.error("Recurring list error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
