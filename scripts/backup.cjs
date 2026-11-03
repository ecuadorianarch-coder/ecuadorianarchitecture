const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const os = require('os');

const rootDir = path.resolve(__dirname, '..');
const backupsDir = path.join(rootDir, 'backups');

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

// Generate timestamp string YYYY-MM-DD_HH-mm-ss
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
const backupZipName = `ea-backup-${timestamp}.zip`;
const backupZipPath = path.join(backupsDir, backupZipName);

console.log('====================================================');
console.log('  ECUADORIAN ARCHITECTURE — AUTOMATED BACKUP ENGINE ');
console.log('====================================================');
console.log(`Timestamp: ${now.toISOString()}`);
console.log(`Destination: ${backupZipPath}`);

// Create temporary staging directory in os.tmpdir() to prevent Vite watcher collisions
const stagingDir = path.join(os.tmpdir(), `ea-staging-${Date.now()}`);
fs.mkdirSync(stagingDir, { recursive: true });

try {
  // 1. Copy src/data (CMS database JSON files)
  const dataSrc = path.join(rootDir, 'src', 'data');
  const dataDest = path.join(stagingDir, 'data');
  if (fs.existsSync(dataSrc)) {
    fs.cpSync(dataSrc, dataDest, { recursive: true });
    console.log('✓ Backed up: src/data (JSON CMS database)');
  }

  // 2. Copy public/images/uploads (media library)
  const uploadsSrc = path.join(rootDir, 'public', 'images', 'uploads');
  const uploadsDest = path.join(stagingDir, 'uploads');
  if (fs.existsSync(uploadsSrc)) {
    fs.cpSync(uploadsSrc, uploadsDest, { recursive: true });
    console.log('✓ Backed up: public/images/uploads (media assets)');
  }

  // 3. Copy key configurations
  const configFiles = ['package.json', 'vite.config.ts', 'tsconfig.json', '.env.example', 'index.html', 'admin.html'];
  const configDest = path.join(stagingDir, 'config');
  fs.mkdirSync(configDest, { recursive: true });
  for (const cf of configFiles) {
    const fullPath = path.join(rootDir, cf);
    if (fs.existsSync(fullPath)) {
      fs.copyFileSync(fullPath, path.join(configDest, cf));
    }
  }
  console.log('✓ Backed up: Project configurations & HTML templates');

  // 4. Create metadata manifest
  const manifest = {
    platform: 'Ecuadorian Architecture',
    createdAt: now.toISOString(),
    version: require('../package.json').version || '0.1.0',
    contents: {
      data: fs.existsSync(dataSrc) ? fs.readdirSync(dataSrc) : [],
      uploadsCount: fs.existsSync(uploadsSrc) ? fs.readdirSync(uploadsSrc).length : 0,
    },
    restoreInstructions: 'To restore: extract zip and copy data/ back to src/data/ and uploads/ back to public/images/uploads/'
  };
  fs.writeFileSync(path.join(stagingDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  // 5. Compress into zip using PowerShell Compress-Archive
  console.log('Compressing backup archive...');
  const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${backupZipPath}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });

  const stats = fs.statSync(backupZipPath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 Backup created successfully!`);
  console.log(`Archive: ${backupZipName} (${sizeMb} MB)`);
  console.log(`Path: ${backupZipPath}`);

  // 6. Clean up staging folder
  fs.rmSync(stagingDir, { recursive: true, force: true });

  // 7. Prune backups older than 20 entries to save disk space
  const allBackups = fs.readdirSync(backupsDir)
    .filter(f => f.startsWith('ea-backup-') && f.endsWith('.zip'))
    .map(f => ({ name: f, path: path.join(backupsDir, f), mtime: fs.statSync(path.join(backupsDir, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime);

  if (allBackups.length > 20) {
    console.log(`Pruning ${allBackups.length - 20} older backup archives...`);
    for (let i = 20; i < allBackups.length; i++) {
      fs.unlinkSync(allBackups[i].path);
    }
  }

} catch (err) {
  console.error('Backup failed:', err);
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  process.exit(1);
}
