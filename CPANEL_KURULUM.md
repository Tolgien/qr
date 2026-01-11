
# QRim.net - cPanel Kurulum Rehberi

## 📋 Gereksinimler

### Sunucu Gereksinimleri
- **Node.js**: 20.x veya üzeri
- **PostgreSQL**: 14.x veya üzeri
- **RAM**: Minimum 2GB (Önerilen 4GB)
- **Disk Alanı**: Minimum 10GB
- **İşletim Sistemi**: CentOS 7/8, AlmaLinux 8, Rocky Linux 8, CloudLinux

### cPanel Gereksinimleri
- **cPanel/WHM**: 11.110 veya üzeri
- **SSH Erişimi**: Root veya sudo yetkili kullanıcı
- **Domain**: Aktif ve DNS kayıtları yapılandırılmış
- **WHM Erişimi**: Sunucu yönetimi için

---

## 🚀 Adım 1: Sunucu Hazırlığı

### 1.1 SSH ile Root Erişimi
```bash
ssh root@sunucunuzun-ip-adresi
# veya
ssh -p 22 root@sunucunuzun-ip-adresi
```

### 1.2 Sistem Güncellemesi
```bash
# CentOS/AlmaLinux/Rocky Linux için
yum update -y

# CloudLinux için
yum update -y
```

### 1.3 Gerekli Paketlerin Kurulumu
```bash
# Temel araçları kur
yum install -y curl wget git unzip nano vim

# Geliştirme araçları
yum groupinstall -y "Development Tools"
yum install -y gcc-c++ make
```

---

## 🔧 Adım 2: Node.js Kurulumu

### 2.1 NodeSource Repository ile Node.js 20.x Kurulumu

```bash
# NodeSource repository'sini ekle
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -

# Node.js'i kur
yum install -y nodejs

# Versiyonu doğrula
node --version  # v20.x.x olmalı
npm --version   # 10.x.x olmalı
```

### 2.2 Alternatif: NVM ile Node.js Kurulumu (Önerilen)

```bash
# NVM kurulumu
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Shell'i yeniden yükle
source ~/.bashrc

# Node.js 20.x kur
nvm install 20
nvm use 20
nvm alias default 20

# Versiyonu doğrula
node --version
npm --version
```

### 2.3 Global NPM Paketlerini Kurma
```bash
# PM2 process manager
npm install -g pm2

# PM2 versiyonunu kontrol et
pm2 --version
```

---

## 🗄️ Adım 3: PostgreSQL Kurulumu

### 3.1 PostgreSQL Repository Ekleme

```bash
# PostgreSQL repository ekle
yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-$(rpm -E %{rhel})-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Built-in PostgreSQL modülünü devre dışı bırak
dnf -qy module disable postgresql

# PostgreSQL 14 kur
yum install -y postgresql14-server postgresql14-contrib
```

### 3.2 PostgreSQL Başlatma ve Yapılandırma

```bash
# Veritabanını başlat (ilk kurulum)
/usr/pgsql-14/bin/postgresql-14-setup initdb

# Servisi başlat ve otomatik başlatmayı aktif et
systemctl enable postgresql-14
systemctl start postgresql-14

# Durumu kontrol et
systemctl status postgresql-14
```

### 3.3 PostgreSQL Şifre Ayarlama

```bash
# PostgreSQL kullanıcısına geç
sudo -u postgres psql

# Postgres süper kullanıcısı için şifre belirle
ALTER USER postgres WITH PASSWORD 'GucluPostgresSifresi123!@#';

# Çıkış
\q
```

### 3.4 Veritabanı ve Kullanıcı Oluşturma

```bash
# PostgreSQL'e giriş yap
sudo -u postgres psql
```

**PostgreSQL komutları:**
```sql
-- QRim.net veritabanını oluştur
CREATE DATABASE qrimnet;

-- QRim.net kullanıcısını oluştur
CREATE USER qrimuser WITH PASSWORD 'QrimGucluSifre789!@#';

-- Veritabanı yetkilerini ver
GRANT ALL PRIVILEGES ON DATABASE qrimnet TO qrimuser;

-- Veritabanına bağlan
\c qrimnet

-- PostgreSQL 15+ için ek yetkiler
GRANT ALL ON SCHEMA public TO qrimuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO qrimuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO qrimuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO qrimuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO qrimuser;

-- Çıkış
\q
```

### 3.5 PostgreSQL Kimlik Doğrulama Ayarları

**pg_hba.conf dosyasını düzenle:**
```bash
nano /var/lib/pgsql/14/data/pg_hba.conf
```

**Dosyanın sonuna ekle:**
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# QRim.net için local bağlantılar
local   qrimnet         qrimuser                                md5
host    qrimnet         qrimuser        127.0.0.1/32            md5
host    qrimnet         qrimuser        ::1/128                 md5
```

**Kaydet:** `Ctrl+O` → `Enter` → `Ctrl+X`

**PostgreSQL'i yeniden başlat:**
```bash
systemctl restart postgresql-14
```

### 3.6 Bağlantı Testi
```bash
# Veritabanı bağlantısını test et
psql -h localhost -U qrimuser -d qrimnet -c "SELECT version();"

# Şifre: QrimGucluSifre789!@#
```

---

## 👤 Adım 4: cPanel Hesabı Oluşturma

### 4.1 WHM Panel Girişi
1. Tarayıcıda WHM adresinize gidin: `https://sunucunuzun-ip-adresi:2087`
2. Root kullanıcı adı ve şifre ile giriş yapın

### 4.2 Yeni Hesap Oluşturma

1. **WHM** → **Account Functions** → **Create a New Account**
2. Gerekli bilgileri doldurun:
   - **Domain**: `qrim.net` (kendi domaininiz)
   - **Username**: `qrimuser` (veya tercih ettiğiniz kullanıcı adı)
   - **Password**: Güçlü bir şifre belirleyin (minimum 12 karakter)
   - **Email**: `admin@qrim.net`
   - **Package**: Uygun bir hosting paketi seçin (minimum: 2GB disk, 1GB RAM)
   - **Choose a Theme**: Paper Lantern (varsayılan)
3. **Create** butonuna tıklayın

### 4.3 cPanel Kullanıcı Bilgileri
Hesap oluşturulduktan sonra şu bilgileri not edin:
- **cPanel URL**: `https://qrim.net:2083` veya `https://sunucunuzun-ip-adresi:2083`
- **Username**: `qrimuser`
- **Password**: Belirlediğiniz şifre

