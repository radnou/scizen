import { NextRequest, NextResponse } from "next/server";
import { handleWebhook } from "@/lib/lemon-squeezy";

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as Record<string, unknown>;
    await handleWebhook(payload);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error("webhook error", e);
    return NextResponse.json(
      { error: (e as Error).message || "Erreur" },
      { status: 500 },
    );
  }
}
