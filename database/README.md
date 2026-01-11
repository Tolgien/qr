# QRim.net Veritabanı Dosyaları

Bu klasör QRim.net uygulamasının veritabanı dosyalarını içerir.

## Dosyalar

### 1. `db-schema.sql` - Sadece Şema (Boş Veritabanı)
Tablolar, indexler ve ilişkileri içerir ancak veri içermez. Yeni bir veritabanı oluşturmak için kullanın.

**Kullanım:**
```bash
# PostgreSQL kullanarak
psql -U kullanici_adi -d veritabani_adi -f database/db-schema.sql

# Veya DATABASE_URL ile
psql $DATABASE_URL -f database/db-schema.sql
```

### 2. `demo.sql` - Şema + Demo Verileri (Tam Dump)
Tüm tabloları, ilişkileri VE demo verilerini içerir. Test için hazır bir veritabanı kurmak istiyorsanız bu dosyayı kullanın.

**Demo veritabanında neler var:**
- ✅ 2 Cafe/Restaurant (QRim Cafe, Molto Cafe)
- ✅ 10+ Ürün kategorileri
- ✅ Ürünler (içecekler, yiyecekler vb.)
- ✅ Blog yazıları
- ✅ Demo kullanıcılar (cafe sahipleri)
- ✅ Admin kullanıcı
- ✅ Slider görselleri
- ✅ Üyelik planları

**Kullanım:**
```bash
# PostgreSQL kullanarak
psql -U kullanici_adi -d veritabani_adi -f database/demo.sql

# Veya DATABASE_URL ile
psql $DATABASE_URL -f database/demo.sql
```

**⚠️ UYARI:** `demo.sql` dosyası mevcut tüm tabloları siler ve yeniden oluşturur. 
Mevcut verileriniz varsa YEDEK ALIN!

## Hangi Dosyayı Kullanmalıyım?

| Senaryo | Dosya | Açıklama |
|---------|-------|----------|
| Sıfırdan başlıyorum | `db-schema.sql` | Boş tablolar oluşturur, verilerinizi eklersiniz |
| Test için demo verileri istiyorum | `demo.sql` | Hazır cafe örnekleri ve verilerle gelir |
| Production kurulumu yapıyorum | `db-schema.sql` | Boş şema ile başlayın |
| Geliştirme/Test ortamı | `demo.sql` | Demo verilerle hızlıca test edin |

## Veritabanı Yapısı

### Ana Tablolar
- **users**: Cafe sahipleri ve müşteriler
- **admin_users**: Süper admin kullanıcılar
- **venues**: Cafe/Restaurant profilleri
- **categories**: Menü kategorileri
- **items**: Menü ürünleri (detaylı bilgilerle)
- **uploaded_images**: Veritabanında saklanan resimler (Base64)
- **sliders**: Ana sayfa slider görselleri
- **orders**: Sipariş kayıtları
- **reviews**: Ürün değerlendirmeleri
- **blog_posts**: Blog yazıları
- **membership_plans**: Üyelik planları (Free, Basic, Premium)
- **waiter_calls**: Garson çağırma istekleri

### Özellikler
- ✅ Foreign key ilişkileri
- ✅ Cascade delete kuralları
- ✅ Performance için indexler
- ✅ JSON/JSONB desteği
- ✅ Tam text search hazır yapı
- ✅ Timestamp tracking (created_at, updated_at)

## Backup Alma

Mevcut veritabanınızın yedeğini almak için:

```bash
# Sadece şema
pg_dump $DATABASE_URL --schema-only --no-owner --no-acl > backup-schema.sql

# Şema + Veriler
pg_dump $DATABASE_URL --no-owner --no-acl --clean --if-exists > backup-full.sql
```

## Sorun Giderme

### "role does not exist" hatası
```bash
# --no-owner bayrağı kullanın
psql $DATABASE_URL -f database/demo.sql --no-owner
```

### "permission denied" hatası
Veritabanı kullanıcınızın yeterli izinleri olduğundan emin olun:
```sql
GRANT ALL PRIVILEGES ON DATABASE veritabani_adi TO kullanici_adi;
```

### "already exists" hatası
`demo.sql` dosyası zaten `DROP TABLE IF EXISTS` komutlarını içerir. 
Eğer sorun devam ederse veritabanını tamamen temizleyin:
```bash
# DİKKAT: Tüm verileri siler!
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $DATABASE_URL -f database/demo.sql
```

## Geliştirici Notları

- **uploaded_images** tablosu Base64 formatında resim saklar
- Her resim yüklemesi ~%33 daha fazla yer kaplar (Base64 overhead)
- Yüksek hacimli production ortamlarında BYTEA kullanımı düşünülebilir
- Maksimum resim boyutu: 5MB
- Desteklenen formatlar: JPEG, PNG, GIF, WEBP

## Lisans

Bu veritabanı şeması QRim.net uygulamasının bir parçasıdır.
