const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '..', 'public', 'images', 'uploads');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function syncAllCatalogImages() {
  const projects = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'src', 'data', 'projects.json'), 'utf8'));
  const allJson = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'data', 'projects.json'), 'utf8') +
                  fs.readFileSync(path.resolve(__dirname, '..', 'src', 'data', 'territorios.json'), 'utf8') +
                  fs.readFileSync(path.resolve(__dirname, '..', 'src', 'data', 'adCampaigns.json'), 'utf8');

  const matches = [...new Set(allJson.match(/https:\/\/zinapitogdpdflkogutn\.supabase\.co\/storage\/v1\/object\/public\/uploads\/[^\s"']+/g) || [])];
  console.log('Found', matches.length, 'unique Supabase image assets across catalog files.');

  let downloaded = 0;
  let alreadyLocal = 0;

  for (const url of matches) {
    const filename = url.split('/uploads/').pop();
    const localPath = path.join(targetDir, filename);

    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 0) {
      alreadyLocal++;
      continue;
    }

    try {
      console.log('Downloading to local cache:', filename);
      const res = await fetch(url);
      if (!res.ok) {
        console.warn('Failed to fetch:', url, res.status);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(localPath, buffer);
      downloaded++;
    } catch (err) {
      console.error('Error downloading', filename, err.message);
    }
  }

  console.log(`Sync complete: ${alreadyLocal} already local, ${downloaded} downloaded.`);
  const allFiles = fs.readdirSync(targetDir);
  console.log(`Total files in public/images/uploads/: ${allFiles.length}`);
}

syncAllCatalogImages();
