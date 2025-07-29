import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // URL'den customerId parametresini al
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Müşteri ID gerekli' },
        { status: 401 }
      );
    }

    const db = await readDatabase();
    
    // Sadece bu müşterinin linklerini filtrele
    const customerLinks = Object.entries(db.links)
      .filter(([, linkData]) => linkData.customerId === customerId)

      .map(([shortCode, linkData]) => {
        const clicks = db.stats[shortCode]?.length || 0;
        return {
          id: linkData.id,
          originalUrl: linkData.originalUrl,
          shortUrl: `${request.nextUrl.origin}/${shortCode}`,
          clicks,
          createdAt: linkData.createdAt,
          customCode: linkData.customCode
        };
      });

    return NextResponse.json(customerLinks);
  } catch (error) {
    console.error('Customer links fetch error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
