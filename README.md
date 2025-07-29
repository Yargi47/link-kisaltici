# 🔗 Link Kısaltıcı - SaaS Platform

Modern, ölçeklenebilir ve gelir odaklı link kısaltıcı SaaS platformu. Admin paneli ve müşteri dashboard'ı ile tam ticari çözüm.

## ✨ Özellikler

### 🚀 **Temel Özellikler**
- Hızlı URL kısaltma (saniyeler içinde)
- Özel kodlar (örn: yon.io/mersoicseo)
- Detaylı istatistikler (tıklama, kaynak, coğrafi)
- QR kod oluşturma ve indirme
- Modern responsive tasarım
- Türkçe arayüz

### � **SaaS Özellikleri**
- 🛡️ **Admin Paneli** - Tam yönetim kontrolü
- 📊 **Müşteri Dashboard'ı** - Self-service panel
- 💰 **Gelir Takibi** - Aylık/yıllık gelir analizi
- 👥 **Müşteri Yönetimi** - Hesap açma/kapatma
- 📈 **Plan Yönetimi** - Free/Pro/Enterprise
- 🎯 **Reklam Sistemi** - Strategik gelir alanları

### �️ **Admin Panel Özellikleri**
- Müşteri listesi ve yönetimi
- Gelir dashboard'ı ve analytics
- Plan limitlerini düzenleme
- Müşteri durumu (aktif/pasif/askıda)
- Sistem ayarları
- Toplam istatistikler

### 👤 **Müşteri Panel Özellikleri**
- Kişisel link yönetimi
- Kota takibi (plan limitleri)
- Detaylı link istatistikleri
- QR kod oluşturma
- Plan bilgileri

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **QR Code**: qrcode paketi
- **Database**: JSON dosyası (geliştirilmek üzere)
- **Deployment**: Vercel/Netlify ready

## 🚀 Hızlı Başlangıç

### Demo Hesapları
- 🛡️ **Admin Panel**: [http://localhost:3001/admin](http://localhost:3001/admin)
- 📊 **Müşteri Panel**: [http://localhost:3001/dashboard](http://localhost:3001/dashboard)
- 🔗 **Ana Sayfa**: [http://localhost:3001](http://localhost:3001)

### Kurulum
```bash
# Repository klonla
git clone [repo-url]
cd linkkisaltici

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

## 💰 Gelir Modeli

### 📊 **Abonelik Planları**
- **Free Plan**: 10 link/ay - ₺0
- **Pro Plan**: 1,000 link/ay - ₺299
- **Enterprise Plan**: 10,000 link/ay - ₺999

### 💸 **Gelir Kaynakları**
1. **Aylık Abonelikler** - Ana gelir kaynağı
2. **Reklam Gelirleri** - Banner ve display reklamlar
3. **Premium Özellikler** - Özel domain, API erişimi
4. **White-label Çözümler** - Kurumsal müşteriler

## 📂 Proje Yapısı

```
src/
├── app/
│   ├── admin/               # 🛡️ Admin panel
│   ├── dashboard/           # 👤 Müşteri dashboard
│   ├── [shortCode]/         # 🔗 Yönlendirme sayfası
│   ├── stats/[shortCode]/   # 📊 İstatistik sayfası
│   └── api/
│       ├── admin/           # Admin API'leri
│       ├── customer/        # Müşteri API'leri
│       ├── shorten/         # URL kısaltma
│       ├── stats/           # İstatistikler
│       └── redirect/        # Yönlendirme
├── components/
│   ├── URLShortener.tsx     # Ana kısaltma formu
│   ├── QRCodeComponent.tsx  # QR kod bileşeni
│   └── RedirectPage.tsx     # Yönlendirme sayfası
└── lib/
    └── database.ts          # Veri yönetimi
data/
└── database.json            # JSON veri dosyası
```

## 🎛️ Panel Kullanımı

### Admin Panel (`/admin`)
- **Dashboard**: Toplam müşteri, gelir, link istatistikleri
- **Müşteriler**: Müşteri listesi, durum değiştirme, yönetim
- **Gelir**: Aylık gelir analizi, plan bazında breakdown
- **Ayarlar**: Platform ayarları, plan limitleri

### Müşteri Panel (`/dashboard`)
- **Link Yönetimi**: Yeni link oluşturma, mevcut linkler
- **İstatistikler**: Tıklama sayıları, kota takibi
- **Plan Bilgisi**: Mevcut plan, limit durumu
- **QR Kodlar**: Link bazında QR kod oluşturma

## 🔧 Geliştirme

### API Endpoints

- `POST /api/shorten` - Link kısaltma
- `GET /api/stats?code=xyz` - İstatistik verileri

### Veri Yapısı

```typescript
interface LinkData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  customCode?: boolean;
}

interface ClickData {
  timestamp: string;
  ip: string;
  userAgent: string;
  referer?: string;
}
```

## 🚀 Production Deployment

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=.next
```

## 📈 Gelecek Özellikler

- [ ] Veritabanı entegrasyonu (MongoDB/PostgreSQL)
- [ ] Kullanıcı hesapları ve dashboard
- [ ] Bulk link kısaltma
- [ ] Link expiration
- [ ] Custom domains
- [ ] Advanced analytics (coğrafi veriler)
- [ ] API rate limiting
- [ ] Spam protection
- [ ] Mobile app

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- Website: [yon.io](https://yon.io)
- Email: contact@yon.io
- Twitter: [@yonio](https://twitter.com/yonio)

---

**Made with ❤️ in Turkey** 🇹🇷
