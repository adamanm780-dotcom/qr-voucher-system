import { NextResponse } from "next/server";

const vouchersData: Record<string, any> = {
  "e70aabce7e379c1a3fbfa6617a22b683": {
    id: "009675b8-a55e-4da1-b7a8-0c49db5cd25d",
    code: "e70aabce7e379c1a3fbfa6617a22b683",
    status: "UNUSED",
    batch: {
      id: "a6c63ea8-55bf-4949-812a-3c7ac0ef0b28",
      voucherType: "Gratis Asahi Bowl",
      description: "Kostenlos eine Asahi Bowl genießen!",
    },
    cafe: {
      id: "894a4cc8-5e2b-4543-bdc9-7ffe90f736ca",
      name: "Lila Wiesbaden",
      logoUrl: "https://via.placeholder.com/200",
      primaryColor: "#8B4C9B",
    },
  },
};

export async function GET(request: Request, { params }: { params: { code: string } }) {
  try {
    const voucher = vouchersData[params.code];

    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    return NextResponse.json(voucher);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
