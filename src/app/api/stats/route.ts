import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/database';

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
    const statsData = db.stats[shortCode] || [];

    if (!linkData) {
      return NextResponse.json(
        { error: 'Link bulunamadı' },
        { status: 404 }
      );
    }

    // İstatistik analizi
    const totalClicks = statsData.length;
    const uniqueClicks = new Set(statsData.map(stat => stat.ip)).size;
    
    // Günlük tıklama istatistikleri (son 7 gün)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const dailyClicks = last7Days.map(date => {
      const clicks = statsData.filter(stat => 
        stat.timestamp.split('T')[0] === date
      ).length;
      return { date, clicks };
    });

    // Referrer analizi
    const referrers = statsData.reduce((acc, stat) => {
      const ref = stat.referer || 'Doğrudan';
      acc[ref] = (acc[ref] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Saatlik analiz (bugün)
    const today = new Date().toISOString().split('T')[0];
    const todayClicks = statsData.filter(stat => 
      stat.timestamp.split('T')[0] === today
    );

    const hourlyClicks = Array.from({ length: 24 }, (_, hour) => {
      const clicks = todayClicks.filter(stat => {
        const statHour = new Date(stat.timestamp).getHours();
        return statHour === hour;
      }).length;
      return { hour, clicks };
    });

    return NextResponse.json({
      linkData,
      stats: {
        totalClicks,
        uniqueClicks,
        dailyClicks,
        hourlyClicks,
        referrers,
        recentClicks: statsData.slice(-10).reverse() // Son 10 tıklama
      }
    });

  } catch (error) {
    console.error('İstatistik hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
