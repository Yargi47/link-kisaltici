import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Demo admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@sistem.com',
  password: 'admin123',
  name: 'Sistem Admin',
  role: 'admin'
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Admin credentials kontrolü
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Admin session oluştur
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = NextResponse.json({
        success: true,
        message: 'Admin girişi başarılı',
        token,
        user: {
          email: ADMIN_CREDENTIALS.email,
          name: ADMIN_CREDENTIALS.name,
          role: ADMIN_CREDENTIALS.role
        }
      });

      // Cookie'ye de token ekle (güvenlik için)
      response.cookies.set('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 saat
      });

      return response;
    } else {
      return NextResponse.json(
        { error: 'Geçersiz admin bilgileri' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin login hatası:', error);
    return NextResponse.json(
      { error: 'Sistem hatası' },
      { status: 500 }
    );
  }
}