---

## 📁 Adım 5: cPanel Ayarları ve Dizin Hazırlığı

### 5.1 cPanel'e Giriş
1. `https://qrim.net:2083` adresine gidin
2. Kullanıcı adı (`qrimuser`) ve şifre ile giriş yapın

### 5.2 SSH Erişimini Aktif Etme (WHM'den)

**WHM panelinden:**
1. **WHM** → **Account Functions** → **Manage Shell Access**
2. `qrimuser` hesabını bulun
3. **Enable Shell Access** seçin
4. **Save** tıklayın

### 5.3 SSH ile cPanel Kullanıcısı Olarak Bağlanma

```bash
# SSH ile cPanel kullanıcısı olarak bağlan
ssh qrimuser@sunucunuzun-ip-adresi

# veya cPanel şifrenizi kullanarak
ssh -p 22 qrimuser@sunucunuzun-ip-adresi
```

### 5.4 Web Dizini Yapısı

cPanel'de varsayılan dizin yapısı:
```
/home/qrimuser/
├── public_html/          # Ana web dizini (buraya proje yüklenecek)
├── www/                  # public_html'in sembolik linki
├── logs/                 # Web sunucu logları
├── mail/                 # E-posta dosyaları
├── tmp/                  # Geçici dosyalar
└── .my.cnf              # MySQL yapılandırması
```

### 5.5 Mevcut Dosyaları Yedekleme ve Temizleme

```bash
# SSH ile bağlandıktan sonra
cd ~/public_html

# Mevcut dosyaları yedekle
mkdir -p ~/backups
tar -czf ~/backups/public_html-backup-$(date +%Y%m%d).tar.gz .

# public_html'i temizle (dikkatli olun!)
rm -rf *
rm -rf .[!.]*
```

---

## 📦 Adım 6: Proje Dosyalarının Yüklenmesi

### 6.1 Git ile Proje Klonlama (Önerilen)

```bash
# public_html dizinine git
cd ~/public_html

# Git kurulu değilse root olarak kur
# (Root SSH ile)
# yum install -y git

# Projeyi klonla
git clone https://github.com/KULLANICI_ADI/qrimnet.git .

# Veya zip dosyasından
wget https://siteadresiniz.com/qrimnet.zip
unzip qrimnet.zip
mv qrimnet/* .
mv qrimnet/.* . 2>/dev/null
rm -rf qrimnet qrimnet.zip
```

### 6.2 FTP/SFTP ile Yükleme (Alternatif)

**FileZilla veya WinSCP ile:**
1. **Protocol**: SFTP
2. **Host**: `sunucunuzun-ip-adresi`
3. **Port**: `22`
4. **Username**: `qrimuser` (cPanel kullanıcı adınız)
5. **Password**: cPanel şifreniz
6. **Remote directory**: `/home/qrimuser/public_html`
7. Tüm proje dosyalarını yükleyin

### 6.3 cPanel File Manager ile Yükleme

1. **cPanel** → **Files** → **File Manager**
2. `public_html` dizinine gidin
3. **Upload** butonuna tıklayın
4. Proje zip dosyasını yükleyin
5. Zip dosyasına sağ tıklayıp **Extract** seçin
6. İçeriği `public_html` dizinine taşıyın

### 6.4 Dosya İzinlerini Ayarlama

```bash
cd ~/public_html

# Dizin izinleri (755)
find . -type d -exec chmod 755 {} \;

# Dosya izinleri (644)
find . -type f -exec chmod 644 {} \;

# Upload klasörü için yazma izni
mkdir -p public/uploads
chmod 777 public/uploads

# .env dosyası için özel izin (daha sonra oluşturulacak)
touch .env
chmod 600 .env
```

---

## ⚙️ Adım 7: Ortam Değişkenlerini Ayarlama

### 7.1 .env Dosyası Oluşturma

```bash
cd ~/public_html
nano .env
```

### 7.2 .env İçeriği

```env
# Veritabanı Bağlantısı
DATABASE_URL=postgresql://qrimuser:QrimGucluSifre789!@#@localhost:5432/qrimnet

# JWT Gizli Anahtarı (32+ karakter, güçlü ve rastgele)
JWT_SECRET=super-gizli-jwt-secret-key-minimum-32-karakter-rastgele-string-buraya

# Anthropic Claude API (AI özellikleri için)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx

# Unsplash API (Görsel arama için - opsiyonel)
UNSPLASH_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxx

# iyzico Ödeme Sistemi (Türkiye için)
IYZICO_API_KEY=sandbox-xxxxxxxxxxxxx
IYZICO_SECRET_KEY=sandbox-xxxxxxxxxxxxx
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# Ortam
NODE_ENV=production

# Site URL (kendi domaininiz)
NEXT_PUBLIC_SITE_URL=https://qrim.net

# Port (cPanel'de genelde 3000 kullanılır)
PORT=3000
```

**Dosyayı kaydet:** `Ctrl+O` → `Enter` → `Ctrl+X`

### 7.3 .env Dosyasını Koruma
```bash
chmod 600 .env
chown qrimuser:qrimuser .env
```

---

## 📚 Adım 8: Bağımlılıkların Kurulumu

### 8.1 Node Modules Yükleme

```bash
cd ~/public_html

# NPM cache temizle
npm cache clean --force

# Paketleri kur (5-10 dakika sürebilir)
npm install

# Hata alırsanız legacy peer deps ile deneyin
npm install --legacy-peer-deps
```

### 8.2 Build İzinleri

```bash
# node_modules için izinler
chmod -R 755 node_modules

# .next klasörü için izinler (build sonrası oluşacak)
mkdir -p .next
chmod -R 755 .next
```

---

## 🏗️ Adım 9: Veritabanı Şemasını Oluşturma

### 9.1 Schema SQL Dosyasını Çalıştırma

```bash
cd ~/public_html

# PostgreSQL'e bağlanıp schema'yı çalıştır
psql -h localhost -U qrimuser -d qrimnet -f lib/db-schema.sql

# Şifre sorduğunda: QrimGucluSifre789!@#
```

### 9.2 Seed Data ile Başlangıç Verilerini Ekleme

```bash
# Seed script'i çalıştır
npm run seed
```

