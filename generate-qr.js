const QRCode = require('qrcode');
const path = require('path');

const code = 'e70aabce7e379c1a3fbfa6617a22b683';
const url = `http://localhost:3000/v/${code}`;

QRCode.toFile(
  path.join(__dirname, 'qr-code.png'),
  url,
  {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 0.95,
    margin: 1,
    width: 300,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  },
  function (err) {
    if (err) {
      console.error('QR Code Error:', err);
      process.exit(1);
    }
    console.log('✅ QR Code generated!');
    console.log('📁 Saved to: qr-code.png');
    console.log('🔗 URL encoded in QR: ' + url);
  }
);
