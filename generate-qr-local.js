const QRCode = require('qrcode');
const path = require('path');

const code = 'e70aabce7e379c1a3fbfa6617a22b683';
const localIP = '192.168.178.51';
const url = `http://${localIP}:3000/v/${code}`;

QRCode.toFile(
  path.join(__dirname, 'public', 'qr-code.png'),
  url,
  {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 0.95,
    margin: 1,
    width: 300,
  },
  function (err) {
    if (err) {
      console.error('QR Code Error:', err);
      process.exit(1);
    }
    console.log('✅ QR Code generated with LOCAL IP!');
    console.log('📁 Saved to: public/qr-code.png');
    console.log('🔗 URL: ' + url);
    console.log('\n🎯 Test jetzt auf deinem iPhone:');
    console.log('Öffne Safari: ' + url);
  }
);
