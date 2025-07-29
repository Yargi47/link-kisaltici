import { NextRequest, NextResponse } from 'next/server';
import { getCustomerByEmail, updateCustomer } from '@/lib/customers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Basit validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Müşteriyi email'e göre bul
    const customer = await getCustomerByEmail(email);

    if (!customer) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi ile kayıtlı müşteri bulunamadı' },
        { status: 401 }
      );
    }

    // Şifre kontrolü
    if (customer.password !== password) {
      return NextResponse.json(
        { error: 'Şifre hatalı' },
        { status: 401 }
      );
    }

    // Durum kontrolü
    if (customer.status !== 'active') {
      const statusMessage = customer.status === 'suspended' ? 'askıya alınmış' : 'pasif';
      return NextResponse.json(
        { error: `Hesabınız ${statusMessage} durumda. Lütfen yönetici ile iletişime geçin.` },
        { status: 403 }
      );
    }

    // Son giriş zamanını güncelle
    await updateCustomer(customer.id, { lastLogin: new Date().toISOString() });

    // Token oluştur
    const token = `customer_${customer.id}_${Date.now()}`;

    return NextResponse.json({
      success: true,
      token,
      userType: 'customer',
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        plan: customer.plan
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
