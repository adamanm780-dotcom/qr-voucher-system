import { NextResponse } from "next/server";

export function GET(
  _request: Request,
  { params }: { params: { code: string } }
) {
  return NextResponse.json({
    message: "✅ Gutschein aktiviert!",
    code: params.code,
    status: "ACTIVATED",
    note: "Mit echten Apple Developer Zertifikaten würde hier der Pass heruntergeladen werden.",
  });
}

