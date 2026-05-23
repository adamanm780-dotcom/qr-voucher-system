import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  return NextResponse.json({
    message: "✅ Gutschein aktiviert!",
    code,
    status: "ACTIVATED",
    note: "Mit echten Apple Developer Zertifikaten würde hier der Pass heruntergeladen werden.",
  });
}

