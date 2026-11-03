const fs = require('fs');
const path = require('path');

// Serverless Handler for Vercel / Netlify
module.exports = (req, res) => {
  const dataDir = path.resolve(process.cwd(), 'src', 'data');
  const pathname = req.url ? req.url.split('?')[0] : '';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  let filename = '';
  if (pathname.includes('/projects')) filename = 'projects.json';
  else if (pathname.includes('/articles')) filename = 'articles.json';
  else if (pathname.includes('/academia')) filename = 'academia.json';
  else if (pathname.includes('/territorios')) filename = 'territorios.json';
  else if (pathname.includes('/community-notes')) filename = 'communityNotes.json';
  else if (pathname.includes('/authors')) filename = 'authors.json';
  else if (pathname.includes('/photographers')) filename = 'photographers.json';
  else if (pathname.includes('/master-builders')) filename = 'masterBuilders.json';
  else if (pathname.includes('/site-config')) filename = 'siteConfig.json';
  else if (pathname.includes('/ad-brands')) filename = 'adBrands.json';
  else if (pathname.includes('/ad-campaigns')) filename = 'adCampaigns.json';
  else if (pathname.includes('/ad-placements')) filename = 'adPlacements.json';
  else if (pathname.includes('/ad-analytics')) filename = 'adAnalytics.json';
  else if (pathname.includes('/ad-events')) filename = 'adEvents.json';
  else if (pathname.includes('/feedback')) filename = 'feedback.json';
  else if (pathname.includes('/project-submissions')) filename = 'projectSubmissions.json';

  if (!filename) {
    res.statusCode = 404;
    return res.json({ error: 'Endpoint not found' });
  }

  const filePath = path.join(dataDir, filename);

  if (req.method === 'GET') {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      return res.end(data);
    }
    return res.status(404).json({ error: 'File not found' });
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body, null, 2);
      fs.writeFileSync(filePath, body, 'utf-8');
      return res.json({ success: true, updated: filename });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.statusCode = 405;
  res.end('Method not allowed');
};
