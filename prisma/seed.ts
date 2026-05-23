import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  // Create Lila Café
  const cafe = await prisma.cafe.create({
    data: {
      name: "Lila Wiesbaden",
      email: "info@lila-wiesbaden.de",
      logoUrl: "https://via.placeholder.com/200",
      primaryColor: "#8B4C9B", // Lila/Purple
    },
  });

  console.log("✅ Café created:", cafe.name);

  // Create Batch
  const batch = await prisma.batch.create({
    data: {
      cafeId: cafe.id,
      name: "Test Batch",
      voucherType: "Gratis Asahi Bowl",
      description: "Kostenlos eine Asahi Bowl genießen!",
      quantity: 10,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage
    },
  });

  console.log("✅ Batch created:", batch.name);

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

  console.log("✅ Test Voucher created!");
  console.log("📝 Voucher Code:", voucher.code);
  console.log("🔗 Test URL: http://localhost:3000/v/" + voucher.code);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
