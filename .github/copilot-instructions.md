# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
Bu proje modern bir link kısaltıcı uygulamasıdır (benzer: Bit.ly, TinyURL).

## Tech Stack
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- JSON dosyası ile veri saklama

## Özellikler
- URL kısaltma (özel kodlar: domain.com/özelkod)
- İstatistik takibi (tıklama sayısı, coğrafi konum, referrer)
- QR kod oluşturma
- Modern ve responsive tasarım
- Reklam alanları
- Türkçe arayüz

## Dosya Yapısı
- `/src/app/page.tsx` - Ana sayfa (URL kısaltma formu)
- `/src/app/[shortCode]/page.tsx` - Yönlendirme sayfası
- `/src/app/stats/page.tsx` - İstatistik paneli
- `/src/components/` - Reusable React bileşenleri
- `/src/lib/` - Utility fonksiyonları ve veri yönetimi
- `/data/` - JSON veri dosyaları

## Geliştirme Kuralları
- Türkçe değişken/fonksiyon isimleri kullanabilirsin
- Modern React hooks kullan
- Responsive tasarım için Tailwind CSS kullan
- SEO optimizasyonu için Next.js özelliklerini kullan
- Para kazanma için reklam alanları bırak
