import type { NextRequest } from "next/server";
import { getAkta } from "@/services/kelahiran.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format") === "pdf" ? "pdf" : "docx";

  try {
    const { buffer, contentType, filename } = await getAkta(id, format);
    return new Response(Buffer.from(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return new Response("Gagal membuat akta kelahiran. Coba lagi.", { status: 500 });
  }
}
