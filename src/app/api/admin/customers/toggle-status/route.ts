import { NextRequest, NextResponse } from 'next/server';
import { updateCustomer } from '@/lib/customers';

export async function POST(request: NextRequest) {
  try {
    const { customerId, status } = await request.json();

    if (!customerId || !status) {
      return NextResponse.json(
        { error: 'Müşteri ID ve durum gerekli' },
        { status: 400 }
      );
    }

    const updatedCustomer = await updateCustomer(customerId, { status });

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      );
    }

    console.log(`Müşteri ${customerId} durumu ${status} olarak güncellendi`);

    return NextResponse.json({
      success: true,
      message: `Müşteri durumu ${status} olarak güncellendi`
    });

  } catch (error) {
    console.error('Customer status toggle error:', error);
    return NextResponse.json(
      { error: 'Durum güncellenemedi' },
      { status: 500 }
    );
  }
}
