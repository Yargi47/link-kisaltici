import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shortCode = searchParams.get('code');

    if (!shortCode) {
      return NextResponse.json(
        { error: 'Kısa kod gerekli' },
        { status: 400 }
      );
    }

    const db = await readDatabase();
    const linkData = db.links[shortCode];

    if (!linkData) {
      return NextResponse.json(
        { error: 'Link bulunamadı' },
        { status: 404 }
      );
    }

    // Tıklama kaydı
    if (!db.stats[shortCode]) {
      db.stats[shortCode] = [];
    }

    const clickData = {
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      userAgent: request.headers.get('user-agent') || '',
      referer: request.headers.get('referer') || undefined
    };

    db.stats[shortCode].push(clickData);
    await writeDatabase(db);

    return NextResponse.json({
      originalUrl: linkData.originalUrl,
      shortCode: linkData.shortCode,
      createdAt: linkData.createdAt
    });

  } catch (error) {
    console.error('Redirect API hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
