
# QRim.net - DirectAdmin Panel Kurulum Rehberi

## 📋 Gereksinimler

### Sunucu Gereksinimleri
- **Node.js**: 20.x veya üzeri
- **PostgreSQL**: 14.x veya üzeri
- **RAM**: Minimum 2GB (Önerilen 4GB)
- **Disk Alanı**: Minimum 10GB
- **İşletim Sistemi**: CentOS 7/8, AlmaLinux 8, Rocky Linux 8, Ubuntu 20.04/22.04

### DirectAdmin Gereksinimleri
- **DirectAdmin**: 1.61.0 veya üzeri
- **SSH Erişimi**: Root veya sudo yetkili kullanıcı
- **Domain**: Aktif ve DNS kayıtları yapılandırılmış

---

## 🚀 Adım 1: Sunucu Hazırlığı

### 1.1 SSH ile Sunucuya Bağlanma
```bash
ssh root@sunucunuzun-ip-adresi
# veya
ssh kullanici@sunucunuzun-ip-adresi
```

### 1.2 Sistem Güncellemesi
```bash
# CentOS/AlmaLinux/Rocky Linux için
sudo yum update -y

# Ubuntu/Debian için
sudo apt update && sudo apt upgrade -y
```

### 1.3 Gerekli Paketlerin Kurulumu
```bash
# CentOS/AlmaLinux/Rocky Linux için
sudo yum install -y curl wget git unzip

# Ubuntu/Debian için
sudo apt install -y curl wget git unzip
```

---

## 🔧 Adım 2: Node.js Kurulumu

### 2.1 NodeSource Repository Ekleme ve Node.js 20.x Kurulumu

**CentOS/AlmaLinux/Rocky Linux için:**
```bash
# NodeSource repository'sini ekle
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Node.js'i kur
sudo yum install -y nodejs

# Versiyonu kontrol et
node --version  # v20.x.x olmalı
npm --version   # 10.x.x olmalı
```

**Ubuntu/Debian için:**
```bash
# NodeSource repository'sini ekle
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js'i kur
sudo apt install -y nodejs

# Versiyonu kontrol et
node --version  # v20.x.x olmalı
npm --version   # 10.x.x olmalı
```

### 2.2 Global NPM Paketlerini Kurma
```bash
# PM2 process manager'ı kur
sudo npm install -g pm2

# PM2 versiyonunu kontrol et
pm2 --version
```

---

## 🗄️ Adım 3: PostgreSQL Kurulumu ve Yapılandırma

### 3.1 PostgreSQL Kurulumu

**CentOS/AlmaLinux/Rocky Linux için:**
```bash
# PostgreSQL repository ekle
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Varsayılan PostgreSQL modülünü devre dışı bırak
sudo dnf -qy module disable postgresql

# PostgreSQL 14 kur
sudo dnf install -y postgresql14-server postgresql14-contrib

# Veritabanını başlat
sudo /usr/pgsql-14/bin/postgresql-14-setup initdb

# Servisi başlat ve otomatik başlatmayı aktif et
sudo systemctl enable postgresql-14
sudo systemctl start postgresql-14

# Durumu kontrol et
sudo systemctl status postgresql-14
```

**Ubuntu/Debian için:**
```bash
# PostgreSQL repository ekle
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Paket listesini güncelle
sudo apt update

# PostgreSQL 14 kur
sudo apt install -y postgresql-14 postgresql-contrib-14

# Servis otomatik başlar, durumu kontrol et
sudo systemctl status postgresql
```

### 3.2 PostgreSQL Şifre Ayarlama
```bash
# PostgreSQL kullanıcısına geç
sudo -u postgres psql

# Postgres kullanıcısı için şifre belirle
ALTER USER postgres WITH PASSWORD 'GucluPostgresSifresi123!';

# Çıkış yap
\q
```

### 3.3 Veritabanı ve Kullanıcı Oluşturma
```bash
# PostgreSQL'e giriş yap
sudo -u postgres psql
```

**PostgreSQL komutları:**
```sql
-- QRim.net veritabanını oluştur
CREATE DATABASE qrimnet;

-- QRim.net kullanıcısını oluştur
CREATE USER qrimuser WITH PASSWORD 'QrimGucluSifre456!@#';

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

-- Çıkış yap
\q
```

### 3.4 PostgreSQL Kimlik Doğrulama Ayarları

**pg_hba.conf dosyasını düzenle:**
```bash
# CentOS/AlmaLinux/Rocky için
sudo nano /var/lib/pgsql/14/data/pg_hba.conf

# Ubuntu/Debian için
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

**Dosyanın sonuna şu satırları ekle:**
```
# QRim.net için local bağlantı
local   qrimnet         qrimuser                                md5
host    qrimnet         qrimuser        127.0.0.1/32            md5
host    qrimnet         qrimuser        ::1/128                 md5
```

**PostgreSQL'i yeniden başlat:**
```bash
# CentOS/AlmaLinux/Rocky için
sudo systemctl restart postgresql-14

