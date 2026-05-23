export default function TestVoucher() {
  const voucher = {
    id: "009675b8-a55e-4da1-b7a8-0c49db5cd25d",
    code: "e70aabce7e379c1a3fbfa6617a22b683",
    status: "UNUSED",
    batch: {
      voucherType: "Gratis Asahi Bowl",
      description: "Kostenlos eine Asahi Bowl genießen!",
    },
    cafe: {
      name: "Lila Wiesbaden",
      logoUrl: "https://via.placeholder.com/200",
      primaryColor: "#8B4C9B",
    },
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{ backgroundColor: voucher.cafe.primaryColor || "#8B4C9B" }}
    >
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {voucher.cafe.logoUrl && (
          <img src={voucher.cafe.logoUrl} alt={voucher.cafe.name} className="h-16 mx-auto mb-4" />
        )}
        <h1 className="text-3xl font-bold mb-2">🎉 Glückwunsch!</h1>
        <p className="text-gray-600 mb-6">Du hast einen Gutschein gewonnen!</p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
          <p className="text-gray-600 text-sm mb-2">Gutschein von</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{voucher.cafe.name}</h2>
          <p className="text-xl font-semibold" style={{ color: voucher.cafe.primaryColor }}>
            {voucher.batch.voucherType}
          </p>
          {voucher.batch.description && (
            <p className="text-sm text-gray-600 mt-2">{voucher.batch.description}</p>
          )}
        </div>

        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">QR-Code zum Scannen:</p>
          <img src="/qr-code.png" alt="QR Code" className="w-48 h-48 mx-auto" />
        </div>

        {voucher.status === "UNUSED" && (
          <div>
            <button
              className="w-full py-3 px-4 rounded-lg font-semibold text-white mb-3"
              style={{ backgroundColor: voucher.cafe.primaryColor }}
            >
              Zur Apple Wallet hinzufügen
            </button>
            <p className="text-xs text-gray-500">Zeige diesen Gutschein im Café vor!</p>
          </div>
        )}

        {voucher.status === "ACTIVATED" && (
          <div className="p-4 bg-green-100 text-green-700 rounded-lg">
            <p className="font-semibold">✅ Bereits zur Wallet hinzugefügt</p>
          </div>
        )}
      </div>
    </div>
  );
}
