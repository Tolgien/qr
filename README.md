# 🍽️ QR Menü Sistemi

Kafeler ve restoranlar için AI destekli, kapsamlı QR menü uygulaması.

## ✨ Özellikler

- 📱 **QR Kod Menü** - Müşteriler telefonlarıyla menüye erişir
- 🛒 **Online Sipariş** - Masadan doğrudan sipariş verme
- 🤖 **AI Zenginleştirme** - Otomatik ürün açıklamaları, besin değerleri, görsel önerileri
- 👥 **Çoklu Mekan** - Birden fazla kafe/restoran yönetimi
- ⭐ **Müşteri Yorumları** - Ürün değerlendirme sistemi
- 💳 **Üyelik Sistemi** - Free, Basic, Premium paketler
- 🎨 **Özelleştirilebilir Temalar** - Markanıza uygun tasarım
- 📊 **Yönetim Paneli** - Detaylı raporlar ve sipariş takibi

## 🚀 Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Veritabanını Kurun

**Yöntem A: Mevcut veritabanından yükleyin**
```bash
npm run db:import
```

**Yöntem B: Boş veritabanı oluşturun**
```bash
# Schema'yı yükleyin
psql $DATABASE_URL < lib/db-schema.sql

# Demo verilerini yükleyin (opsiyonel)
npm run seed
```

### 3. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

Uygulama http://localhost:5000 adresinde çalışacak.

## 📦 Veritabanı Yönetimi

### Veritabanını Dışa Aktar (Yedekle)
```bash
npm run db:export
```
Veritabanı `database/database-backup.sql` dosyasına kaydedilir.

### Veritabanını İçe Aktar (Geri Yükle)
```bash
npm run db:import
```
`database/database-backup.sql` dosyasından veritabanını yükler.

> ⚠️ **Güvenlik Notu:** `database/` klasörü `.gitignore`'da bulunur çünkü hassas veriler içerir (şifreler, emailler, kişisel bilgiler). Asla public klasörüne koymayın!

## 🛠️ Teknolojiler

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, PostgreSQL
- **AI:** Anthropic Claude Sonnet 4
- **Ödeme:** Iyzico
- **Email:** Resend
- **Görseller:** Unsplash API

## 📁 Proje Yapısı

```
├── app/                    # Next.js uygulama dosyaları
│   ├── admin/             # Admin paneli
│   ├── dashboard/         # Kullanıcı paneli
│   ├── api/               # API endpoints
│   └── [slug]/            # Müşteri menü görünümü
├── components/            # React bileşenleri
├── lib/                   # Yardımcı fonksiyonlar
│   ├── db.ts             # Veritabanı bağlantısı
│   ├── auth.ts           # Kimlik doğrulama
│   └── anthropic.ts      # AI entegrasyonu
├── database/             # Veritabanı yedekleri (GİT'E EKLENMEMELİ!)
├── scripts/              # Yardımcı scriptler
│   ├── export-database.js
│   └── import-database.js
└── public/               # Statik dosyalar
    └── uploads/          # Yüklenen görseller
```

## 🔐 Güvenlik

- Şifreler bcrypt ile hashlenir
- JWT token bazlı kimlik doğrulama
- SQL injection koruması
- XSS koruması
- CSRF koruması
- Güvenli dosya yükleme (max 5MB, sadece resim formatları)

## 🎯 Üyelik Paketleri

### 🆓 Free (Ücretsiz)
- Temel menü özellikleri
- 1 mekan
- QR kod menü
- Sınırlı özellikler

### 💼 Basic (₺299/ay)
- AI zenginleştirme (günlük limit)
- 3 mekana kadar
- Online sipariş
- Temel raporlar
- Email desteği

### 👑 Premium (₺599/ay)
- Sınırsız AI zenginleştirme
- Sınırsız mekan
- Gelişmiş raporlar
- Öncelikli destek
- Özel özellikler

## 📝 Lisans

Bu proje özel bir projedir.

## 🆘 Destek

Sorularınız için: [destek email adresi]

---

**Geliştirici Notları:**

- Production'a deploy etmeden önce mutlaka `npm run db:export` ile yedek alın
- `.env` dosyasını asla Git'e eklemeyin
- `database/` klasörünü asla public klasörüne taşımayın
- Düzenli veritabanı yedekleri alın
