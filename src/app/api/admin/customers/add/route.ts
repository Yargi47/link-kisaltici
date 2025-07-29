import { NextRequest, NextResponse } from 'next/server';
import { addCustomer, getCustomerByEmail } from '@/lib/customers';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, plan, monthlyFee } = await request.json();

    if (!name || !email || !password || !plan) {
      return NextResponse.json(
        { error: 'Tüm alanları doldurun (şifre dahil)' },
        { status: 400 }
      );
    }

    // E-posta çakışması kontrolü
    const existingCustomer = await getCustomerByEmail(email);
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Yeni müşteri oluştur
    const newCustomer = await addCustomer({
      name,
      email,
      password,
      plan,
      monthlyFee,
      status: 'active'
    });

    console.log('Yeni müşteri eklendi:', { ...newCustomer, password: '***hidden***' });

    // Response'da şifre gönderme
    const { password: _, ...responseData } = newCustomer;
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Add customer error:', error);
    return NextResponse.json(
      { error: 'Müşteri eklenemedi' },
      { status: 500 }
    );
  }
}