# Ubuntu/Debian için
sudo systemctl restart postgresql
```

### 3.5 Bağlantı Testi
```bash
# Veritabanı bağlantısını test et
psql -h localhost -U qrimuser -d qrimnet -c "SELECT version();"

# Şifre sorduğunda: QrimGucluSifre456!@#
```

---

## 📁 Adım 4: DirectAdmin'de Domain Oluşturma

### 4.1 DirectAdmin Panel Girişi
1. Tarayıcıda DirectAdmin adresinize gidin: `https://sunucunuzun-ip-adresi:2222`
2. Admin kullanıcı adı ve şifre ile giriş yapın

### 4.2 Kullanıcı Oluşturma (İsteğe Bağlı)
1. **Account Manager** → **Create Account** tıklayın
2. Gerekli bilgileri doldurun:
   - **Username**: qrimuser (veya istediğiniz kullanıcı adı)
   - **Email**: admin@qrim.net
   - **Password**: Güçlü bir şifre belirleyin
   - **Domain**: qrim.net
   - **Package**: Uygun bir paket seçin
3. **Create** butonuna tıklayın

### 4.3 Domain Ayarları
1. Kullanıcı paneline giriş yapın veya geçiş yapın
2. **Domain Setup** → **Domain Pointers** kontrol edin
3. DNS kayıtlarının doğru olduğundan emin olun

---

## 📦 Adım 5: Proje Dosyalarının Yüklenmesi

### 5.1 Domain Klasörüne Gitme
```bash
# DirectAdmin'de varsayılan web dizini
cd /home/qrimuser/domains/qrim.net/public_html

# veya kendi kullanıcı adınıza göre:
cd /home/KULLANICI_ADI/domains/DOMAIN_ADI/public_html
```

### 5.2 Mevcut Dosyaları Yedekleme ve Temizleme
```bash
# Mevcut dosyaları yedekle
mkdir -p ~/backups
tar -czf ~/backups/public_html-backup-$(date +%Y%m%d).tar.gz .

# public_html'i temizle (dikkatli olun!)
rm -rf *
rm -rf .[!.]*
```

### 5.3 Proje Dosyalarını Yükleme

**Yöntem 1: Git ile (Önerilen)**
```bash
# Projeyi klonla (GitHub/GitLab'da ise)
git clone https://github.com/KULLANICI_ADI/qrimnet.git .

# Veya zip dosyasından
wget https://siteadresiniz.com/qrimnet.zip
unzip qrimnet.zip
mv qrimnet/* .
mv qrimnet/.* . 2>/dev/null
rm -rf qrimnet qrimnet.zip
```

**Yöntem 2: FTP/SFTP ile**
1. FileZilla veya WinSCP kullanın
2. SFTP ile bağlanın:
   - **Host**: sunucunuzun-ip-adresi
   - **Port**: 22
   - **Kullanıcı**: qrimuser (DirectAdmin kullanıcı adınız)
   - **Şifre**: DirectAdmin şifreniz
3. Tüm proje dosyalarını `/home/qrimuser/domains/qrim.net/public_html` dizinine yükleyin

### 5.4 Dosya İzinlerini Ayarlama
```bash
# Doğru kullanıcıya sahiplik ver (DirectAdmin kullanıcı adınızı kullanın)
cd /home/qrimuser/domains/qrim.net/public_html
sudo chown -R qrimuser:qrimuser .

# Dizin izinleri
find . -type d -exec chmod 755 {} \;

# Dosya izinleri
find . -type f -exec chmod 644 {} \;

# Upload klasörü için yazma izni
mkdir -p public/uploads
chmod 777 public/uploads

# .env dosyası için özel izin (daha sonra oluşturulacak)
touch .env
chmod 600 .env
```

---

## ⚙️ Adım 6: Ortam Değişkenlerini Ayarlama

### 6.1 .env Dosyası Oluşturma
```bash
cd /home/qrimuser/domains/qrim.net/public_html
nano .env
```

