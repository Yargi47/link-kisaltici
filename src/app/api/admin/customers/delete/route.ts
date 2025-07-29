import { NextRequest, NextResponse } from 'next/server';
import { deleteCustomer } from '@/lib/customers';

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: 'Müşteri ID gerekli' },
        { status: 400 }
      );
    }

    const deleted = await deleteCustomer(customerId);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Müşteri bulunamadı' },
        { status: 404 }
      );
    }

    console.log('Müşteri silindi:', customerId);

    return NextResponse.json({
      success: true,
      message: 'Müşteri başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Müşteri silinemedi' },
      { status: 500 }
    );
  }
}