**Bu işlem şunları yapar:**
- Admin kullanıcısı oluşturur (`admin` / `admin123`)
- 2 örnek venue (kafe/restoran) ekler
- Kategoriler ve örnek ürünler ekler
- Üyelik planlarını oluşturur

### 9.3 Veritabanı Kontrolü

```bash
# Tabloları kontrol et
psql -h localhost -U qrimuser -d qrimnet -c "\dt"

# Venue sayısını kontrol et
psql -h localhost -U qrimuser -d qrimnet -c "SELECT COUNT(*) FROM venues;"

# Admin kullanıcısını kontrol et
psql -h localhost -U qrimuser -d qrimnet -c "SELECT id, email FROM users WHERE email = 'admin@qrim.net';"
```

---

## 🔨 Adım 10: Production Build

### 10.1 Next.js Build

```bash
cd ~/public_html

# Production build oluştur (5-10 dakika sürebilir)
npm run build
```

**Build başarılı olmalı ve çıktı:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         95.4 kB
├ ○ /api/venues                          0 B                0 B
└ ○ /menu/[slug]                         12.3 kB        102.5 kB
```

### 10.2 Build Kontrolü

```bash
# .next klasörünün oluştuğunu doğrula
ls -la .next

# Build boyutunu kontrol et
du -sh .next
```

---

## 🚀 Adım 11: PM2 ile Uygulama Başlatma

### 11.1 PM2 Yapılandırma Dosyası Oluşturma

```bash
cd ~/public_html
nano ecosystem.config.js
```

**ecosystem.config.js içeriği:**
```javascript
module.exports = {
  apps: [{
    name: 'qrimnet',
    script: 'npm',
    args: 'start',
    cwd: '/home/qrimuser/public_html',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/qrimuser/logs/qrimnet-error.log',
    out_file: '/home/qrimuser/logs/qrimnet-out.log',
    log_file: '/home/qrimuser/logs/qrimnet-combined.log',
    time: true
  }]
}
```

**Kaydet:** `Ctrl+O` → `Enter` → `Ctrl+X`

### 11.2 Log Klasörü Oluşturma

```bash
mkdir -p ~/logs
chmod 755 ~/logs
```

### 11.3 PM2 ile Uygulamayı Başlatma

```bash
cd ~/public_html

# PM2 ile başlat
pm2 start ecosystem.config.js

# Durumu kontrol et
pm2 status

# Logları görüntüle
pm2 logs qrimnet --lines 50
```

### 11.4 PM2 Otomatik Başlatma Yapılandırması

```bash
# Startup script oluştur (cPanel kullanıcısı olarak)
pm2 startup

# Çıktıdaki komutu ROOT olarak çalıştırın
# Örnek çıktı:
# [PM2] You have to run this command as root. Execute the following command:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u qrimuser --hp /home/qrimuser

# Root SSH ile:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u qrimuser --hp /home/qrimuser

# Mevcut konfigürasyonu kaydet (cPanel kullanıcısı olarak)
pm2 save
```

### 11.5 PM2 Temel Komutları

```bash
# Uygulama durumu
pm2 status

# Logları izle
pm2 logs qrimnet

# Belirli sayıda log satırı
pm2 logs qrimnet --lines 100

# Sadece error logları
pm2 logs qrimnet --err

# Yeniden başlat
pm2 restart qrimnet

# Durdur
pm2 stop qrimnet

# Sil
pm2 delete qrimnet

# Tüm process'leri listele
pm2 list

# Detaylı bilgi
pm2 show qrimnet

# Gerçek zamanlı monitoring
pm2 monit
```

---

## 🌐 Adım 12: Apache Reverse Proxy Yapılandırması

cPanel varsayılan olarak Apache kullanır. Node.js uygulamasını Apache üzerinden çalıştırmak için reverse proxy gereklidir.

### 12.1 .htaccess Dosyası Oluşturma

```bash
cd ~/public_html
nano .htaccess
```

**.htaccess içeriği:**
```apache
# QRim.net - Node.js Reverse Proxy

# Apache 2.4+ gerekli
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # HTTP'den HTTPS'e yönlendirme (SSL kurulumundan sonra aktif edin)
    # RewriteCond %{HTTPS} off
    # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Node.js static dosyaları için
    RewriteCond %{REQUEST_URI} ^/_next/static/(.*)$ [OR]
    RewriteCond %{REQUEST_URI} ^/uploads/(.*)$
    RewriteRule ^(.*)$ - [L]
    
    # Node.js uygulamasına yönlendir
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
</IfModule>

# Proxy ayarları
<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
    
    # WebSocket desteği
    <IfModule mod_proxy_wstunnel.c>
        RewriteEngine on
        RewriteCond %{HTTP:Upgrade} websocket [NC]
        RewriteCond %{HTTP:Connection} upgrade [NC]
        RewriteRule ^/?(.*) "ws://127.0.0.1:3000/$1" [P,L]
    </IfModule>
    
    # Güvenlik başlıkları
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"
    RequestHeader set X-Real-IP %{REMOTE_ADDR}s
    
    # Timeout ayarları
    ProxyTimeout 300
</IfModule>

# Cache kontrol
<IfModule mod_headers.c>
    # Static dosyalar için cache
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    # HTML dosyaları için cache yok
    <FilesMatch "\.(html|htm)$">
        Header set Cache-Control "no-cache, no-store, must-revalidate"
        Header set Pragma "no-cache"
        Header set Expires 0
    </FilesMatch>
</IfModule>

# Güvenlik
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Error sayfaları (opsiyonel)
ErrorDocument 404 /404.html
ErrorDocument 500 /500.html
```

**Kaydet:** `Ctrl+O` → `Enter` → `Ctrl+X`

### 12.2 Apache Modüllerini Aktif Etme (WHM/Root Erişimi Gerekli)

**Root SSH ile:**
```bash
# Gerekli Apache modüllerini kur
yum install -y mod_proxy_html

# Modülleri aktif et
/scripts/install_module Cpanel::Easy::Apache4::ModProxyHTML
/scripts/install_module Cpanel::Easy::Apache4::ModProxyWstunnel

