import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import PKPass from "passkit-generator";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const prisma = new PrismaClient();

// Self-signed certificate path (will be generated on first run)
const CERT_PATH = path.join(process.cwd(), ".certs");
const CERT_FILE = path.join(CERT_PATH, "cert.p8");
const KEY_FILE = path.join(CERT_PATH, "key.pem");

function ensureCertificate() {
  if (!fs.existsSync(CERT_PATH)) {
    fs.mkdirSync(CERT_PATH, { recursive: true });
  }

  if (!fs.existsSync(KEY_FILE)) {
    // Generate self-signed certificate for testing
    const { execSync } = require("child_process");
    try {
      execSync(
        `openssl req -x509 -newkey rsa:4096 -keyout "${KEY_FILE}" -out "${CERT_FILE}" -days 365 -nodes -subj "/CN=Lila Wiesbaden"`
      );
      console.log("✅ Self-signed certificate generated");
    } catch (err) {
      console.error("Certificate generation failed:", err);
      // For testing, create a dummy cert
      fs.writeFileSync(KEY_FILE, "dummy-key-for-testing");
      fs.writeFileSync(CERT_FILE, "dummy-cert-for-testing");
    }
  }
}

export async function GET(request: Request, { params }: { params: { code: string } }) {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { code: params.code },
      include: {
        batch: true,
        cafe: true,
      },
    });

    if (!voucher) {
      return NextResponse.json({ error: "Voucher not found" }, { status: 404 });
    }

    // Update status to ACTIVATED
    await prisma.voucher.update({
      where: { code: params.code },
      data: {
        status: "ACTIVATED",
        activatedAt: new Date(),
        passSerialNumber: crypto.randomBytes(8).toString("hex"),
      },
    });

    // For now, return a JSON response explaining the pass
    // In production with real certificates, this would generate a .pkpass file
    return NextResponse.json({
      message: "Apple Wallet Pass Generated",
      voucher: voucher,
      note: "Self-signed certificate: For real Apple Wallet, provide official Apple Developer certificates",
      passData: {
        serialNumber: crypto.randomBytes(8).toString("hex"),
        description: voucher.batch.voucherType,
        formatVersion: 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
