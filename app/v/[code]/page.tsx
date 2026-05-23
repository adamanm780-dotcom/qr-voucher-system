'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface VoucherData {
  id: string;
  code: string;
  status: string;
  batch: {
    voucherType: string;
    description?: string;
  };
  cafe: {
    name: string;
    logoUrl?: string;
    primaryColor?: string;
  };
}

export default function VoucherPage() {
  const params = useParams();
  const code = params.code as string;
  const [voucher, setVoucher] = useState<VoucherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const res = await fetch(`/api/vouchers/${code}`);
        if (!res.ok) throw new Error('Voucher not found');
        const data = await res.json();
        setVoucher(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchVoucher();
  }, [code]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error || !voucher)
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Voucher not found</h1>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{ backgroundColor: voucher.cafe.primaryColor || '#8B4C9B' }}
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
          {voucher.batch.description && <p className="text-sm text-gray-600 mt-2">{voucher.batch.description}</p>}
        </div>

        {voucher.status === 'UNUSED' && (
          <div>
            <button
              onClick={() => fetch(`/api/passes/apple/${code}`).then((r) => r.blob()).then((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'gutschein.pkpass';
                a.click();
              })}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white mb-3"
              style={{ backgroundColor: voucher.cafe.primaryColor }}
            >
              Zur Apple Wallet hinzufügen
            </button>
            <p className="text-xs text-gray-500">Zeige diesen Gutschein im Café vor!</p>
          </div>
        )}

        {voucher.status === 'ACTIVATED' && (
          <div className="p-4 bg-green-100 text-green-700 rounded-lg">
            <p className="font-semibold">✅ Bereits zur Wallet hinzugefügt</p>
          </div>
        )}

        {voucher.status === 'REDEEMED' && (
          <div className="p-4 bg-gray-100 text-gray-700 rounded-lg">
            <p className="font-semibold">✓ Dieser Gutschein wurde bereits eingelöst</p>
          </div>
        )}
      </div>
    </div>
  );
}