### 6.2 .env İçeriği
```env
# Veritabanı Bağlantısı
DATABASE_URL=postgresql://qrimuser:QrimGucluSifre456!@#@localhost:5432/qrimnet

# JWT Gizli Anahtarı (32+ karakter, rastgele üretin)
JWT_SECRET=super-gizli-jwt-anahtari-buraya-min-32-karakter-rastgele-string-yazin

# Anthropic Claude API (AI özellikleri için)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx

# Unsplash API (Görsel arama - opsiyonel)
UNSPLASH_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxx

# iyzico Ödeme Sistemi (Türkiye)
IYZICO_API_KEY=sandbox-xxxxxxxxxxxxx
IYZICO_SECRET_KEY=sandbox-xxxxxxxxxxxxx
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# Ortam Değişkeni
NODE_ENV=production

# Site URL (kendi domaininiz)
NEXT_PUBLIC_SITE_URL=https://qrim.net
```

**Dosyayı kaydet:** `Ctrl+O` → `Enter` → `Ctrl+X`

### 6.3 .env Dosyasını Koruma
```bash
chmod 600 .env
chown qrimuser:qrimuser .env
```

---

## 📚 Adım 7: Bağımlılıkların Kurulumu

### 7.1 Proje Dizinine Git
```bash
cd /home/qrimuser/domains/qrim.net/public_html
```

### 7.2 NPM Paketlerini Kurma
```bash
# Önce npm cache temizle
npm cache clean --force

# Paketleri kur (5-10 dakika sürebilir)
npm install

# Kurulum sorunları varsa:
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 7.3 Build İzinleri
```bash
# node_modules klasörü için izinler
chmod -R 755 node_modules
```

---

## 🏗️ Adım 8: Veritabanı Şemasını Oluşturma

### 8.1 Schema SQL Dosyasını Çalıştırma
```bash
cd /home/qrimuser/domains/qrim.net/public_html

# PostgreSQL'e bağlanıp schema'yı çalıştır
psql -h localhost -U qrimuser -d qrimnet -f lib/db-schema.sql

# Şifre sorduğunda: QrimGucluSifre456!@#
```

### 8.2 Seed Data ile Başlangıç Verilerini Ekleme
```bash
# Seed script'i çalıştır
npm run seed
```

**Bu işlem şunları yapar:**
- Admin kullanıcısı oluşturur (`admin` / `admin123`)
- 2 örnek venue (kafe) ekler
- Kategoriler ve örnek ürünler ekler
- Üyelik planlarını oluşturur

### 8.3 Veritabanı Kontrolü
```bash
# Tabloları kontrol et
psql -h localhost -U qrimuser -d qrimnet -c "\dt"

# Venue sayısını kontrol et
psql -h localhost -U qrimuser -d qrimnet -c "SELECT COUNT(*) FROM venues;"
```

---

## 🔨 Adım 9: Production Build

### 9.1 Next.js Build
```bash
cd /home/qrimuser/domains/qrim.net/public_html

# Production build oluştur (5-10 dakika sürebilir)
npm run build
```

**Build başarılı olmalı ve şu mesajı görmelisiniz:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### 9.2 Build Kontrolü
```bash
# .next klasörünün oluştuğunu kontrol et
ls -la .next

