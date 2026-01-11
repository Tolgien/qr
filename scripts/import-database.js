
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// DATABASE_URL already available in environment (Replit provides it)
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL bulunamadı.');
  process.exit(1);
}

// Parse connection details from DATABASE_URL
// Format: postgresql://user:password@host:port/database or postgresql://user:password@host/database
const urlMatch = DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:/]+)(?::(\d+))?\/([^?]+)/);
if (!urlMatch) {
  console.error('❌ DATABASE_URL formatı hatalı.');
  console.error('DATABASE_URL:', DATABASE_URL.substring(0, 50) + '...');
  process.exit(1);
}

const [, user, password, host, portStr, database] = urlMatch;
const port = portStr || '5432'; // Default PostgreSQL port

const inputFile = path.join(process.cwd(), 'database', 'database-backup.sql');

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Yedek dosyası bulunamadı: ${inputFile}`);
  process.exit(1);
}

console.log('📥 Veritabanı içe aktarılıyor...');
console.log(`   Host: ${host}`);
console.log(`   Database: ${database}`);
console.log(`   User: ${user}`);

// Set PGPASSWORD environment variable
process.env.PGPASSWORD = password;

// psql command to import
const importCommand = `psql -h ${host} -p ${port} -U ${user} -d ${database} < "${inputFile}"`;

exec(importCommand, { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Hata:', error.message);
    if (stderr) console.error('Stderr:', stderr);
    process.exit(1);
  }

  if (stdout) console.log(stdout);
  console.log('✅ Veritabanı başarıyla içe aktarıldı!');
});
