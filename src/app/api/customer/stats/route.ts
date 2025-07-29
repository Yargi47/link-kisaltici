import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/database';
import { getCustomerByEmail, getAllCustomers } from '@/lib/customers';

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
    const customers = await getAllCustomers();
    
    // Bu müşterinin bilgilerini bul
    const customer = customers.find(c => c.id === customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      );
    }
    
    // Sadece bu müşterinin linklerini filtrele
    const customerLinks = Object.entries(db.links)
      .filter(([_, linkData]) => linkData.customerId === customerId);
    
    const totalLinks = customerLinks.length;
    const totalClicks = customerLinks.reduce((sum, [shortCode]) => {
      return sum + (db.stats[shortCode]?.length || 0);
    }, 0);
    
    // Plan limitlerini belirle
    const planLimits = {
      free: 50,
      pro: 1000,
      enterprise: 10000
    };
    
    const customerStats = {
      totalLinks,
      totalClicks,
      planLimit: planLimits[customer.plan],
      plan: customer.plan.charAt(0).toUpperCase() + customer.plan.slice(1) + ' Plan',
      monthlyFee: customer.monthlyFee
    };

    return NextResponse.json(customerStats);
  } catch (error) {
    console.error('Customer stats fetch error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
