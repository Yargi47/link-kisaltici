'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Copy, ExternalLink, Calendar, Clock, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface LinkData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  customCode?: boolean;
}

interface ClickData {
  timestamp: string;
  ip: string;
  userAgent: string;
  referer?: string;
}

interface StatsData {
  linkData: LinkData;
  stats: {
    totalClicks: number;
    uniqueClicks: number;
    dailyClicks: Array<{ date: string; clicks: number }>;
    hourlyClicks: Array<{ hour: number; clicks: number }>;
    referrers: Record<string, number>;
    recentClicks: ClickData[];
  };
}

export default function StatsPage() {
  const params = useParams();
  const shortCode = params.shortCode as string;
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/stats?code=${shortCode}`);
        if (!response.ok) {
          throw new Error('İstatistikler yüklenemedi');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (shortCode) {
      fetchStats();
    }
  }, [shortCode]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            İstatistik Bulunamadı
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Bu link için istatistik verisi bulunamadı.'}
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  const shortUrl = `${window.location.origin}/${shortCode}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            📊 Link İstatistikleri
          </h1>
        </div>

        {/* Link Bilgileri */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Link Bilgileri</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Kısa Link
              </label>
              <div className="flex items-center gap-2 p-3 bg-blue-50 border rounded-lg">
                <input
                  type="text"
                  value={shortUrl}
                  readOnly
                  className="flex-1 text-blue-600 font-medium bg-transparent outline-none"
                />
                <button
                  onClick={() => copyToClipboard(shortUrl)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Orijinal Link
              </label>
              <div className="p-3 bg-gray-50 border rounded-lg">
                <p className="text-gray-800 break-all">{data.linkData.originalUrl}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Oluşturulma Tarihi
                </label>
                <p className="text-gray-800">
                  {new Date(data.linkData.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Kod Türü
                </label>
                <p className="text-gray-800">
                  {data.linkData.customCode ? 'Özel Kod' : 'Otomatik'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              {data.stats.totalClicks}
            </h3>
            <p className="text-gray-600">Toplam Tıklama</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              {data.stats.uniqueClicks}
            </h3>
            <p className="text-gray-600">Benzersiz Ziyaretçi</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              {data.stats.dailyClicks[data.stats.dailyClicks.length - 1]?.clicks || 0}
            </h3>
            <p className="text-gray-600">Bugünkü Tıklama</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-gray-900">
              {data.stats.recentClicks.length > 0 ? 
                Math.max(...data.stats.hourlyClicks.map(h => h.clicks)) : 0}
            </h3>
            <p className="text-gray-600">Pik Saat Tıklama</p>
          </div>
        </div>

        {/* Günlük İstatistikler */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Son 7 Gün Tıklama Grafiği
          </h3>
          <div className="space-y-2">
            {data.stats.dailyClicks.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('tr-TR', { 
                    weekday: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{
                      width: `${Math.max(5, (day.clicks / Math.max(...data.stats.dailyClicks.map(d => d.clicks))) * 100)}%`
                    }}
                  ></div>
                </div>
                <div className="w-12 text-sm font-medium text-gray-800">
                  {day.clicks}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referrer Analizi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Trafik Kaynakları
            </h3>
            <div className="space-y-3">
              {Object.entries(data.stats.referrers)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([referrer, count]) => (
                <div key={referrer} className="flex items-center justify-between">
                  <span className="text-gray-700 truncate flex-1">
                    {referrer === 'Doğrudan' ? '🔗 Doğrudan' : `🌐 ${referrer}`}
                  </span>
                  <span className="font-medium text-gray-900 ml-2">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Son Tıklamalar */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Son Tıklamalar
            </h3>
            <div className="space-y-3">
              {data.stats.recentClicks.slice(0, 5).map((click, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {new Date(click.timestamp).toLocaleString('tr-TR')}
                  </span>
                  <span className="text-gray-500 truncate ml-2">
                    {click.referer ? '🔗' : '📱'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
