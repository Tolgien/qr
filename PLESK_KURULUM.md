
# QRim.net - Plesk Panel Kurulum Rehberi

## 📋 Gereksinimler

### Sunucu Gereksinimleri
- **Node.js**: 20.x veya üzeri
- **PostgreSQL**: 14.x veya üzeri
- **RAM**: Minimum 2GB (Önerilen 4GB)
- **Disk Alanı**: Minimum 10GB
- **İşletim Sistemi**: Ubuntu 20.04/22.04, CentOS 7/8, AlmaLinux 8

### Plesk Gereksinimleri
- **Plesk Obsidian**: 18.0.40 veya üzeri
- **Node.js Extension**: Plesk üzerinden kurulu olmalı
- **PostgreSQL**: Plesk üzerinden veya manuel kurulu

---

## 🚀 Adım 1: Sunucu Hazırlığı

### 1.1 Plesk'e Giriş
1. Plesk panel adresinize gidin: `https://sunucunuzun-ip-adresi:8443`
2. Kullanıcı adı ve şifre ile giriş yapın

### 1.2 Domain Ekleme
1. Sol menüden **"Websites & Domains"** seçin
2. **"Add Domain"** butonuna tıklayın
3. Domain bilgilerini girin:
   - **Domain name**: `qrim.net` (kendi domaininiz)
   - **Document root**: `/httpdocs` (varsayılan)
4. **OK** butonuna tıklayın

---

## 🔧 Adım 2: Node.js Kurulumu

### 2.1 Node.js Extension Kurulumu
1. Plesk ana sayfasında **"Extensions"** seçin
2. Arama kutusuna **"Node.js"** yazın
3. **"Node.js"** extension'ını bulun ve **"Install"** tıklayın
4. Kurulum tamamlanana kadar bekleyin

### 2.2 Node.js Versiyonu Ayarlama
1. Domain'inize gidin (Websites & Domains)
2. **"Node.js"** ikonuna tıklayın
3. **Node.js version**: `20.x` seçin
4. **Application mode**: `production`
5. **Document root**: `/httpdocs`
6. **Application startup file**: `server.js` (şimdilik boş bırakabilirsiniz)
7. **"Enable Node.js"** checkbox'ını işaretleyin
8. **"Apply"** butonuna tıklayın

---

## 🗄️ Adım 3: PostgreSQL Kurulumu ve Yapılandırma

### 3.1 PostgreSQL Kurulumu (Eğer kurulu değilse)

**SSH üzerinden:**
```bash
# Ubuntu/Debian için
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/AlmaLinux için
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.2 Veritabanı ve Kullanıcı Oluşturma

**SSH ile PostgreSQL'e giriş:**
```bash
sudo -u postgres psql
```

**PostgreSQL komutları:**
```sql
-- Veritabanı oluştur
CREATE DATABASE qrimnet;

-- Kullanıcı oluştur
CREATE USER qrimuser WITH PASSWORD 'GucluSifre123!@#';

-- Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE qrimnet TO qrimuser;

-- Ek yetkiler (PostgreSQL 15+ için)
\c qrimnet
GRANT ALL ON SCHEMA public TO qrimuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO qrimuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO qrimuser;

-- Çıkış
\q
```

### 3.3 PostgreSQL Uzaktan Erişim (İhtiyaç halinde)

**`/var/lib/pgsql/data/postgresql.conf` dosyasını düzenleyin:**
```bash
sudo nano /var/lib/pgsql/data/postgresql.conf
```

**Bu satırı bulun ve düzenleyin:**
```
listen_addresses = 'localhost'  # Şu şekilde değiştirin:
listen_addresses = '*'
```

**`/var/lib/pgsql/data/pg_hba.conf` dosyasını düzenleyin:**
```bash
sudo nano /var/lib/pgsql/data/pg_hba.conf
```

**Dosyanın sonuna ekleyin:**
```
# QRim.net için
host    qrimnet         qrimuser        127.0.0.1/32            md5
host    qrimnet         qrimuser        ::1/128                 md5
```

**PostgreSQL'i yeniden başlatın:**
```bash
sudo systemctl restart postgresql
```

---

## 📦 Adım 4: Proje Dosyalarının Yüklenmesi

### 4.1 SSH ile Sunucuya Bağlanma
```bash
ssh kullanici@sunucunuzun-ip-adresi
```

### 4.2 Domain Klasörüne Gitme
```bash
cd /var/www/vhosts/qrim.net/httpdocs
```

### 4.3 Mevcut Dosyaları Temizleme
```bash
rm -rf *
```

### 4.4 Proje Dosyalarını Yükleme

**Yöntem 1: Git ile (Önerilen)**
```bash
# Git kurulu değilse:
sudo apt install git  # Ubuntu/Debian
sudo yum install git  # CentOS/AlmaLinux

