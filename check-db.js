const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'prisma', 'dev.db'), (err) => {
  if (err) {
    console.error('DB Error:', err);
    process.exit(1);
  }
});

db.all('SELECT id, code, status FROM Voucher', (err, rows) => {
  if (err) {
    console.error('Query error:', err);
  } else {
    console.log('Vouchers in DB:', rows);
  }
  db.close();
});
