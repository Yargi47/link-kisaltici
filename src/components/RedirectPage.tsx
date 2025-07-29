'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function RedirectPage() {
  const params = useParams();
  const shortCode = params.shortCode as string;
  const [countdown, setCountdown] = useState(5);
  const [linkData, setLinkData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        // Link bilgilerini al
        const response = await fetch(`/api/redirect?code=${shortCode}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Link bulunamadı');
          return;
        }

        setLinkData(data);

        // Geri sayım
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              window.location.href = data.originalUrl;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (err) {
        setError('Bir hata oluştu');
      }
    };

    if (shortCode) {
      fetchAndRedirect();
    }
  }, [shortCode]);

  const redirectNow = () => {
    if (linkData) {
      window.location.href = linkData.originalUrl;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Link Bulunamadı
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Ana Yönlendirme Kartı */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Yönlendiriliyor...
          </h1>
          
          {linkData && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Şu adrese yönlendiriliyorsunuz:
              </p>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium break-all">
                  {linkData.originalUrl}
                </p>
              </div>
            </div>
          )}

          {/* Geri Sayım */}
          <div className="my-8">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {countdown}
            </div>
            <p className="text-gray-600">saniye sonra otomatik yönlendirme</p>
          </div>

          {/* Butonlar */}
          <div className="space-y-3">
            <button
              onClick={redirectNow}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Hemen Git →
            </button>
            
            <a
              href="/"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Ana Sayfaya Dön
            </a>
          </div>
        </div>

        {/* Site Tanıtım */}
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            ⭐ Bizim Link Kısaltıcıyı Kullanın
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Ücretsiz, hızlı ve güvenilir link kısaltma hizmeti. QR kod ve detaylı istatistikler.
          </p>
          <a
            href="/"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Kendi Linkinizi Kısaltın
          </a>
        </div>
      </div>
    </div>
  );
}
