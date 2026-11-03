const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const dataDir = path.join(rootDir, 'src', 'data');
const uploadsDir = path.join(rootDir, 'public', 'images', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '/';

  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // 1. API: Image Upload Handler
  if (pathname === '/api/upload' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { filename, data } = payload;
        if (!data || !data.includes('base64,')) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid image data' }));
          return;
        }

        const base64Data = data.split('base64,')[1];
        const ext = path.extname(filename) || '.webp';
        const safeName = `${Date.now()}-${path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_')}${ext}`;
        const filePath = path.join(uploadsDir, safeName);

        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, url: `/images/uploads/${safeName}`, filename: safeName }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2. API: JSON Data endpoints
  if (pathname.startsWith('/api/')) {
    let filename = '';
    if (pathname === '/api/site-config') filename = 'siteConfig.json';
    else if (pathname === '/api/projects') filename = 'projects.json';
    else if (pathname === '/api/articles') filename = 'articles.json';
    else if (pathname === '/api/academia') filename = 'academia.json';
    else if (pathname === '/api/territorios') filename = 'territorios.json';
    else if (pathname === '/api/community-notes') filename = 'communityNotes.json';
    else if (pathname === '/api/authors') filename = 'authors.json';
    else if (pathname === '/api/photographers') filename = 'photographers.json';
    else if (pathname === '/api/master-builders') filename = 'masterBuilders.json';
    else if (pathname === '/api/ad-brands') filename = 'adBrands.json';
    else if (pathname === '/api/ad-campaigns') filename = 'adCampaigns.json';
    else if (pathname === '/api/ad-placements') filename = 'adPlacements.json';
    else if (pathname === '/api/ad-analytics') filename = 'adAnalytics.json';
    else if (pathname === '/api/ad-events') filename = 'adEvents.json';
    else if (pathname === '/api/feedback') filename = 'feedback.json';
    else if (pathname === '/api/project-submissions') filename = 'projectSubmissions.json';

    if (filename) {
      const filePath = path.join(dataDir, filename);
      if (req.method === 'GET') {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(content);
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not found' }));
        }
        return;
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            fs.writeFileSync(filePath, body, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, updated: filename }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }
    }
  }

  // 3. Serve Static Files from dist/
  let filePath = path.join(distDir, pathname === '/' ? 'index.html' : pathname);

  // If path doesn't have an extension, try folder/index.html or .html
  if (!path.extname(filePath)) {
    if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    } else if (fs.existsSync(`${filePath}.html`)) {
      filePath = `${filePath}.html`;
    }
  }

  // Fallback for SPA routing to index.html
  if (!fs.existsSync(filePath)) {
    if (pathname.startsWith('/admin')) {
      filePath = path.join(distDir, 'admin.html');
    } else {
      filePath = path.join(distDir, 'index.html');
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`[EA Production Server] Listening on http://localhost:${PORT}`);
});
