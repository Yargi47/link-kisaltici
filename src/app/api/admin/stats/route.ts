import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/database';
import { getAllCustomers } from '@/lib/customers';

export async function GET(request: NextRequest) {
  try {
    // TODO: Admin authentication kontrolü
    // const isAdmin = await checkAdminAuth(request);
    // if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await readDatabase();
    const customers = await getAllCustomers();
    
    // Gerçek verilerden hesaplama yap
    const totalLinks = Object.keys(db.links).length;
    const totalClicks = Object.values(db.stats).reduce((sum, clicks) => sum + clicks.length, 0);
    
    // Gerçek müşteri verilerinden hesaplama
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const monthlyRevenue = customers.reduce((sum, c) => sum + c.monthlyFee, 0);

    // Her müşterinin link sayısını ve tıklama sayısını hesapla
    customers.forEach(customer => {
      // Bu müşteriye ait linkleri say
      const customerLinks = Object.values(db.links).filter(link => link.customerId === customer.id);
      customer.linksCount = customerLinks.length;
      
      // Bu müşteriye ait toplam tıklamaları say
      customer.totalClicks = customerLinks.reduce((sum, link) => {
        const linkStats = db.stats[link.shortCode] || [];
        return sum + linkStats.length;
      }, 0);
    });

    const adminStats = {
      totalCustomers,
      totalLinks,
      totalClicks,
      monthlyRevenue,
      activeCustomers
    };

    return NextResponse.json(adminStats);
  } catch (error) {
    console.error('Admin stats fetch error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
