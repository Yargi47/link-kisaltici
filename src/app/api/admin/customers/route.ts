import { NextRequest, NextResponse } from 'next/server';
import { getAllCustomers } from '@/lib/customers';

  export async function GET() {
  try {
    // TODO: Admin authentication kontrolü
    // const isAdmin = await checkAdminAuth(request);
    // if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const customers = await getAllCustomers();
    
    // Şifreleri response'dan çıkar
    const customersWithoutPasswords = customers.map(({ password, ...customerData }) => customerData);

    return NextResponse.json(customersWithoutPasswords);
  } catch (error) {
    console.error('Admin customers fetch error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