# Apache'yi yeniden başlat
/scripts/restartsrv_httpd
```

### 12.3 WHM'den Apache Yapılandırması

1. **WHM** → **Service Configuration** → **Apache Configuration** → **Include Editor**
2. **Pre Main Include** → `qrimuser` hesabını seçin
3. Aşağıdaki kodu ekleyin:

```apache
<VirtualHost *:80>
    ServerName qrim.net
    ServerAlias www.qrim.net
    
    DocumentRoot /home/qrimuser/public_html
    
    <Directory /home/qrimuser/public_html>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Proxy ayarları
    ProxyPreserveHost On
    ProxyPass /uploads !
    ProxyPass /_next/static !
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
    
    # WebSocket desteği
    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://127.0.0.1:3000/$1" [P,L]
    
    # Loglar
    ErrorLog /home/qrimuser/logs/qrimnet-error.log
    CustomLog /home/qrimuser/logs/qrimnet-access.log combined
</VirtualHost>
```

4. **Update** butonuna tıklayın
5. Apache'yi yeniden başlatın

### 12.4 Apache Testi

```bash
# Apache config test (root olarak)
apachectl configtest

# "Syntax OK" çıktısı almalısınız

# Apache'yi yeniden başlat
/scripts/restartsrv_httpd
```

---

## 🔒 Adım 13: SSL Sertifikası (Let's Encrypt)

### 13.1 cPanel AutoSSL ile SSL Kurulumu (En Kolay)

1. **cPanel** → **Security** → **SSL/TLS Status**
2. Domain'inizi (`qrim.net`) ve `www` subdomain'ini seçin
3. **Run AutoSSL** butonuna tıklayın
4. İşlem tamamlanana kadar bekleyin (1-5 dakika)
5. SSL sertifikası otomatik yüklenecek

### 13.2 Let's Encrypt ile Manuel SSL Kurulumu (Alternatif)

**cPanel kullanıcısı olarak:**
```bash
# Let's Encrypt sertifikası al (root gerekli)
# Root SSH ile:
/usr/local/cpanel/bin/autossl_check --user=qrimuser

# veya certbot kullanarak:
certbot certonly --webroot -w /home/qrimuser/public_html -d qrim.net -d www.qrim.net
```

### 13.3 SSL Sertifikasını cPanel'e Yükleme (Manuel ise)

1. **cPanel** → **Security** → **SSL/TLS**
2. **Manage SSL sites** tıklayın
3. Domain'inizi seçin
4. Sertifika, Private Key ve CA Bundle bilgilerini yapıştırın
5. **Install Certificate** butonuna tıklayın

### 13.4 HTTPS Yönlendirme

**.htaccess dosyasını düzenle:**
```bash
nano ~/public_html/.htaccess
```

**HTTP'den HTTPS'e yönlendirme satırlarını aktif et:**
```apache
# HTTP'den HTTPS'e yönlendirme
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 13.5 SSL Otomatik Yenileme

cPanel AutoSSL otomatik yenilemeyi halleder. Manuel kurulumda:

```bash
# Crontab ekle (root olarak)
crontab -e

# Her gün saat 03:00'da kontrol et
0 3 * * * /usr/local/cpanel/bin/autossl_check --all >/dev/null 2>&1
```

---

## 🔥 Adım 14: Firewall ve Güvenlik

### 14.1 CSF Firewall Kurulumu (Önerilen)

**Root SSH ile:**
```bash
# CSF kurulumu
cd /usr/src
wget https://download.configserver.com/csf.tgz
tar -xzf csf.tgz
cd csf
sh install.sh

# CSF'yi yapılandır
nano /etc/csf/csf.conf
```

**Önemli CSF ayarları:**
```conf
# Testing mode kapalı
TESTING = "0"

# İzin verilen portlar
TCP_IN = "20,21,22,25,53,80,110,143,443,465,587,993,995,2077,2078,2082,2083,2086,2087,2095,2096"
TCP_OUT = "20,21,22,25,53,80,110,113,443,587,993,995"

# UDP portları
UDP_IN = "20,21,53"
UDP_OUT = "20,21,53,113,123"

# ICMP (ping)
ICMP_IN = "1"

# Synflood koruması
SYNFLOOD = "1"

# Port scan koruması
PORTFLOOD = "22;tcp;5;300"
```

**CSF'yi başlat:**
```bash
csf -r
systemctl enable csf
systemctl start csf

# Durumu kontrol et
csf -l
```

### 14.2 cPanel Firewall (WHM)

1. **WHM** → **Plugins** → **ConfigServer Security & Firewall**
2. **Firewall Configuration** tıklayın
3. Yukarıdaki ayarları yapın
4. **Change** → **Restart csf+lfd** tıklayın

### 14.3 PostgreSQL Güvenlik

```bash
# pg_hba.conf güvenliği kontrol et
cat /var/lib/pgsql/14/data/pg_hba.conf | grep -v "^#" | grep -v "^$"

# Sadece local bağlantılara izin verildiğinden emin olun
```

### 14.4 Fail2Ban Kurulumu (Opsiyonel)

```bash
# Fail2Ban kur (root olarak)
yum install -y fail2ban fail2ban-systemd

# Yapılandırma
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
nano /etc/fail2ban/jail.local
```

**jail.local önemli ayarlar:**
```conf
[DEFAULT]
bantime  = 3600
findtime  = 600
maxretry = 5

[sshd]
enabled = true
port    = ssh
logpath = /var/log/secure

[apache-auth]
enabled = true
port    = http,https
logpath = /usr/local/apache/logs/error_log
```

**Servisi başlat:**
```bash
systemctl enable fail2ban
systemctl start fail2ban

# Durumu kontrol et
fail2ban-client status
```

---

## 📊 Adım 15: Performans Optimizasyonu

### 15.1 PM2 Cluster Mode (Çoklu CPU Kullanımı)

**ecosystem.config.js dosyasını düzenle:**
```bash
nano ~/public_html/ecosystem.config.js
```

**instances değerini değiştir:**
```javascript
module.exports = {
  apps: [{
    name: 'qrimnet',
    script: 'npm',
    args: 'start',
    instances: 2,        // veya 'max' (tüm CPU çekirdeklerini kullanır)
    exec_mode: 'cluster',
    // ... diğer ayarlar
  }]
}
```

**PM2'yi yeniden başlat:**
```bash
pm2 delete qrimnet
pm2 start ecosystem.config.js
pm2 save
```

### 15.2 PostgreSQL Performans Ayarları

```bash
# PostgreSQL config dosyasını düzenle (root olarak)
nano /var/lib/pgsql/14/data/postgresql.conf
```

