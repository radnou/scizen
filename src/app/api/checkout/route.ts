import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/lemon-squeezy";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const variantId =
      typeof body.variantId === "string" ? body.variantId : (process.env.LEMONSQUEEZY_VARIANT_ID ?? "");
    const doc = await createCheckoutSession(session.userId ?? "", variantId);
    return NextResponse.json({ url: doc.attributes.url });
  } catch (e: unknown) {
    console.error("checkout error", e);
    return NextResponse.json(
      { error: (e as Error).message || "Erreur" },
      { status: 500 },
    );
  }
}
