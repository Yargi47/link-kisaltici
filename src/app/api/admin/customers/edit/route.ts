import { NextRequest, NextResponse } from 'next/server';
import { updateCustomer } from '@/lib/customers';

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json();

    if (!customerData.id) {
      return NextResponse.json(
        { error: 'Müşteri ID gerekli' },
        { status: 400 }
      );
    }

    // Şifre güncellemesi - boşsa güncelleme
    const updates: any = { ...customerData };
    if (!updates.password || updates.password.trim() === '') {
      delete updates.password;
    }

    const updatedCustomer = await updateCustomer(customerData.id, updates);

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      );
    }

    console.log('Müşteri güncellendi:', updatedCustomer.id);

    // Response'da şifre gönderme
    const { password, ...responseData } = updatedCustomer;
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Edit customer error:', error);
    return NextResponse.json(
      { error: 'Müşteri güncellenemedi' },
      { status: 500 }
    );
  }
}