# Build boyutunu kontrol et
du -sh .next
```

---

## 🚀 Adım 10: PM2 ile Uygulama Başlatma

### 10.1 PM2 Yapılandırması

**ecosystem.config.js oluştur:**
```bash
cd /home/qrimuser/domains/qrim.net/public_html
nano ecosystem.config.js
```

**Dosya içeriği:**
```javascript
module.exports = {
  apps: [{
    name: 'qrimnet',
    script: 'npm',
    args: 'start',
    cwd: '/home/qrimuser/domains/qrim.net/public_html',
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

### 10.2 Log Klasörü Oluşturma
```bash
mkdir -p /home/qrimuser/logs
chmod 755 /home/qrimuser/logs
```

### 10.3 PM2 ile Uygulamayı Başlatma
```bash
cd /home/qrimuser/domains/qrim.net/public_html

# PM2 ile başlat
pm2 start ecosystem.config.js

# Durumu kontrol et
pm2 status

# Logları görüntüle
pm2 logs qrimnet --lines 50
```

### 10.4 PM2 Otomatik Başlatma (Sunucu Yeniden Başlatıldığında)
```bash
# Startup script oluştur
pm2 startup

# Komutu root olarak çalıştırın (çıktıda gösterilen komutu)
# Örnek: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u qrimuser --hp /home/qrimuser

# Mevcut konfigürasyonu kaydet
pm2 save
```

### 10.5 PM2 Komutları
```bash
# Durumu görüntüle
pm2 status

# Logları izle
pm2 logs qrimnet

# Yeniden başlat
pm2 restart qrimnet

# Durdur
pm2 stop qrimnet

# Sil
pm2 delete qrimnet

# Tüm process'leri göster
pm2 list
```

---

## 🌐 Adım 11: Apache Reverse Proxy Yapılandırması

DirectAdmin varsayılan olarak Apache kullanır. Node.js uygulamasını Apache üzerinden çalıştırmak için reverse proxy yapılandırması gereklidir.

### 11.1 Apache Modüllerini Aktif Etme

**mod_proxy ve mod_proxy_http modüllerini kontrol et:**
```bash
# CentOS/AlmaLinux/Rocky için
sudo apachectl -M | grep proxy

# Ubuntu/Debian için
sudo apache2ctl -M | grep proxy
```

**Modüller yoksa aktif et:**
```bash
# CentOS/AlmaLinux/Rocky için
sudo yum install -y mod_proxy_html

# Ubuntu/Debian için
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo systemctl restart apache2
```

### 11.2 DirectAdmin'de Custom httpd.conf Ayarları

**Yöntem 1: DirectAdmin Panel Üzerinden**

1. DirectAdmin paneline giriş yapın
2. **Advanced Features** → **Custom HTTPD Configurations** tıklayın
3. Domain'inizi seçin (`qrim.net`)
4. Aşağıdaki konfigürasyonu ekleyin:

```apache
# QRim.net - Node.js Reverse Proxy

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
    
    # Timeout ayarları
    ProxyTimeout 300
    
    # Static dosyalar için cache
    <LocationMatch "^/_next/static/">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </LocationMatch>
</IfModule>

# Upload klasörü için doğrudan erişim
Alias /uploads /home/qrimuser/domains/qrim.net/public_html/public/uploads
<Directory /home/qrimuser/domains/qrim.net/public_html/public/uploads>
    Options -Indexes +FollowSymLinks
    AllowOverride None
    Require all granted
    
    <IfModule mod_headers.c>
        Header set Cache-Control "public, max-age=2592000"
    </IfModule>
</Directory>
```

5. **Save** butonuna tıklayın
6. Apache'yi yeniden başlatın

**Yöntem 2: SSH ile Manuel Yapılandırma**

```bash
# Custom httpd.conf dosyasını oluştur
sudo mkdir -p /usr/local/directadmin/data/users/qrimuser/httpd.conf

# Domain için özel yapılandırma
sudo nano /usr/local/directadmin/data/users/qrimuser/httpd.conf/qrim.net.conf
```

**Yukarıdaki Apache yapılandırmasını ekleyin, kaydedin.**

### 11.3 Apache'yi Yeniden Başlatma
```bash
# DirectAdmin ile Apache restart
sudo /usr/local/directadmin/custombuild/build rewrite_confs
sudo systemctl restart httpd

# veya
sudo service httpd restart
```

### 11.4 Yapılandırmayı Test Etme
```bash
# Apache config test
sudo apachectl configtest

# Syntax OK çıktısı almalısınız
```

---

## 🔒 Adım 12: SSL Sertifikası (Let's Encrypt)

### 12.1 DirectAdmin Panel ile SSL Kurulumu

1. DirectAdmin paneline giriş yapın
2. **Advanced Features** → **SSL Certificates** tıklayın
3. **Free & automatic certificate from Let's Encrypt** seçin
4. Domain'inizi seçin (`qrim.net`)
5. **www subdomain** checkbox'ını işaretleyin (isteğe bağlı)
6. **Save** butonuna tıklayın

### 12.2 Manuel Let's Encrypt Kurulumu (Alternatif)

```bash
# Certbot kur
# CentOS/AlmaLinux/Rocky için
sudo yum install -y certbot python3-certbot-apache

# Ubuntu/Debian için
sudo apt install -y certbot python3-certbot-apache

# SSL sertifikası al
sudo certbot --apache -d qrim.net -d www.qrim.net

# E-posta adresinizi girin ve talimatları takip edin
```

### 12.3 Otomatik Yenileme
```bash
# Certbot otomatik yenilemeyi test et
sudo certbot renew --dry-run

# Crontab'a otomatik yenileme ekle (DirectAdmin genelde bunu yapar)
sudo crontab -e

# Şu satırı ekleyin (günde 2 kez kontrol eder)
0 */12 * * * certbot renew --quiet
```

### 12.4 HTTPS Yönlendirme

DirectAdmin genellikle bunu otomatik yapar. Manuel kontrol için:

```bash
# .htaccess dosyasını kontrol et
nano /home/qrimuser/domains/qrim.net/public_html/.htaccess
```

**HTTP'den HTTPS'e yönlendirme (gerekirse ekleyin):**
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 🔥 Adım 13: Firewall ve Güvenlik

### 13.1 Firewall Kuralları (Firewalld)

**CentOS/AlmaLinux/Rocky için:**
```bash
# Firewalld durumunu kontrol et
sudo systemctl status firewalld

# HTTP ve HTTPS portlarını aç
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# PostgreSQL portunu sadece localhost'a kısıtla (zaten local)
# Port 5432 varsayılan olarak kapalı olmalı

# Firewall'u yeniden yükle
sudo firewall-cmd --reload

# Kuralları listele
sudo firewall-cmd --list-all
```

### 13.2 UFW Firewall (Ubuntu/Debian)

```bash
# UFW durumunu kontrol et
sudo ufw status

# HTTP ve HTTPS'e izin ver
sudo ufw allow 'Apache Full'

# SSH portunu koru
sudo ufw allow 22/tcp

# UFW'yi aktif et
sudo ufw enable

# Durumu kontrol et
sudo ufw status verbose
```

### 13.3 PostgreSQL Güvenlik

```bash
# pg_hba.conf dosyasını kontrol et
# CentOS/AlmaLinux/Rocky için
sudo nano /var/lib/pgsql/14/data/pg_hba.conf

# Ubuntu/Debian için
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

**Sadece local bağlantılara izin verildiğinden emin olun:**
```
# Sadece localhost bağlantıları
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

### 13.4 Fail2Ban Kurulumu (Opsiyonel ama Önerilen)

```bash
# Fail2Ban kur
# CentOS/AlmaLinux/Rocky için
sudo yum install -y fail2ban

# Ubuntu/Debian için
sudo apt install -y fail2ban

# Servisi başlat
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Durumu kontrol et
sudo fail2ban-client status
```

---

## 📊 Adım 14: Performans Optimizasyonu

### 14.1 PM2 Cluster Mode (Çoklu CPU Kullanımı)

**ecosystem.config.js dosyasını düzenle:**
```bash
nano /home/qrimuser/domains/qrim.net/public_html/ecosystem.config.js
```

**instances değerini değiştir:**
```javascript
module.exports = {
  apps: [{
    name: 'qrimnet',
    script: 'npm',
    args: 'start',
    instances: 2, // veya 'max' (tüm CPU çekirdeklerini kullanır)
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

### 14.2 PostgreSQL Performans Ayarları

```bash
# PostgreSQL config dosyasını düzenle
# CentOS/AlmaLinux/Rocky için
sudo nano /var/lib/pgsql/14/data/postgresql.conf

# Ubuntu/Debian için
sudo nano /etc/postgresql/14/main/postgresql.conf
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

# Planner
default_statistics_target = 100
```

**PostgreSQL'i yeniden başlat:**
```bash
# CentOS/AlmaLinux/Rocky için
sudo systemctl restart postgresql-14

# Ubuntu/Debian için
sudo systemctl restart postgresql
```

### 14.3 Apache Performans Ayarları

```bash
# Apache config dosyasını düzenle
sudo nano /etc/httpd/conf/httpd.conf
```

**Önerilen ayarlar:**
```apache
# Timeout ayarları
Timeout 300
KeepAlive On
MaxKeepAliveRequests 100
KeepAliveTimeout 5

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

---

## 🔍 Adım 15: Monitoring ve Loglar

### 15.1 PM2 Monitoring
```bash
# Gerçek zamanlı monitoring
pm2 monit

# CPU ve Memory kullanımı
pm2 status

# Detaylı bilgi
pm2 show qrimnet

# Log dosyalarını görüntüle
pm2 logs qrimnet

# Son 100 satırı göster
pm2 logs qrimnet --lines 100

# Error logları
pm2 logs qrimnet --err
```

### 15.2 Log Dosyaları Konumları
```bash
# Application logları
tail -f /home/qrimuser/logs/qrimnet-out.log
tail -f /home/qrimuser/logs/qrimnet-error.log

# PostgreSQL logları
# CentOS/AlmaLinux/Rocky için
sudo tail -f /var/lib/pgsql/14/data/log/postgresql-*.log

# Ubuntu/Debian için
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Apache logları
sudo tail -f /var/log/httpd/error_log
sudo tail -f /var/log/httpd/access_log
# veya Ubuntu/Debian için
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log
```

### 15.3 PM2 Log Rotation
```bash
# PM2 log rotation modülünü kur
pm2 install pm2-logrotate

# Ayarları yapılandır
pm2 set pm2-logrotate:max_size 10M      # Max log boyutu
pm2 set pm2-logrotate:retain 7           # 7 gün saklansın
pm2 set pm2-logrotate:compress true      # Sıkıştır
pm2 set pm2-logrotate:workerInterval 30  # 30 saniyede kontrol et

# Ayarları görüntüle
pm2 conf pm2-logrotate
```

### 15.4 Disk Kullanımı İzleme
```bash
# Genel disk kullanımı
df -h

# Proje klasörü boyutu
du -sh /home/qrimuser/domains/qrim.net/public_html

# En büyük klasörleri bul
du -h /home/qrimuser/domains/qrim.net/public_html | sort -rh | head -20
```

---

## 🧪 Adım 16: Test ve Doğrulama

### 16.1 Temel Testler
```bash
# 1. Node.js uygulamasının çalıştığını kontrol et
curl http://localhost:3000

# 2. PostgreSQL bağlantısını test et
psql -h localhost -U qrimuser -d qrimnet -c "SELECT COUNT(*) FROM venues;"

# 3. Domain üzerinden erişim testi
curl https://qrim.net

# 4. SSL sertifikasını kontrol et
curl -vI https://qrim.net 2>&1 | grep -i "SSL connection"
```

### 16.2 Tarayıcı Testleri
1. Ana sayfa: `https://qrim.net`
2. Admin paneli: `https://qrim.net/admin/login`
   - Kullanıcı adı: `admin`
   - Şifre: `admin123`
3. Kullanıcı girişi: `https://qrim.net/login`
4. Örnek menü: `https://qrim.net/menu/molto-cafe`
5. Blog: `https://qrim.net/blog`

### 16.3 API Testleri
```bash
# Venues API
curl https://qrim.net/api/venues | jq

# Blog API
curl https://qrim.net/api/blog | jq

# Membership Plans API
curl https://qrim.net/api/membership-plans | jq
```

### 16.4 Performans Testleri
```bash
# Apache Bench ile yük testi (100 istek, 10 eşzamanlı)
ab -n 100 -c 10 https://qrim.net/

# cURL ile response time
time curl -s -o /dev/null -w "%{time_total}\n" https://qrim.net
```

---

## 🛠️ Adım 17: Bakım ve Güncelleme

### 17.1 Uygulama Güncelleme
```bash
# 1. Mevcut durumu yedekle
cd /home/qrimuser/domains/qrim.net
tar -czf ~/backups/qrimnet-backup-$(date +%Y%m%d-%H%M%S).tar.gz public_html/

# 2. Proje dizinine git
cd public_html

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

### 17.2 Veritabanı Yedekleme

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

# Her gece saat 03:00'da yedek al (şifreyi .pgpass ile ayarlayın)
0 3 * * * pg_dump -h localhost -U qrimuser qrimnet | gzip > /home/qrimuser/backups/database/qrimnet-$(date +\%Y\%m\%d).sql.gz

# Eski yedekleri temizle (30 günden eski)
0 4 * * * find /home/qrimuser/backups/database -name "qrimnet-*.sql.gz" -mtime +30 -delete
```

**PostgreSQL şifresiz bağlantı için .pgpass:**
```bash
# .pgpass dosyası oluştur
nano ~/.pgpass

# Şu formatta ekle:
localhost:5432:qrimnet:qrimuser:QrimGucluSifre456!@#

# İzinleri ayarla
chmod 600 ~/.pgpass
```

### 17.3 Veritabanı Geri Yükleme
```bash
# SQL dosyasından geri yükle
psql -h localhost -U qrimuser -d qrimnet < ~/backups/database/qrimnet-20250106.sql

# Sıkıştırılmış dosyadan geri yükle
gunzip < ~/backups/database/qrimnet-20250106.sql.gz | psql -h localhost -U qrimuser -d qrimnet
```

### 17.4 Sistem Güncellemeleri
```bash
# CentOS/AlmaLinux/Rocky için
sudo yum update -y

# Ubuntu/Debian için
sudo apt update && sudo apt upgrade -y

# Node.js güncelleme (gerekirse)
# NodeSource repository'den en son sürümü al
```

---

## ❗ Sorun Giderme

### Hata 1: "Port 3000 already in use"
```bash
# Port 3000'i kullanan process'i bul
sudo lsof -i :3000

# Process ID'yi not alın ve sonlandırın
sudo kill -9 PID_NUMARASI

# PM2'yi temizle ve yeniden başlat
pm2 delete qrimnet
pm2 start ecosystem.config.js
pm2 save
```

### Hata 2: "Database connection failed"
```bash
# PostgreSQL'in çalıştığını kontrol et
sudo systemctl status postgresql-14  # CentOS/AlmaLinux/Rocky
sudo systemctl status postgresql     # Ubuntu/Debian

# Servisi başlat
sudo systemctl start postgresql-14   # CentOS/AlmaLinux/Rocky
sudo systemctl start postgresql      # Ubuntu/Debian

# Bağlantı testi
psql -h localhost -U qrimuser -d qrimnet -c "SELECT 1;"

# pg_hba.conf ayarlarını kontrol et
# CentOS/AlmaLinux/Rocky için
sudo cat /var/lib/pgsql/14/data/pg_hba.conf | grep qrimnet

# Ubuntu/Debian için
sudo cat /etc/postgresql/14/main/pg_hba.conf | grep qrimnet
```

### Hata 3: "502 Bad Gateway" veya "503 Service Unavailable"
```bash
# PM2 durumunu kontrol et
pm2 status

# Uygulama çalışmıyorsa başlat
pm2 start ecosystem.config.js

# Apache durumunu kontrol et
sudo systemctl status httpd          # CentOS/AlmaLinux/Rocky
sudo systemctl status apache2        # Ubuntu/Debian

# Apache loglarını kontrol et
sudo tail -f /var/log/httpd/error_log
sudo tail -f /var/log/apache2/error.log

# Apache'yi yeniden başlat
sudo systemctl restart httpd         # CentOS/AlmaLinux/Rocky
sudo systemctl restart apache2       # Ubuntu/Debian
```

### Hata 4: "npm install fails"
```bash
# Node.js ve NPM versiyonunu kontrol et
node --version  # v20.x.x olmalı
npm --version

# npm cache temizle
npm cache clean --force

# node_modules ve package-lock.json'ı sil
cd /home/qrimuser/domains/qrim.net/public_html
rm -rf node_modules package-lock.json

# Legacy peer deps ile yeniden kur
npm install --legacy-peer-deps

# Build hatası varsa
npm run build -- --verbose
```

### Hata 5: "Permission denied"
```bash
# Dosya sahipliğini düzelt
cd /home/qrimuser/domains/qrim.net
sudo chown -R qrimuser:qrimuser public_html/

# İzinleri düzelt
cd public_html
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

# Upload klasörü için özel izin
chmod 777 public/uploads

# .env dosyası için özel izin
chmod 600 .env
```

### Hata 6: "SSL Certificate Error"
```bash
# SSL sertifikasını kontrol et
sudo certbot certificates

# Sertifikayı yenile
sudo certbot renew

# Apache SSL yapılandırmasını test et
sudo apachectl configtest

# Apache'yi yeniden başlat
sudo systemctl restart httpd         # CentOS/AlmaLinux/Rocky
sudo systemctl restart apache2       # Ubuntu/Debian
```

### Hata 7: "Out of Memory"
```bash
# Bellek kullanımını kontrol et
free -h

# PM2 memory kullanımı
pm2 status

# Swap alanı ekle (yoksa)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Kalıcı hale getir
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# PM2 max memory restart ayarı (ecosystem.config.js'de)
max_memory_restart: '1G'
```

---

## 📝 Kurulum Kontrol Listesi

Kurulumunuzun eksiksiz olduğundan emin olmak için:

- [ ] Node.js 20.x kurulu ve çalışıyor
- [ ] PostgreSQL 14 kurulu ve çalışıyor
- [ ] Veritabanı (`qrimnet`) ve kullanıcı (`qrimuser`) oluşturuldu
- [ ] DirectAdmin'de domain yapılandırıldı
- [ ] Proje dosyaları `/home/KULLANICI/domains/DOMAIN/public_html` dizinine yüklendi
- [ ] `.env` dosyası oluşturuldu ve yapılandırıldı
- [ ] `npm install` başarıyla tamamlandı
- [ ] Database schema çalıştırıldı (`lib/db-schema.sql`)
- [ ] Seed data eklendi (`npm run seed`)
- [ ] `npm run build` başarıyla tamamlandı
- [ ] PM2 ile uygulama başlatıldı ve çalışıyor
- [ ] PM2 startup (otomatik başlatma) yapılandırıldı
- [ ] Apache reverse proxy ayarlandı
- [ ] SSL sertifikası (Let's Encrypt) kuruldu
- [ ] HTTPS yönlendirmesi aktif
- [ ] Firewall kuralları ayarlandı
- [ ] Domain üzerinden siteye erişilebiliyor
- [ ] Admin paneline giriş yapılabiliyor (`/admin/login`)
- [ ] Kullanıcı paneline erişilebiliyor (`/dashboard`)
- [ ] Örnek menüler görüntülenebiliyor
- [ ] Upload klasörü yazılabilir (777 izni)
- [ ] Log dosyaları kontrol edildi
- [ ] Veritabanı yedekleme sistemi kuruldu

---

## 🎉 Kurulum Tamamlandı!

QRim.net uygulamanız artık DirectAdmin panelinde production ortamında çalışıyor!

### 🔐 İlk Adımlar:

1. **Admin Paneline Giriş:**
   - URL: `https://qrim.net/admin/login`
   - Kullanıcı adı: `admin`
   - Şifre: `admin123`
   - ⚠️ **ÖNEMLİ:** İlk girişte şifrenizi mutlaka değiştirin!

2. **Kullanıcı Paneline Giriş:**
   - URL: `https://qrim.net/dashboard`
   - Kayıt ol veya giriş yap

3. **İlk Venue (Kafe) Oluşturma:**
   - Dashboard'a giriş yapın
   - "Yeni Kafe Ekle" butonuna tıklayın
   - Bilgileri doldurun ve kaydedin

4. **API Anahtarlarını Ayarlama:**
   - `.env` dosyasında API anahtarlarınızı güncelleyin:
     - `ANTHROPIC_API_KEY` (AI özellikleri için)
     - `UNSPLASH_ACCESS_KEY` (Görsel arama için)
     - `IYZICO_API_KEY` ve `IYZICO_SECRET_KEY` (Ödeme için)

5. **Site Ayarlarını Yapılandırma:**
   - Admin panelinden site ayarlarını düzenleyin
   - Logo ve favicon yükleyin
   - KVKK ve gizlilik metinlerini gözden geçirin

### 📊 Performans İzleme:

```bash
# PM2 monitoring
pm2 monit

# Resource kullanımı
pm2 status

# Logları izle
pm2 logs qrimnet

# Veritabanı boyutu
psql -h localhost -U qrimuser -d qrimnet -c "SELECT pg_size_pretty(pg_database_size('qrimnet'));"
```

### 🔄 Düzenli Bakım:

- **Günlük:** PM2 loglarını kontrol edin
- **Haftalık:** Disk kullanımını kontrol edin, eski logları temizleyin
- **Aylık:** Sistem güncellemelerini yapın, yedekleri kontrol edin
- **3 Aylık:** SSL sertifikası yenileme durumunu kontrol edin (otomatik olmalı)

### 📞 Destek ve Yardım:

- **Dokümantasyon:** `https://qrim.net/docs`
- **E-posta:** destek@qrim.net
- **DirectAdmin Desteği:** [DirectAdmin Forum](https://forum.directadmin.com/)
- **PostgreSQL Dokümantasyon:** [PostgreSQL Docs](https://www.postgresql.org/docs/14/)
- **Next.js Dokümantasyon:** [Next.js Docs](https://nextjs.org/docs)

---

## 📚 Ek Kaynaklar ve Referanslar

### Resmi Dokümantasyonlar:
- **DirectAdmin:** https://www.directadmin.com/features.php
- **Next.js Production Deployment:** https://nextjs.org/docs/deployment
- **PostgreSQL 14:** https://www.postgresql.org/docs/14/
- **PM2 Process Manager:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Apache Reverse Proxy:** https://httpd.apache.org/docs/2.4/howto/reverse_proxy.html
- **Let's Encrypt:** https://letsencrypt.org/docs/

### Topluluk Kaynakları:
- **DirectAdmin Forum:** https://forum.directadmin.com/
- **Stack Overflow - DirectAdmin:** https://stackoverflow.com/questions/tagged/directadmin
- **Next.js Discord:** https://discord.gg/nextjs
- **PostgreSQL Mailing Lists:** https://www.postgresql.org/list/

### Güvenlik Kaynakları:
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **PostgreSQL Security:** https://www.postgresql.org/docs/14/auth-pg-hba-conf.html
- **Apache Security Tips:** https://httpd.apache.org/docs/2.4/misc/security_tips.html

---

## 🔧 Gelişmiş Yapılandırma (Opsiyonel)

### Redis Cache Kurulumu (Opsiyonel)
```bash
# Redis kur
sudo yum install -y redis  # CentOS/AlmaLinux/Rocky
sudo apt install -y redis  # Ubuntu/Debian

# Servisi başlat
sudo systemctl enable redis
sudo systemctl start redis

# .env dosyasına ekle
REDIS_URL=redis://localhost:6379
```

### Nginx ile Değiştirme (İleri Seviye)
DirectAdmin varsayılan olarak Apache kullanır, ancak Nginx'e geçmek isterseniz:
- CustomBuild üzerinden Nginx+Apache kombinasyonu kurabilirsiniz
- Detaylı bilgi için DirectAdmin dokümantasyonuna bakın

### CDN Entegrasyonu
- Cloudflare veya başka bir CDN kullanarak static dosyaları cache edebilirsiniz
- DNS ayarlarını Cloudflare'e yönlendirin
- SSL/TLS ayarlarını Cloudflare'de yapılandırın

---

**Son Güncelleme:** 6 Ocak 2025  
**Versiyon:** 1.0.0  
**Platform:** DirectAdmin  
**Yazar:** QRim.net Ekibi

**Not:** Bu dokümantasyon DirectAdmin versiyonlarına göre farklılık gösterebilir. En güncel bilgiler için resmi DirectAdmin dokümantasyonunu kontrol edin.
