import { NextResponse } from "next/server";
import { recordAnalyticsEvent } from "@/lib/analytics";
import { getPublishedDownload } from "@/lib/content";
import { siteUrl } from "@/lib/utils";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getPublishedDownload(id);
  if (!item) {
    return NextResponse.redirect(new URL("/downloads", siteUrl()));
  }
  await recordAnalyticsEvent("download", `/downloads/file/${item.id}`, item.category);
  return NextResponse.redirect(new URL(item.fileUrl, siteUrl()));
}
