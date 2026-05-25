'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createHash, createSign } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

interface ZipFile {
  name: string;
  data: Buffer;
}

function createSimpleZip(files: ZipFile[]): Buffer {
  const chunks: Buffer[] = [];
  let offset = 0;
  const centralDir: Buffer[] = [];
  const fileHeaders: Array<{ header: Buffer; data: Buffer; name: string; crc: number; size: number }> = [];

  for (const file of files) {
    const nameBytes = Buffer.from(file.name);
    const crc = calculateCRC32(file.data);
    const compressedData = file.data;

    const header = Buffer.alloc(30 + nameBytes.length);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0, 6);
    header.writeUInt16LE(0, 8);
    header.writeUInt16LE(0, 10);
    header.writeUInt32LE(0, 12);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(compressedData.length, 18);
    header.writeUInt32LE(file.data.length, 22);
    header.writeUInt16LE(nameBytes.length, 26);
    header.writeUInt16LE(0, 28);
    nameBytes.copy(header, 30);

    fileHeaders.push({ header, data: compressedData, name: file.name, crc, size: file.data.length });
  }

  for (const fh of fileHeaders) {
    chunks.push(fh.header);
    chunks.push(fh.data);

    const cdHeader = Buffer.alloc(46 + fh.name.length);
    cdHeader.writeUInt32LE(0x02014b50, 0);
    cdHeader.writeUInt16LE(20, 4);
    cdHeader.writeUInt16LE(20, 6);
    cdHeader.writeUInt16LE(0, 8);
    cdHeader.writeUInt16LE(0, 10);
    cdHeader.writeUInt32LE(0, 12);
    cdHeader.writeUInt32LE(fh.crc, 16);
    cdHeader.writeUInt32LE(fh.data.length, 20);
    cdHeader.writeUInt32LE(fh.size, 24);
    cdHeader.writeUInt16LE(fh.name.length, 28);
    cdHeader.writeUInt16LE(0, 30);
    cdHeader.writeUInt16LE(0, 32);
    cdHeader.writeUInt16LE(0, 34);
    cdHeader.writeUInt32LE(0, 36);
    cdHeader.writeUInt32LE(offset, 42);
    Buffer.from(fh.name).copy(cdHeader, 46);

    centralDir.push(cdHeader);
    offset += fh.header.length + fh.data.length;
  }

  const centralDirData = Buffer.concat(centralDir);
  const cdOffset = offset;

  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(centralDir.length, 8);
  endRecord.writeUInt16LE(centralDir.length, 10);
  endRecord.writeUInt32LE(centralDirData.length, 12);
  endRecord.writeUInt32LE(cdOffset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...chunks, centralDirData, endRecord]);
}

function calculateCRC32(data: Buffer): number {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }

  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code') || 'test-voucher';

    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: 'pass.com.lila.gutschein',
      teamIdentifier: 'LILA123456',
      serialNumber: code,
      description: 'Gratis Asahi Bowl - Lila Wiesbaden',
      organizationName: 'Lila Wiesbaden',
      logoText: 'Gutschein',
      coupon: {
        primaryFields: [
          {
            key: 'offer',
            label: 'ANGEBOT',
            value: 'Gratis Asahi Bowl',
            textAlignment: 'PKTextAlignmentCenter'
          }
        ],
        secondaryFields: [
          {
            key: 'venue',
            label: 'ORT',
            value: 'Lila Wiesbaden'
          }
        ],
        backgroundColor: 'rgb(139, 76, 155)',
        foregroundColor: 'rgb(255, 255, 255)'
      },
      barcode: {
        format: 'PKBarcodeFormatQR',
        message: code,
        messageEncoding: 'utf-8'
      }
    };

    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0d, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
      0x00, 0x00, 0x03, 0x00, 0x01, 0x1b, 0xe6, 0x21, 0xbc, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ]);

    const passString = JSON.stringify(passJson);
    const manifest: Record<string, string> = {};
    manifest['pass.json'] = createHash('sha1').update(passString).digest('hex');
    manifest['icon.png'] = createHash('sha1').update(png).digest('hex');
    manifest['icon@2x.png'] = createHash('sha1').update(png).digest('hex');
    manifest['logo.png'] = createHash('sha1').update(png).digest('hex');

    const manifestString = JSON.stringify(manifest);
    const keyPath = join(process.cwd(), 'pass.key');

    try {
      const keyData = readFileSync(keyPath, 'utf-8');
      const signer = createSign('RSA-SHA1');
      signer.update(manifestString);
      const signature = signer.sign(keyData);

      const zipFiles: ZipFile[] = [
        { name: 'pass.json', data: Buffer.from(passString) },
        { name: 'icon.png', data: png },
        { name: 'icon@2x.png', data: png },
        { name: 'logo.png', data: png },
        { name: 'manifest.json', data: Buffer.from(manifestString) },
        { name: 'signature', data: signature },
      ];

      const pkpass = createSimpleZip(zipFiles);

      return new NextResponse(pkpass, {
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': `attachment; filename="${code}.pkpass"`,
        },
      });
    } catch (keyError) {
      return NextResponse.json(
        { error: `Key file error: ${String(keyError)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Pass generation error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
