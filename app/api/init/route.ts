import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check if Lila already exists
    const existing = await prisma.cafe.findUnique({
      where: { email: "info@lila-wiesbaden.de" },
    });

    if (existing) {
      const voucher = await prisma.voucher.findFirst({
        where: { cafeId: existing.id },
      });
      return NextResponse.json({
        status: "Lila already initialized",
        testCode: voucher?.code,
        testUrl: voucher ? `http://localhost:3000/v/${voucher.code}` : null,
      });
    }

    // Create Lila Café
    const cafe = await prisma.cafe.create({
      data: {
        name: "Lila Wiesbaden",
        email: "info@lila-wiesbaden.de",
        logoUrl: "https://via.placeholder.com/200",
        primaryColor: "#8B4C9B",
      },
    });

    // Create Batch
    const batch = await prisma.batch.create({
      data: {
        cafeId: cafe.id,
        name: "Test Batch",
        voucherType: "Gratis Asahi Bowl",
        description: "Kostenlos eine Asahi Bowl genießen!",
        quantity: 10,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Create Test Voucher
    const testCode = crypto.randomBytes(16).toString("hex");
    const voucher = await prisma.voucher.create({
      data: {
        code: testCode,
        cafeId: cafe.id,
        batchId: batch.id,
        status: "UNUSED",
      },
    });

    return NextResponse.json({
      status: "✅ Lila initialized!",
      cafe: cafe.name,
      testCode: voucher.code,
      testUrl: `http://localhost:3000/v/${voucher.code}`,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
