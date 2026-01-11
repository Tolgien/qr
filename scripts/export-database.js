
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// DATABASE_URL already available in environment (Replit provides it)
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL bulunamadı. .env dosyasını kontrol edin.');
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

// Create database directory if it doesn't exist (secure - not publicly accessible)
const databaseDir = path.join(process.cwd(), 'database');
if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true });
}

const outputFile = path.join(databaseDir, 'database-backup.sql');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const timestampedFile = path.join(databaseDir, `database-backup-${timestamp}.sql`);

console.log('📦 Veritabanı dışa aktarılıyor...');
console.log(`   Host: ${host}`);
console.log(`   Database: ${database}`);
console.log(`   User: ${user}`);

// Set PGPASSWORD environment variable
process.env.PGPASSWORD = password;

// pg_dump command
const dumpCommand = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} --clean --if-exists --no-owner --no-acl`;

exec(dumpCommand, { maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Hata:', error.message);
    if (stderr) console.error('Stderr:', stderr);
    process.exit(1);
  }

  // Save to both files
  fs.writeFileSync(outputFile, stdout);
  fs.writeFileSync(timestampedFile, stdout);

  const sizeKB = (stdout.length / 1024).toFixed(2);
  console.log(`✅ Veritabanı başarıyla dışa aktarıldı!`);
  console.log(`   Dosya: ${outputFile}`);
  console.log(`   Yedek: ${timestampedFile}`);
  console.log(`   Boyut: ${sizeKB} KB`);
  console.log('\n📋 Kurulum için bu dosyayı kullanabilirsiniz.');
});