**Performans ayarları (4GB RAM için):**
```conf
# Memory Settings
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 16MB

# Connections
max_connections = 100

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB

# Checkpoints
checkpoint_completion_target = 0.9

# Query Planner
default_statistics_target = 100

# Autovacuum (temizlik)
autovacuum = on
autovacuum_max_workers = 3

# Logging (opsiyonel)
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
```

**PostgreSQL'i yeniden başlat:**
```bash
systemctl restart postgresql-14
```

### 15.3 Apache Performans Ayarları (WHM/Root)

**WHM'den:**
1. **WHM** → **Service Configuration** → **Apache Configuration** → **Global Configuration**
2. Aşağıdaki ayarları yapın:

```apache
# Timeout ayarları
Timeout 300
KeepAlive On
MaxKeepAliveRequests 100
KeepAliveTimeout 5

# MPM Worker ayarları (tercih edilen)
<IfModule mpm_worker_module>
    StartServers         4
    MinSpareThreads      25
    MaxSpareThreads      75
    ThreadsPerChild      25
    MaxRequestWorkers    150
    MaxConnectionsPerChild 1000
</IfModule>
```

3. **Save** ve **Rebuild Configuration and Restart Apache** tıklayın

### 15.4 OPcache Ayarları (PHP - opsiyonel)

cPanel PHP ayarları:
1. **WHM** → **Software** → **MultiPHP INI Editor**
2. `qrimuser` hesabını seçin
3. OPcache ayarları:

```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=60
opcache.fast_shutdown=1
```

### 15.5 Redis Cache (Opsiyonel)

```bash
# Redis kur (root olarak)
yum install -y redis

# Servisi başlat
systemctl enable redis
systemctl start redis

# Durumu kontrol et
redis-cli ping
# PONG çıktısı almalısınız
```

**.env dosyasına ekle:**
```bash
nano ~/public_html/.env

# Redis URL ekle
REDIS_URL=redis://localhost:6379
```

---

## 🔍 Adım 16: Monitoring ve Loglar

### 16.1 PM2 Monitoring

```bash
# Gerçek zamanlı monitoring
pm2 monit

# CPU ve Memory kullanımı
pm2 status

# Detaylı bilgi
pm2 show qrimnet

# Process listesi
pm2 list
```

### 16.2 Log Dosyaları

```bash
# PM2 logları
pm2 logs qrimnet

# Son 100 satır
pm2 logs qrimnet --lines 100

# Sadece error logları
pm2 logs qrimnet --err

# Log dosyalarının konumu
ls -la ~/logs/

# PostgreSQL logları (root olarak)
tail -f /var/lib/pgsql/14/data/log/postgresql-*.log

# Apache logları
tail -f ~/logs/qrimnet-error.log
tail -f ~/logs/qrimnet-access.log

# cPanel error logları
tail -f ~/logs/error_log
```

### 16.3 PM2 Log Rotation

```bash
# PM2 log rotation modülünü kur
pm2 install pm2-logrotate

# Ayarları yapılandır
pm2 set pm2-logrotate:max_size 10M         # Max log boyutu
pm2 set pm2-logrotate:retain 7              # 7 gün saklansın
pm2 set pm2-logrotate:compress true         # Sıkıştır
pm2 set pm2-logrotate:workerInterval 30     # 30 saniyede kontrol

# Ayarları görüntüle
pm2 conf pm2-logrotate
```

### 16.4 cPanel Log Viewer

1. **cPanel** → **Metrics** → **Raw Access**
2. Domain'inizi seçin
3. Logları görüntüleyin veya indirin

### 16.5 Disk Kullanımı İzleme

```bash
# Genel disk kullanımı
df -h

# Quota kontrolü (cPanel kullanıcısı)
quota -s

# Proje klasörü boyutu
du -sh ~/public_html

# En büyük klasörleri bul
du -h ~/public_html | sort -rh | head -20

# Node modules boyutu
du -sh ~/public_html/node_modules

# .next build boyutu
du -sh ~/public_html/.next
```

---

## 🧪 Adım 17: Test ve Doğrulama

### 17.1 Temel Testler

```bash
# 1. Node.js uygulamasının çalıştığını kontrol et
curl http://localhost:3000

# 2. PostgreSQL bağlantısını test et
psql -h localhost -U qrimuser -d qrimnet -c "SELECT COUNT(*) FROM venues;"

# 3. Domain üzerinden erişim testi
curl https://qrim.net

# 4. SSL sertifikasını kontrol et
curl -vI https://qrim.net 2>&1 | grep -i "SSL connection"

# 5. Response time testi
time curl -s -o /dev/null -w "%{time_total}\n" https://qrim.net
```

### 17.2 Tarayıcı Testleri

1. **Ana Sayfa**: `https://qrim.net`
2. **Admin Paneli**: `https://qrim.net/admin/login`
   - Kullanıcı adı: `admin`
   - Şifre: `admin123`
3. **Kullanıcı Girişi**: `https://qrim.net/login`
4. **Dashboard**: `https://qrim.net/dashboard`
5. **Örnek Menü**: `https://qrim.net/menu/molto-cafe`
6. **Blog**: `https://qrim.net/blog`
7. **Fiyatlandırma**: `https://qrim.net/pricing`

### 17.3 API Testleri

```bash
# Venues API
curl https://qrim.net/api/venues | jq

# Blog API
curl https://qrim.net/api/blog | jq

# Membership Plans API
curl https://qrim.net/api/membership-plans | jq

# Venue detayı
curl https://qrim.net/api/venue/molto-cafe | jq
```

### 17.4 Performans Testleri

```bash
# Apache Bench ile yük testi
ab -n 100 -c 10 https://qrim.net/

# Çıktıda şunları kontrol edin:
# - Requests per second
# - Time per request
# - Failed requests (0 olmalı)

# Daha detaylı test
ab -n 1000 -c 50 -g results.tsv https://qrim.net/
```

### 17.5 SSL Testi

**Online araçlar:**
1. https://www.ssllabs.com/ssltest/ → Domain'inizi girin
2. A veya A+ rating almalısınız

**Komut satırı:**
```bash
openssl s_client -connect qrim.net:443 -servername qrim.net
```

---

## 🛠️ Adım 18: Bakım ve Güncelleme

### 18.1 Uygulama Güncelleme