# Projeyi klonlayın (GitHub'da ise):
git clone https://github.com/kullanici-adi/qrimnet.git .

# Veya zip dosyasından:
wget https://siteadresiniz.com/qrimnet.zip
unzip qrimnet.zip
mv qrimnet/* .
rm -rf qrimnet qrimnet.zip
```

**Yöntem 2: FTP/SFTP ile**
1. FileZilla veya WinSCP kullanın
2. SFTP ile bağlanın:
   - Host: `sunucunuzun-ip-adresi`
   - Port: `22`
   - Kullanıcı: SSH kullanıcı adınız
   - Şifre: SSH şifreniz
3. Tüm proje dosyalarını `/var/www/vhosts/qrim.net/httpdocs` klasörüne yükleyin

### 4.5 Dosya İzinlerini Ayarlama
```bash
# Doğru kullanıcıya sahiplik ver
sudo chown -R domain_kullanici:psacln /var/www/vhosts/qrim.net/httpdocs

# İzinleri ayarla
find /var/www/vhosts/qrim.net/httpdocs -type d -exec chmod 755 {} \;
find /var/www/vhosts/qrim.net/httpdocs -type f -exec chmod 644 {} \;

# Upload klasörü için yazma izni
mkdir -p /var/www/vhosts/qrim.net/httpdocs/public/uploads
chmod 777 /var/www/vhosts/qrim.net/httpdocs/public/uploads
```

---

## ⚙️ Adım 5: Ortam Değişkenlerini Ayarlama

### 5.1 .env Dosyası Oluşturma
```bash
cd /var/www/vhosts/qrim.net/httpdocs
nano .env
```

### 5.2 .env İçeriği
```env
# Veritabanı Bağlantısı
DATABASE_URL=postgresql://qrimuser:GucluSifre123!@#@localhost:5432/qrimnet

# JWT Gizli Anahtarı (Güçlü bir değer üretin)
JWT_SECRET=super-gizli-anahtar-buraya-rastgele-karakter-girin-min-32-karakter

# Anthropic Claude API (AI için)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx

# Unsplash API (Görsel arama için - opsiyonel)
UNSPLASH_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxx

# iyzico Ödeme Sistemi (Türkiye için)
IYZICO_API_KEY=sandbox-xxxxxxxxxxxxx
IYZICO_SECRET_KEY=sandbox-xxxxxxxxxxxxx
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# Ortam
NODE_ENV=production

# Site URL
NEXT_PUBLIC_SITE_URL=https://qrim.net
```

**Dosyayı kaydedin:** `Ctrl+O` → `Enter` → `Ctrl+X`

### 5.3 .env Dosyasını Koruma
```bash
chmod 600 .env
```

---

## 📚 Adım 6: Bağımlılıkların Kurulumu

### 6.1 NPM Paketlerini Kurma
```bash
cd /var/www/vhosts/qrim.net/httpdocs
npm install
```

**Not:** Bu işlem 5-10 dakika sürebilir.

### 6.2 Olası Sorunlar ve Çözümleri

**Hata: "npm: command not found"**
```bash
# Node.js'in PATH'e eklendiğinden emin olun
export PATH=$PATH:/opt/plesk/node/20/bin
echo 'export PATH=$PATH:/opt/plesk/node/20/bin' >> ~/.bashrc
```

**Hata: "Permission denied"**
```bash
# npm cache temizle
npm cache clean --force

# node_modules klasörünü sil ve tekrar dene
rm -rf node_modules package-lock.json
npm install
```

---

## 🏗️ Adım 7: Veritabanı Şemasını Oluşturma

### 7.1 Schema SQL'i Çalıştırma
```bash
cd /var/www/vhosts/qrim.net/httpdocs

# PostgreSQL'e bağlan ve schema'yı çalıştır
psql -h localhost -U qrimuser -d qrimnet -f lib/db-schema.sql
```

**Şifre sorduğunda:** `GucluSifre123!@#` (kendi şifrenizi girin)

### 7.2 Seed Data ile Başlangıç Verilerini Ekleme
```bash
npm run seed
```

**Bu işlem:**
- Admin kullanıcısı oluşturur (username: `admin`, password: `admin123`)
- 2 örnek venue (kafe) ekler
- Kategoriler ve ürünler ekler
- Üyelik planlarını oluşturur

---

## 🔨 Adım 8: Production Build

### 8.1 Next.js Build
```bash
cd /var/www/vhosts/qrim.net/httpdocs
npm run build
```

**Bu işlem:**
- TypeScript kodlarını derler
- Static dosyaları optimize eder
- Production-ready build oluşturur
- 5-10 dakika sürebilir

### 8.2 Build Sonrası Kontrol
```bash
# .next klasörünün oluştuğunu kontrol edin
ls -la .next

# Build loglarını kontrol edin
cat .next/trace
```

---

## 🚀 Adım 9: Production Sunucusunu Başlatma

### 9.1 PM2 Process Manager Kurulumu
```bash
# PM2'yi global olarak kur
npm install -g pm2
```

### 9.2 PM2 ile Uygulamayı Başlatma
```bash
cd /var/www/vhosts/qrim.net/httpdocs

# Uygulamayı başlat
pm2 start npm --name "qrimnet" -- start

# Otomatik başlatmayı ayarla (sunucu yeniden başlatıldığında)
pm2 startup
pm2 save
```

### 9.3 PM2 Komutları
```bash
# Durum kontrolü
pm2 status

# Logları görüntüle
pm2 logs qrimnet

# Yeniden başlat
pm2 restart qrimnet

# Durdur
pm2 stop qrimnet

# Sil
pm2 delete qrimnet
```

---

## 🌐 Adım 10: Nginx Reverse Proxy Ayarları

### 10.1 Plesk'te Nginx Ayarları

1. **Plesk Panel** → **Websites & Domains** → `qrim.net`
2. **"Apache & nginx Settings"** tıklayın
3. **"nginx settings"** bölümüne gidin

### 10.2 Additional nginx directives Ekleme

**Aşağıdaki kodu ekleyin:**
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
}

location /_next/static {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 60m;
    add_header Cache-Control "public, max-age=3600";
}

location /uploads {
    alias /var/www/vhosts/qrim.net/httpdocs/public/uploads;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

**"OK" veya "Apply" butonuna tıklayın**

---

## 🔒 Adım 11: SSL Sertifikası (Let's Encrypt)

### 11.1 SSL Kurulumu
1. **Plesk Panel** → **Websites & Domains** → `qrim.net`
2. **"SSL/TLS Certificates"** tıklayın
3. **"Install"** butonuna tıklayın
4. **"Let's Encrypt"** seçin
5. **Email adresinizi** girin
6. **"Install"** tıklayın
7. **"Redirect from HTTP to HTTPS"** checkbox'ını işaretleyin
8. **"OK"** tıklayın

### 11.2 SSL Otomatik Yenileme
Let's Encrypt sertifikaları Plesk tarafından otomatik yenilenir.

---

## 🔥 Adım 12: Firewall ve Güvenlik

### 12.1 Firewall Kuralları
```bash
# PostgreSQL portunu sadece localhost'a aç
sudo firewall-cmd --zone=public --add-rich-rule='rule family="ipv4" source address="127.0.0.1" port protocol="tcp" port="5432" accept' --permanent

# HTTP ve HTTPS portlarını aç
sudo firewall-cmd --zone=public --add-service=http --permanent
sudo firewall-cmd --zone=public --add-service=https --permanent

# Firewall'u yeniden yükle
sudo firewall-cmd --reload
```

### 12.2 PostgreSQL Güvenlik
```bash
# pg_hba.conf dosyasını düzenle
sudo nano /var/lib/pgsql/data/pg_hba.conf

# Sadece local bağlantılara izin ver
# Aşağıdaki satırların doğru olduğundan emin olun:
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

---

## 📊 Adım 13: Performans Optimizasyonu

### 13.1 Node.js Performans Ayarları

**PM2 cluster mode (Çoklu CPU kullanımı):**
```bash
pm2 delete qrimnet

# Cluster mode ile başlat (4 instance)
pm2 start npm --name "qrimnet" -i 4 -- start

pm2 save
```

### 13.2 PostgreSQL Optimizasyonu

**`/var/lib/pgsql/data/postgresql.conf` düzenleyin:**
```bash
sudo nano /var/lib/pgsql/data/postgresql.conf
```

**Aşağıdaki değerleri ekleyin/düzenleyin:**
```conf
# Memory Settings (4GB RAM için)
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 16MB

# Connection Settings
max_connections = 100

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200
```

**PostgreSQL'i yeniden başlatın:**
```bash
sudo systemctl restart postgresql
```

### 13.3 Nginx Cache Ayarları

**Plesk nginx ayarlarına ekleyin:**
```nginx
# Cache için ek ayarlar
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=qrimnet_cache:10m max_size=1g inactive=60m use_temp_path=off;

location /_next/static {
    proxy_cache qrimnet_cache;
    proxy_cache_valid 200 60m;
    add_header X-Cache-Status $upstream_cache_status;
}
```

---

## 🔍 Adım 14: Monitoring ve Loglar

### 14.1 PM2 Monitoring
```bash
# Gerçek zamanlı monitoring
pm2 monit

# CPU ve Memory kullanımı
pm2 status

# Detaylı bilgi
pm2 show qrimnet
```

### 14.2 Log Dosyaları
```bash
# Next.js logları
pm2 logs qrimnet

# PostgreSQL logları
sudo tail -f /var/lib/pgsql/data/log/postgresql-*.log

# Nginx logları
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 14.3 Log Rotation (PM2)
```bash
# PM2 log rotation kurulumu
pm2 install pm2-logrotate

# Ayarları yapılandır
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## 🧪 Adım 15: Test ve Doğrulama

### 15.1 Temel Testler
```bash
# 1. Sunucunun çalıştığını kontrol et
curl http://localhost:3000

# 2. PostgreSQL bağlantısını test et
psql -h localhost -U qrimuser -d qrimnet -c "SELECT version();"

# 3. Domain erişimini test et
curl https://qrim.net
```

### 15.2 Tarayıcı Testleri
1. `https://qrim.net` adresine gidin
2. Ana sayfa yüklenmeli
3. **Admin Paneli:** `https://qrim.net/admin/login`
   - Username: `admin`
   - Password: `admin123`
4. **Kullanıcı Girişi:** `https://qrim.net/login`
5. **Örnek Menü:** `https://qrim.net/menu/molto-cafe`

### 15.3 API Testleri
```bash
# Venues API
curl https://qrim.net/api/venues

# Blog API
curl https://qrim.net/api/blog

# Membership Plans API
curl https://qrim.net/api/membership-plans
```

---

## 🛠️ Adım 16: Bakım ve Güncelleme

### 16.1 Uygulama Güncelleme
```bash
# 1. Projeyi yedekle
cd /var/www/vhosts/qrim.net
tar -czf httpdocs-backup-$(date +%Y%m%d).tar.gz httpdocs/

# 2. Yeni kodu çek (Git kullanıyorsanız)
cd httpdocs
git pull origin main

# 3. Bağımlılıkları güncelle
npm install

# 4. Yeniden build
npm run build

# 5. Uygulamayı yeniden başlat
pm2 restart qrimnet
```

### 16.2 Veritabanı Yedekleme
```bash
# Manuel yedek
pg_dump -h localhost -U qrimuser qrimnet > qrimnet-backup-$(date +%Y%m%d).sql

# Otomatik yedek (Crontab)
crontab -e

# Her gün saat 03:00'da yedek al
0 3 * * * pg_dump -h localhost -U qrimuser qrimnet > /backups/qrimnet-$(date +\%Y\%m\%d).sql
```

### 16.3 Veritabanı Geri Yükleme
```bash
# Yedekten geri yükle
psql -h localhost -U qrimuser -d qrimnet < qrimnet-backup-20250106.sql
```

---

## ❗ Sorun Giderme

### Hata 1: "Port 3000 already in use"
```bash
# Port kullanan process'i bul
lsof -i :3000

# Process'i sonlandır
kill -9 PID_NUMARASI

# PM2'yi temizle ve yeniden başlat
pm2 delete all
pm2 start npm --name "qrimnet" -- start
```

### Hata 2: "Database connection failed"
```bash
# PostgreSQL'in çalıştığını kontrol et
sudo systemctl status postgresql

# Kullanıcı ve veritabanını kontrol et
sudo -u postgres psql -c "\l"
sudo -u postgres psql -c "\du"

# Bağlantı testı
psql -h localhost -U qrimuser -d qrimnet -c "SELECT 1;"
```

### Hata 3: "npm install fails"
```bash
# Node ve NPM versiyonunu kontrol et
node --version  # v20.x olmalı
npm --version

# Cache temizle
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Hata 4: "502 Bad Gateway"
```bash
# PM2 durumunu kontrol et
pm2 status

# Uygulamayı yeniden başlat
pm2 restart qrimnet

# Nginx ayarlarını test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx
```

### Hata 5: "Permission denied"
```bash
# Dosya sahipliğini düzelt
sudo chown -R domain_kullanici:psacln /var/www/vhosts/qrim.net/httpdocs

# İzinleri düzelt
find /var/www/vhosts/qrim.net/httpdocs -type d -exec chmod 755 {} \;
find /var/www/vhosts/qrim.net/httpdocs -type f -exec chmod 644 {} \;
```

---

## 📝 Kontrol Listesi

Kurulumunuzun tamamlandığından emin olmak için:

- [ ] Node.js 20.x kurulu ve çalışıyor
- [ ] PostgreSQL kurulu ve çalışıyor
- [ ] Veritabanı ve kullanıcı oluşturuldu
- [ ] Proje dosyaları yüklendi
- [ ] `.env` dosyası yapılandırıldı
- [ ] `npm install` tamamlandı
- [ ] Database schema çalıştırıldı
- [ ] Seed data eklendi
- [ ] `npm run build` başarılı
- [ ] PM2 ile uygulama çalışıyor
- [ ] Nginx reverse proxy ayarlandı
- [ ] SSL sertifikası kuruldu
- [ ] Domain erişilebilir durumda
- [ ] Admin paneline giriş yapılabiliyor
- [ ] Örnek menü görüntülenebiliyor
- [ ] Upload klasörü yazılabilir
- [ ] Firewall kuralları ayarlandı
- [ ] Log dosyaları kontrol edildi
- [ ] Yedekleme sistemi kuruldu

---

## 🎉 Kurulum Tamamlandı!

Artık QRim.net uygulamanız Plesk panelinde production ortamında çalışıyor!

**Önemli İlk Adımlar:**
1. Admin paneline giriş yapın: `https://qrim.net/admin/login`
2. Varsayılan admin şifresini değiştirin
3. Site ayarlarını yapılandırın
4. İlk venue'nuzu oluşturun
5. API anahtarlarınızı (Anthropic, Unsplash, iyzico) ayarlayın

**Destek ve Yardım:**
- Dokümantasyon: `https://qrim.net/docs`
- E-posta: destek@qrim.net

---

## 📚 Ek Kaynaklar

- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Reverse Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [Plesk Documentation](https://docs.plesk.com/)

---

**Son Güncelleme:** 6 Kasım 2025  
**Versiyon:** 1.0.0
