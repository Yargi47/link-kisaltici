import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { customerId, linkIds, mode, newUrl, findText, replaceText } = await request.json();

    if (!customerId || !linkIds || linkIds.length === 0 || !mode) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
    }

    if (mode === 'replace' && !newUrl) {
      return NextResponse.json({ error: 'Yeni URL gerekli' }, { status: 400 });
    }

    if (mode === 'find-replace' && (!findText || !replaceText)) {
      return NextResponse.json({ error: 'Bul ve değiştir metinleri gerekli' }, { status: 400 });
    }

    const data = await readDatabase();
    let updatedCount = 0;

    // Update selected links
    const updatedLinks = { ...data.links };
    
    Object.keys(updatedLinks).forEach(shortCode => {
      const link = updatedLinks[shortCode];
      if (linkIds.includes(link.id) && link.customerId === customerId) {
        let newUrlToSet = '';
        
        if (mode === 'replace') {
          newUrlToSet = newUrl;
        } else if (mode === 'find-replace') {
          newUrlToSet = link.originalUrl.replace(new RegExp(findText, 'g'), replaceText);
        }

        if (newUrlToSet && newUrlToSet !== link.originalUrl) {
          updatedCount++;
          updatedLinks[shortCode] = {
            ...link,
            originalUrl: newUrlToSet
          };
        }
      }
    });

    if (updatedCount === 0) {
      return NextResponse.json({ error: 'Hiçbir link güncellenmedi' }, { status: 400 });
    }

    await writeDatabase({ ...data, links: updatedLinks });

    return NextResponse.json({ 
      success: true, 
      updatedCount,
      message: `${updatedCount} link başarıyla güncellendi` 
    });

  } catch (error) {
    console.error('Bulk edit error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