```bash
# 1. Mevcut durumu yedekle
cd ~
tar -czf backups/qrimnet-backup-$(date +%Y%m%d-%H%M%S).tar.gz public_html/

# 2. Proje dizinine git
cd ~/public_html

# 3. Git ile güncelleme (Git kullanıyorsanız)
git pull origin main

# 4. Bağımlılıkları güncelle
npm install

# 5. Yeniden build
npm run build

# 6. PM2 ile yeniden başlat
pm2 restart qrimnet

# 7. Logları kontrol et
pm2 logs qrimnet --lines 50
```

### 18.2 Veritabanı Yedekleme

**Manuel yedekleme:**
```bash
# Yedekleme dizini oluştur
mkdir -p ~/backups/database

# Veritabanını yedekle
pg_dump -h localhost -U qrimuser qrimnet > ~/backups/database/qrimnet-$(date +%Y%m%d-%H%M%S).sql

# Sıkıştırılmış yedek
pg_dump -h localhost -U qrimuser qrimnet | gzip > ~/backups/database/qrimnet-$(date +%Y%m%d-%H%M%S).sql.gz
```

**Otomatik yedekleme (Crontab):**
```bash
# Crontab düzenle
crontab -e

# Her gece saat 03:00'da yedek al
0 3 * * * pg_dump -h localhost -U qrimuser qrimnet | gzip > /home/qrimuser/backups/database/qrimnet-$(date +\%Y\%m\%d).sql.gz

# Eski yedekleri temizle (30 günden eski)
0 4 * * * find /home/qrimuser/backups/database -name "qrimnet-*.sql.gz" -mtime +30 -delete
```

**PostgreSQL şifresiz bağlantı için .pgpass:**
```bash
# .pgpass dosyası oluştur
nano ~/.pgpass

# Şu formatta ekle:
localhost:5432:qrimnet:qrimuser:QrimGucluSifre789!@#

# İzinleri ayarla
chmod 600 ~/.pgpass
```

### 18.3 Veritabanı Geri Yükleme

```bash
# SQL dosyasından geri yükle
psql -h localhost -U qrimuser -d qrimnet < ~/backups/database/qrimnet-20250107.sql

# Sıkıştırılmış dosyadan geri yükle
gunzip < ~/backups/database/qrimnet-20250107.sql.gz | psql -h localhost -U qrimuser -d qrimnet
```

### 18.4 cPanel Yedekleme (Tam Yedek)

**cPanel üzerinden:**
1. **cPanel** → **Files** → **Backup**
2. **Full Backup** → **Generate a Full Backup**
3. **Home Directory** seçin
4. Email adresinizi girin
5. **Generate Backup** tıklayın

**Komut satırı ile:**
```bash
# Tam hesap yedeği oluştur
/scripts/pkgacct qrimuser

# Yedek dosyası: /home/cpmove-qrimuser.tar.gz
```

### 18.5 Sistem Güncellemeleri (Root)

```bash
# CentOS/AlmaLinux/Rocky için
yum update -y

# Node.js güncelleme (gerekirse)
npm install -g npm@latest
npm install -g pm2@latest

# PostgreSQL yama güncellemeleri
yum update postgresql14*
```

---

## ❗ Sorun Giderme

### Hata 1: "Port 3000 already in use"

```bash
# Port 3000'i kullanan process'i bul
lsof -i :3000

# veya
netstat -tulpn | grep :3000

# Process ID'yi not alın ve sonlandırın
kill -9 PID_NUMARASI

# PM2'yi temizle ve yeniden başlat
pm2 delete qrimnet
pm2 start ecosystem.config.js
pm2 save
```

### Hata 2: "Database connection failed"

```bash
# PostgreSQL'in çalıştığını kontrol et
systemctl status postgresql-14

# Çalışmıyorsa başlat
systemctl start postgresql-14

# Bağlantı testi
psql -h localhost -U qrimuser -d qrimnet -c "SELECT 1;"

# pg_hba.conf ayarlarını kontrol et
cat /var/lib/pgsql/14/data/pg_hba.conf | grep qrimnet

# PostgreSQL loglarını kontrol et
tail -f /var/lib/pgsql/14/data/log/postgresql-*.log
```

### Hata 3: "502 Bad Gateway" veya "503 Service Unavailable"

```bash
# PM2 durumunu kontrol et
pm2 status

# Uygulama çalışmıyorsa başlat
pm2 start ecosystem.config.js

# PM2 loglarını kontrol et
pm2 logs qrimnet --lines 100

# Apache durumunu kontrol et (root olarak)
systemctl status httpd

# Apache'yi yeniden başlat
/scripts/restartsrv_httpd

# Apache error loglarını kontrol et
tail -f ~/logs/error_log

# .htaccess dosyasını kontrol et
cat ~/public_html/.htaccess
```

### Hata 4: "npm install fails"

```bash
# Node.js ve NPM versiyonunu kontrol et
node --version  # v20.x.x olmalı
npm --version

# npm cache temizle
npm cache clean --force

# node_modules ve package-lock.json'ı sil
cd ~/public_html
rm -rf node_modules package-lock.json

# Legacy peer deps ile yeniden kur
npm install --legacy-peer-deps

# Build hatası varsa
npm run build -- --verbose
```

### Hata 5: "Permission denied"

```bash
# Dosya sahipliğini düzelt
cd ~
chown -R qrimuser:qrimuser public_html/

# İzinleri düzelt
cd public_html
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# Upload klasörü için özel izin
chmod 777 public/uploads

# .env dosyası için özel izin
chmod 600 .env

# node_modules izinleri
chmod -R 755 node_modules
```

### Hata 6: "SSL Certificate Error"

```bash
# SSL sertifikasını kontrol et (cPanel'den)
# cPanel → SSL/TLS Status

# AutoSSL'i yeniden çalıştır
# cPanel → SSL/TLS Status → Run AutoSSL

# Manuel sertifika yenileme (root olarak)
/usr/local/cpanel/bin/autossl_check --user=qrimuser

# Apache SSL yapılandırmasını test et
apachectl configtest

# Apache'yi yeniden başlat
/scripts/restartsrv_httpd
```

### Hata 7: "Out of Memory"

```bash
# Bellek kullanımını kontrol et
free -h

# PM2 memory kullanımı
pm2 status

# Top komutu ile process'leri izle
top

# Swap alanı ekle (root olarak, yoksa)
dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# Kalıcı hale getir
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# PM2 max memory restart ayarı
# ecosystem.config.js'de:
max_memory_restart: '1G'
```

