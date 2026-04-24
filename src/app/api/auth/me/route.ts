import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth();
    return NextResponse.json({
      user: { id: session.userId, email: session.email, name: session.name },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
