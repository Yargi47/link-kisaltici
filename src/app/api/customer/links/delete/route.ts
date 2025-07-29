import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/database';

export async function DELETE(request: NextRequest) {
  try {
    const { linkIds, customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Müşteri ID gerekli' },
        { status: 401 }
      );
    }

    if (!linkIds || !Array.isArray(linkIds) || linkIds.length === 0) {
      return NextResponse.json(
        { error: 'Geçerli link ID\'leri gerekli' },
        { status: 400 }
      );
    }

    const db = await readDatabase();
    let deletedCount = 0;

    // Belirtilen linkleri sil (sadece müşteriye ait olanları)
    for (const linkId of linkIds) {
      // Link ID'sine göre shortCode'u bul
      const linkEntry = Object.entries(db.links).find(([_, link]) => 
        link.id === linkId && link.customerId === customerId
      );

      if (linkEntry) {
        const [shortCode] = linkEntry;
        
        // Link ve istatistiklerini sil
        delete db.links[shortCode];
        delete db.stats[shortCode];
        deletedCount++;
      }
    }

    if (deletedCount === 0) {
      return NextResponse.json(
        { error: 'Silinecek link bulunamadı' },
        { status: 404 }
      );
    }

    await writeDatabase(db);

    return NextResponse.json({
      success: true,
      message: `${deletedCount} link başarıyla silindi`,
      deletedCount
    });

  } catch (error) {
    console.error('Link silme hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
