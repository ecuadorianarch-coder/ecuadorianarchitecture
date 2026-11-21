const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '..', 'src', 'data');
const files = [
  'projects.json',
  'territorios.json',
  'adCampaigns.json',
  'editorialOffice.json',
  'studios.json',
  'submissions.json'
];

let totalReplacements = 0;

for (const file of files) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');
  const count = (content.match(/https:\/\/zinapitogdpdflkogutn\.supabase\.co\/storage\/v1\/object\/public\/uploads\//g) || []).length;

  if (count > 0) {
    content = content.replace(/https:\/\/zinapitogdpdflkogutn\.supabase\.co\/storage\/v1\/object\/public\/uploads\//g, '/images/uploads/');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}: replaced ${count} Supabase URLs with local /images/uploads/`);
    totalReplacements += count;
  }
}

console.log(`Total URLs normalized: ${totalReplacements}`);
