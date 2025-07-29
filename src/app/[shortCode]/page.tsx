import { redirect } from 'next/navigation';
import { readLinkData, queueClick } from '@/lib/database';
import { headers } from 'next/headers';

// Affiliate parametrelerini URL'e ekleyen fonksiyon
function buildAffiliateUrl(originalUrl: string, linkId: string, affiliateCode?: string): string {
  try {
    const url = new URL(originalUrl);
    
    // Link ID'sini ekle (l_id)
    url.searchParams.set('l_id', linkId);
    
    // Eğer affiliate code varsa ekle (a_id)
    if (affiliateCode) {
      url.searchParams.set('a_id', affiliateCode);
    }
    
    return url.toString();
  } catch (error) {
    // URL parse edilemezse orijinal URL'i döndür
    console.error('URL parse hatası:', error);
    return originalUrl;
  }
}

interface RedirectPageProps {
  params: Promise<{ shortCode: string }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  const { shortCode } = await params;
  const headersList = await headers();

  // Optimize edilmiş link okuma
  const linkData = await readLinkData(shortCode);

  if (!linkData) {
    // 404 sayfası
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Link Bulunamadı
          </h1>
          <p className="text-gray-600 mb-6">
            Aradığınız kısa link mevcut değil veya silinmiş olabilir.
          </p>
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

  // Click kaydını kuyruğa ekle (asenkron, yönlendirmeyi bloklamaz)
  const clickData = {
    timestamp: new Date().toISOString(),
    ip: headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown',
    userAgent: headersList.get('user-agent') || '',
    referer: headersList.get('referer') || undefined
  };

  // Asenkron olarak kuyruğa ekle
  queueClick(shortCode, clickData).catch(error => {
    console.error('Click queue hatası:', error);
  });

  // Affiliate parametrelerini ekleyerek URL'i hazırla
  const redirectUrl = buildAffiliateUrl(linkData.originalUrl, linkData.id, linkData.affiliateCode);

  // Hemen yönlendir (click kaydını beklemez)
  redirect(redirectUrl);
}
