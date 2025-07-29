import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { customerId, linkId, newUrl } = await request.json();

    if (!customerId || !linkId || !newUrl) {
      return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
    }

    const data = await readDatabase();
    
    // Find the link to update
    let linkFound = false;
    const updatedLinks = { ...data.links };
    
    Object.keys(updatedLinks).forEach(shortCode => {
      const link = updatedLinks[shortCode];
      if (link.id === linkId && link.customerId === customerId) {
        updatedLinks[shortCode] = {
          ...link,
          originalUrl: newUrl
        };
        linkFound = true;
      }
    });

    if (!linkFound) {
      return NextResponse.json({ error: 'Link bulunamadı' }, { status: 404 });
    }

    await writeDatabase({ ...data, links: updatedLinks });

    return NextResponse.json({ 
      success: true, 
      message: 'Link başarıyla güncellendi' 
    });

  } catch (error) {
    console.error('Single edit error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
