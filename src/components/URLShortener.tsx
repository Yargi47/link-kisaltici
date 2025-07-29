'use client';

import { useState } from 'react';
import { Copy, Link, QrCode, TrendingUp } from 'lucide-react';
import QRCodeComponent from './QRCodeComponent';

export default function URLShortener() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl,
          customCode: customCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setShortUrl(data.shortUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      // Toast bildirimi eklenebilir
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
    }
  };

  const resetForm = () => {
    setOriginalUrl('');
    setCustomCode('');
    setShortUrl('');
    setError('');
    setShowQR(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔗 Link Kısaltıcı
          </h1>
          <p className="text-lg text-gray-600">
            Uzun linklerinizi kısaltın, takip edin ve paylaşın
          </p>
          
          {/* Panel Linkleri */}
          <div className="flex justify-center gap-4 mt-6">
            <a
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              � Giriş Yap
            </a>
          </div>
        </div>

        {/* Ana Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Input */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Kısaltmak istediğiniz URL
              </label>
              <input
                type="url"
                id="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/uzun-bir-link"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* Özel Kod Input */}
            <div>
              <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-2">
                Özel kod (isteğe bağlı)
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 bg-gray-50 px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg">
                  yon.io/
                </span>
                <input
                  type="text"
                  id="customCode"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="özelkod"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  pattern="[a-zA-Z0-9]{3,20}"
                  title="3-20 karakter, sadece harf ve rakam"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                3-20 karakter, sadece harf ve rakam kullanabilirsiniz
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Kısaltılıyor...
                </>
              ) : (
                <>
                  <Link className="h-5 w-5" />
                  Linki Kısalt
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {shortUrl && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-medium text-green-800 mb-4">
                ✅ Linkiniz başarıyla kısaltıldı!
              </h3>
              
              <div className="space-y-4">
                {/* Kısaltılmış URL */}
                <div className="flex items-center gap-2 p-3 bg-white border rounded-lg">
                  <input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="flex-1 text-blue-600 font-medium bg-transparent outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Kopyala"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                    QR Kod
                  </button>
                  
                  <button
                    onClick={() => window.open(`/stats/${shortUrl.split('/').pop()}`, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <TrendingUp className="h-4 w-4" />
                    İstatistikler
                  </button>
                  
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Yeni Link
                  </button>
                </div>

                {/* QR Code */}
                {showQR && (
                  <div className="mt-4 p-4 bg-white border rounded-lg">
                    <QRCodeComponent url={shortUrl} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Özellikler */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <Link className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Hızlı Kısaltma</h3>
            <p className="text-gray-600 text-sm">Linklerinizi saniyeler içinde kısaltın</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Detaylı İstatistik</h3>
            <p className="text-gray-600 text-sm">Tıklama sayısı ve kaynak takibi</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <QrCode className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">QR Kod</h3>
            <p className="text-gray-600 text-sm">Otomatik QR kod oluşturma</p>
          </div>
        </div>
      </div>
    </div>
  );
}