### Hata 8: "Build Failed"

```bash
# Build loglarını kontrol et
cd ~/public_html
npm run build 2>&1 | tee build.log

# Disk alanını kontrol et
df -h
quota -s

# Geçici dosyaları temizle
rm -rf .next
rm -rf node_modules/.cache

# Yeniden dene
npm install
npm run build
```

---

## 📝 Kurulum Kontrol Listesi

Kurulumunuzun eksiksiz olduğundan emin olmak için:

### Sunucu ve Yazılım
- [ ] Node.js 20.x kurulu ve çalışıyor
- [ ] NPM global paketleri kuruldu (PM2)
- [ ] PostgreSQL 14 kurulu ve çalışıyor
- [ ] PostgreSQL servisi otomatik başlıyor

### Veritabanı
- [ ] `qrimnet` veritabanı oluşturuldu
- [ ] `qrimuser` kullanıcısı oluşturuldu ve yetkilendirildi
- [ ] pg_hba.conf yapılandırıldı
- [ ] Bağlantı testi başarılı

### cPanel Hesabı
- [ ] cPanel hesabı oluşturuldu
- [ ] SSH erişimi aktif
- [ ] Domain DNS ayarları yapıldı
- [ ] Domain cPanel'e eklendi

### Proje Dosyaları
- [ ] Proje dosyaları `public_html` dizinine yüklendi
- [ ] Dosya izinleri doğru ayarlandı (755/644)
- [ ] `.env` dosyası oluşturuldu ve yapılandırıldı
- [ ] `.env` dosyası korunuyor (chmod 600)

### Bağımlılıklar ve Build
- [ ] `npm install` başarıyla tamamlandı
- [ ] Database schema çalıştırıldı (`lib/db-schema.sql`)
- [ ] Seed data eklendi (`npm run seed`)
- [ ] `npm run build` başarıyla tamamlandı
- [ ] `.next` klasörü oluştu

### PM2 ve Uygulama
- [ ] PM2 ile uygulama başlatıldı
- [ ] PM2 startup yapılandırıldı (otomatik başlatma)
- [ ] PM2 logları görüntülenebiliyor
- [ ] Uygulama `localhost:3000` üzerinden erişilebilir

### Apache ve Proxy
- [ ] `.htaccess` dosyası oluşturuldu
- [ ] Apache modülleri (proxy, rewrite) aktif
- [ ] Apache yapılandırması test edildi (`apachectl configtest`)
- [ ] Apache yeniden başlatıldı

