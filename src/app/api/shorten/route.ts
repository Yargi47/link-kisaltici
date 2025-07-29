import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase, generateShortCode, isValidUrl, isValidShortCode } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { originalUrl, customCode, customerId } = await request.json();

    // Müşteri ID kontrolü
    if (!customerId) {
      return NextResponse.json(
        { error: 'Müşteri bilgisi gerekli' },
        { status: 401 }
      );
    }

    // URL validasyonu
    if (!originalUrl || !isValidUrl(originalUrl)) {
      return NextResponse.json(
        { error: 'Geçerli bir URL giriniz' },
        { status: 400 }
      );
    }

    // Özel kod validasyonu
    if (customCode && !isValidShortCode(customCode)) {
      return NextResponse.json(
        { error: 'Özel kod 3-20 karakter olmalı ve sadece harf-rakam içermeli' },
        { status: 400 }
      );
    }

    const db = await readDatabase();

    // Özel kod kontrolü
    let shortCode = customCode;
    if (customCode) {
      if (db.links[customCode]) {
        return NextResponse.json(
          { error: 'Bu özel kod zaten kullanılıyor' },
          { status: 409 }
        );
      }
    } else {
      // Otomatik kod üretimi
      do {
        shortCode = generateShortCode();
      } while (db.links[shortCode]);
    }

    // Yeni link kaydı (customerId eklendi)
    const linkData = {
      id: `link_${Date.now()}`,
      originalUrl,
      shortCode,
      customerId, // Hangi müşteri oluşturdu
      createdAt: new Date().toISOString(),
      customCode: !!customCode,
      affiliateCode: customerId, // Affiliate tracking için müşteri ID'sini kullan
      affiliateCommission: 10 // Varsayılan %10 komisyon
    };

    db.links[shortCode] = linkData;
    db.stats[shortCode] = [];

    await writeDatabase(db);

    const shortUrl = `${request.nextUrl.origin}/${shortCode}`;

    return NextResponse.json({
      success: true,
      shortUrl,
      shortCode,
      originalUrl
    });

  } catch (error) {
    console.error('Kısaltma hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
