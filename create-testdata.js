const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'prisma', 'dev.db'), (err) => {
  if (err) {
    console.error('DB Error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite DB');
});

const cafeId = crypto.randomUUID();
const batchId = crypto.randomUUID();
const voucherId = crypto.randomUUID();
const code = crypto.randomBytes(16).toString('hex');

db.serialize(() => {
  // Insert Cafe
  db.run(
    `INSERT OR IGNORE INTO Cafe (id, name, email, logoUrl, primaryColor, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [cafeId, 'Lila Wiesbaden', 'info@lila-wiesbaden.de', 'https://via.placeholder.com/200', '#8B4C9B'],
    function (err) {
      if (err) console.error('Cafe insert error:', err);
      else console.log('✅ Cafe created:', cafeId);
    }
  );

  // Insert Batch
  db.run(
    `INSERT OR IGNORE INTO Batch (id, cafeId, name, voucherType, description, quantity, validUntil, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+30 days'), datetime('now'), datetime('now'))`,
    [batchId, cafeId, 'Test Batch', 'Gratis Asahi Bowl', 'Kostenlos eine Asahi Bowl genießen!', 10],
    function (err) {
      if (err) console.error('Batch insert error:', err);
      else console.log('✅ Batch created:', batchId);
    }
  );

  // Insert Voucher
  db.run(
    `INSERT OR IGNORE INTO Voucher (id, code, cafeId, batchId, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    [voucherId, code, cafeId, batchId, 'UNUSED'],
    function (err) {
      if (err) console.error('Voucher insert error:', err);
      else {
        console.log('✅ Voucher created!');
        console.log('📝 Voucher Code:', code);
        console.log('🔗 Test URL: http://localhost:3000/v/' + code);
        console.log('🔗 QR Scan URL: http://localhost:3000/api/qr/' + code);
        db.close();
      }
    }
  );
});
