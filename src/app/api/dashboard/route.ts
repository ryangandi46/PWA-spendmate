import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DashboardService } from "@/services/dashboard.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await DashboardService.getDashboardData(session.user.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
