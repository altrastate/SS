import { NextResponse } from "next/server";
import { isPublicAnalyticsPath, recordAnalyticsEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { type?: string; path?: string; meta?: string };
    const type = body.type === "page_view" ? "page_view" : null;
    const path = typeof body.path === "string" ? body.path : "";
    if (!type || !isPublicAnalyticsPath(path)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await recordAnalyticsEvent(type, path);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