### SSL ve Güvenlik
- [ ] SSL sertifikası kuruldu (AutoSSL veya Let's Encrypt)
- [ ] HTTPS yönlendirmesi aktif
- [ ] SSL A/A+ rating alıyor
- [ ] Firewall kuralları ayarlandı (CSF veya iptables)
- [ ] Fail2Ban kuruldu ve yapılandırıldı (opsiyonel)

### Test ve Doğrulama
- [ ] Ana sayfa açılıyor (`https://qrim.net`)
- [ ] Admin paneline giriş yapılabiliyor (`/admin/login`)
- [ ] Dashboard erişilebilir (`/dashboard`)
- [ ] Örnek menüler görüntülenebiliyor
- [ ] API endpoint'leri çalışıyor
- [ ] Upload klasörü yazılabilir (chmod 777)

### Monitoring ve Loglar
- [ ] PM2 logları görüntülenebiliyor
- [ ] PostgreSQL logları erişilebilir
- [ ] Apache logları kontrol edildi
- [ ] PM2 log rotation yapılandırıldı

### Yedekleme
- [ ] Veritabanı manuel yedekleme testi yapıldı
- [ ] Crontab ile otomatik yedekleme ayarlandı
- [ ] cPanel full backup yapılandırıldı
- [ ] .pgpass dosyası oluşturuldu

### Performans
- [ ] PostgreSQL performans ayarları yapıldı
- [ ] Apache performans ayarları yapıldı
- [ ] PM2 cluster mode yapılandırıldı (opsiyonel)
- [ ] Redis cache kuruldu (opsiyonel)

---

## 🎉 Kurulum Tamamlandı!

QRim.net uygulamanız artık cPanel hosting ortamında production modunda çalışıyor!

### 🔐 İlk Adımlar

**1. Admin Paneline Giriş:**
```
URL: https://qrim.net/admin/login
Kullanıcı: admin
Şifre: admin123
```
⚠️ **ÖNEMLİ:** İlk girişte admin şifresini mutlaka değiştirin!

**2. Admin Şifresini Değiştirme:**
- Admin paneline giriş yapın
- Sağ üst köşede profil ikonuna tıklayın
- "Profil Ayarları" → "Şifre Değiştir"
- Yeni güçlü bir şifre belirleyin

**3. Site Ayarlarını Yapılandırma:**
- Admin Panel → Ayarlar
- Site başlığı, açıklama güncelle
- Logo ve favicon yükle
- İletişim bilgilerini düzenle

**4. İlk Venue (Kafe/Restoran) Oluşturma:**
- Dashboard'a giriş yapın (`/dashboard`)
- "Yeni Mekan Ekle" butonuna tıklayın
- Bilgileri doldurun ve kaydedin
- Kategoriler ve ürünler ekleyin

**5. API Anahtarlarını Ayarlama:**

`.env` dosyasını düzenleyin:
```bash
nano ~/public_html/.env
```

Gerçek API anahtarlarınızı ekleyin:
- **Anthropic API** (AI özellikleri için)
- **Unsplash API** (Görsel arama için)
- **iyzico API** (Ödeme sistemi için)

Kaydedin ve PM2'yi yeniden başlatın:
```bash
pm2 restart qrimnet
```

**6. Test Siparişi Verme:**
- Menü sayfasına gidin (`/menu/VENUE_SLUG`)
- Ürün ekleyin ve sepete atın
- Sipariş verin ve takip edin

### 📊 Performans İzleme

**Günlük kontroller:**
```bash
# PM2 durumu
pm2 status

# Resource kullanımı
pm2 monit

# Son loglar
pm2 logs qrimnet --lines 50

# Disk kullanımı
df -h
quota -s
```

**Haftalık kontroller:**
```bash
# Veritabanı boyutu
psql -h localhost -U qrimuser -d qrimnet -c "SELECT pg_size_pretty(pg_database_size('qrimnet'));"

# Eski logları temizle
find ~/logs -name "*.log" -mtime +7 -delete

# Yedekleri kontrol et
ls -lh ~/backups/database/
```

### 🔄 Düzenli Bakım Takvimi

**Günlük:**
- [ ] PM2 loglarını kontrol et
- [ ] Hata mesajlarını incele
- [ ] Site erişilebilirliğini test et

**Haftalık:**
- [ ] Disk kullanımını kontrol et
- [ ] Eski logları temizle
- [ ] Yedekleme durumunu kontrol et
- [ ] PostgreSQL vakum işlemi

**Aylık:**
- [ ] Sistem güncellemelerini yap
- [ ] Node.js/NPM güncelle
- [ ] PostgreSQL güncelle
- [ ] Güvenlik yamalarını uygula

**3 Aylık:**
- [ ] SSL sertifikası durumunu kontrol et (otomatik yenilenmeli)
- [ ] Performans testleri yap
- [ ] Güvenlik denetimi yap
- [ ] Yedeklerden geri yükleme testi

### 📞 Destek ve Yardım

**Resmi Kaynaklar:**
- **QRim.net Dokümantasyon**: `https://qrim.net/docs`
- **Destek E-posta**: `destek@qrim.net`

**cPanel Kaynakları:**
- **cPanel Dokümantasyon**: https://docs.cpanel.net/
- **cPanel University**: https://university.cpanel.net/
- **cPanel Forum**: https://forums.cpanel.net/

**Topluluk Kaynakları:**
- **Next.js Docs**: https://nextjs.org/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/14/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **Apache Docs**: https://httpd.apache.org/docs/2.4/

**Sorun Giderme:**
- **Stack Overflow - cPanel**: https://stackoverflow.com/questions/tagged/cpanel
- **Stack Overflow - Next.js**: https://stackoverflow.com/questions/tagged/next.js
- **PostgreSQL Mailing Lists**: https://www.postgresql.org/list/

### 🚀 Gelişmiş Özellikler (Opsiyonel)

**1. CDN Entegrasyonu (Cloudflare):**
- Cloudflare hesabı oluşturun
- Domain'i Cloudflare'e ekleyin
- DNS kayıtlarını güncelleyin
- SSL/TLS ayarlarını yapın
- Cache kurallarını oluşturun

**2. Monitoring Araçları:**
- **PM2 Plus**: https://pm2.io/
- **UptimeRobot**: https://uptimerobot.com/
- **New Relic**: https://newrelic.com/

**3. Backup Çözümleri:**
- **cPanel Backup**: Otomatik yedekleme
- **JetBackup**: cPanel eklentisi
- **External Backup**: AWS S3, Google Drive

**4. Email Servisi:**
- cPanel Email hesapları oluşturun
- SMTP ayarlarını yapılandırın
- SPF, DKIM, DMARC kayıtları ekleyin

**5. Analytics:**
- Google Analytics entegrasyonu
- Matomo (self-hosted analytics)
- Hotjar (kullanıcı davranış analizi)

---

## 📚 Ek Bilgiler

### cPanel Özel Komutlar

```bash
# Domain bilgileri
uapi --user=qrimuser DomainInfo list_domains

# Disk kullanımı raporu
uapi --user=qrimuser Quota get_quota_info

# Email hesapları
uapi --user=qrimuser Email list_pops

# Subdomain listesi
uapi --user=qrimuser SubDomain list_subdomains

# Database listesi
uapi --user=qrimuser Mysql list_databases

# Cron job listesi
crontab -l
```

### WHM Yönetim Komutları (Root)

```bash
# Hesap listesi
/scripts/listaccts

# Hesap bilgileri
/scripts/wwwacct qrimuser

# Apache yeniden başlat
/scripts/restartsrv_httpd

# PostgreSQL yeniden başlat
systemctl restart postgresql-14

# cPanel güncelleme
/scripts/upcp

# Güvenlik güncellemeleri
/scripts/check_cpanel_rpms
```

### PostgreSQL Kullanışlı Komutlar

```bash
# Database boyutu
psql -h localhost -U qrimuser -d qrimnet -c "SELECT pg_size_pretty(pg_database_size('qrimnet'));"

# Tablo boyutları
psql -h localhost -U qrimuser -d qrimnet -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Aktif bağlantılar
psql -h localhost -U qrimuser -d qrimnet -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'qrimnet';"

# Vacuum işlemi
psql -h localhost -U qrimuser -d qrimnet -c "VACUUM ANALYZE;"

# Index yeniden oluştur
psql -h localhost -U qrimuser -d qrimnet -c "REINDEX DATABASE qrimnet;"
```

---

## 🏆 Best Practices

### Güvenlik
1. **Düzenli güncellemeler yapın** (Node.js, PostgreSQL, cPanel)
2. **Güçlü şifreler kullanın** (minimum 16 karakter, karışık)
3. **SSH key authentication** kullanın (şifre yerine)
4. **Fail2Ban** ile brute force koruması
5. **CSF Firewall** ile port koruması
6. **SSL/TLS** her zaman aktif
7. **API anahtarlarını** .env'de saklayın

### Performans
1. **PM2 cluster mode** kullanın (çoklu CPU)
2. **PostgreSQL** performans ayarlarını optimize edin
3. **Redis cache** kullanın (opsiyonel)
4. **CDN** kullanın (Cloudflare vb.)
5. **Image optimization** yapın
6. **Gzip compression** aktif
7. **Database indexing** düzenli yapın

### Yedekleme
1. **Günlük veritabanı yedekleri** (otomatik)
2. **Haftalık tam yedekler** (cPanel backup)
3. **Yedekleri farklı lokasyonda** saklayın
4. **Geri yükleme testleri** yapın
5. **30 günlük retention policy**

### Monitoring
1. **PM2 monitoring** sürekli aktif
2. **UptimeRobot** ile uptime izleme
3. **Log analizi** düzenli yapın
4. **Disk kullanımı** takibi
5. **Performance metrics** takibi

---

**Son Güncelleme:** 7 Ocak 2025  
**Versiyon:** 1.0.0  
**Platform:** cPanel/WHM  
**Yazar:** QRim.net Ekibi

**Not:** Bu dokümantasyon cPanel/WHM versiyonlarına göre farklılık gösterebilir. En güncel bilgiler için resmi cPanel dokümantasyonunu kontrol edin.

**Lisans:** Bu rehber MIT lisansı altında lisanslanmıştır.
