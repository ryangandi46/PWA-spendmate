import { NextResponse } from "next/server";
import { RecurringService } from "@/services/recurring.service";

// Vercel Cron: runs daily
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await RecurringService.processRecurring();
    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} recurring transactions`,
    });
  } catch (error) {
    console.error("Recurring cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
