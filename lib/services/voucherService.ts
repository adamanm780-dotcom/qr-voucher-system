import { prisma } from '@/lib/prisma';
import { generateSecureCode } from '@/lib/utils/crypto';
import { VoucherStatus } from '@prisma/client';

export async function createVouchersForBatch(batchId: string, quantity: number) {
  const vouchers = [];
  for (let i = 0; i < quantity; i++) {
    vouchers.push({
      code: generateSecureCode(),
      batchId,
      status: VoucherStatus.UNUSED,
    });
  }

  return prisma.voucher.createMany({
    data: vouchers,
    skipDuplicates: false,
  });
}

export async function getVoucherByCode(code: string) {
  return prisma.voucher.findUnique({
    where: { code },
    include: { cafe: true, batch: true },
  });
}

export async function activateVoucher(code: string, passSerialNumber?: string) {
  const voucher = await getVoucherByCode(code);

  if (!voucher) {
    throw new Error('Voucher not found');
  }

  if (voucher.status !== VoucherStatus.UNUSED) {
    throw new Error(`Voucher is already ${voucher.status}`);
  }

  return prisma.voucher.update({
    where: { code },
    data: {
      status: VoucherStatus.ACTIVATED,
      activatedAt: new Date(),
      ...(passSerialNumber && { passSerialNumber }),
    },
  });
}

export async function redeemVoucher(code: string) {
  const voucher = await getVoucherByCode(code);

  if (!voucher) {
    throw new Error('Voucher not found');
  }

  if (voucher.status !== VoucherStatus.ACTIVATED) {
    throw new Error(`Voucher cannot be redeemed. Status: ${voucher.status}`);
  }

  return prisma.voucher.update({
    where: { code },
    data: {
      status: VoucherStatus.REDEEMED,
      redeemedAt: new Date(),
    },
  });
}

export async function getVouchersByBatchId(batchId: string) {
  return prisma.voucher.findMany({
    where: { batchId },
  });
}

export async function getBatchStatistics(batchId: string) {
  const [total, unused, activated, redeemed] = await Promise.all([
    prisma.voucher.count({ where: { batchId } }),
    prisma.voucher.count({ where: { batchId, status: VoucherStatus.UNUSED } }),
    prisma.voucher.count({ where: { batchId, status: VoucherStatus.ACTIVATED } }),
    prisma.voucher.count({ where: { batchId, status: VoucherStatus.REDEEMED } }),
  ]);

  return {
    total,
    unused,
    activated,
    redeemed,
    redemptionRate: total > 0 ? ((redeemed / total) * 100).toFixed(2) : '0.00',
  };
}
