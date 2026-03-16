import { NextResponse } from "next/server";
import { AIEngine } from "@/services/ai-engine";

// Vercel Cron: runs daily
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await AIEngine.runPipeline();
    return NextResponse.json({
      success: true,
      message: "AI engine pipeline completed",
    });
  } catch (error) {
    console.error("AI engine cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
