const fs = require('fs');
const path = require('path');
const url = require('url');

// In-memory cache for rapid click debouncing
const recentAdClicksCache = new Map();

// Serverless Handler for Vercel / Netlify
module.exports = (req, res) => {
  const dataDir = path.resolve(process.cwd(), 'src', 'data');
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // ---------------------------------------------------------------------------
  // 1. AD REDIRECTION & CLICK TRACKING
  // ---------------------------------------------------------------------------
  if (pathname === '/api/ads/click') {
    const campaignId = parsedUrl.query?.c || '';
    const placementId = parsedUrl.query?.p || 'entre-proyectos';
    const rawDest = parsedUrl.query?.dest || '';
    const isAdmin = parsedUrl.query?.admin === 'true';
    const destinationUrl = rawDest ? decodeURIComponent(rawDest) : 'https://ecuadorianarchitecture.com';

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const now = Date.now();
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const dedupeKey = `${clientIp}_${campaignId}`;
    const lastClickTime = recentAdClicksCache.get(dedupeKey) || 0;
    const isRapidDuplicate = now - lastClickTime < 3000;
    recentAdClicksCache.set(dedupeKey, now);

    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|bingbot/i.test(userAgent);
    const isValid = !isAdmin && !isRapidDuplicate && !isBot;
    const reason = isAdmin ? 'admin_preview' : isBot ? 'bot_detected' : isRapidDuplicate ? 'rapid_duplicate' : 'valid';

    // 1. Log event
    const eventsPath = path.join(dataDir, 'adEvents.json');
    try {
      const events = fs.existsSync(eventsPath) ? JSON.parse(fs.readFileSync(eventsPath, 'utf-8') || '[]') : [];
      events.push({
        id: `evt-clk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        campaignId,
        placementId,
        type: 'click',
        timestamp: new Date().toISOString(),
        isValid,
        reason,
        device: /mobile|iphone|android/i.test(userAgent) ? 'mobile' : /ipad|tablet/i.test(userAgent) ? 'tablet' : 'desktop',
        userAgent: userAgent.substring(0, 150),
      });
      if (events.length > 5000) events.splice(0, events.length - 5000);
      fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');
    } catch (e) {}

    // 2. Increment counters
    const analyticsPath = path.join(dataDir, 'adAnalytics.json');
    try {
      if (fs.existsSync(analyticsPath)) {
        const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8') || '{}');
        if (!analytics.grossClicks) analytics.grossClicks = {};
        if (!analytics.validClicks) analytics.validClicks = {};
        if (!analytics.clicks) analytics.clicks = {};
        if (!analytics.clicksByPlacement) analytics.clicksByPlacement = {};
        if (!analytics.dailyStats) analytics.dailyStats = {};

        analytics.grossClicks[campaignId] = (analytics.grossClicks[campaignId] || 0) + 1;

        if (isValid) {
          analytics.validClicks[campaignId] = (analytics.validClicks[campaignId] || 0) + 1;
          analytics.clicks[campaignId] = (analytics.clicks[campaignId] || 0) + 1;
          analytics.clicksByPlacement[placementId] = (analytics.clicksByPlacement[placementId] || 0) + 1;

          const today = new Date().toISOString().split('T')[0];
          if (!analytics.dailyStats[today]) analytics.dailyStats[today] = {};
          if (!analytics.dailyStats[today][campaignId]) {
            analytics.dailyStats[today][campaignId] = { validImpressions: 0, grossClicks: 0, validClicks: 0 };
          }
          analytics.dailyStats[today][campaignId].grossClicks += 1;
          analytics.dailyStats[today][campaignId].validClicks += 1;
        }

        analytics.lastUpdated = new Date().toISOString();
        fs.writeFileSync(analyticsPath, JSON.stringify(analytics, null, 2), 'utf-8');
      }
    } catch (e) {}

    res.statusCode = 302;
    res.setHeader('Location', destinationUrl);
    return res.end();
  }

  // ---------------------------------------------------------------------------
  // 2. AD IMPRESSION TRACKING
  // ---------------------------------------------------------------------------
  if (pathname === '/api/ads/track-impression' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = req.body && typeof req.body === 'object' ? req.body : JSON.parse(body || '{}');
        const { campaignId, placementId, device = 'desktop', isAdmin = false, sessionId = '' } = payload;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const isBot = /bot|crawl|spider|slurp|facebookexternalhit|bingbot/i.test(userAgent);
        const isValid = !isAdmin && !isBot;
        const reason = isAdmin ? 'admin_preview' : isBot ? 'bot_detected' : 'valid';

        const eventsPath = path.join(dataDir, 'adEvents.json');
        const events = fs.existsSync(eventsPath) ? JSON.parse(fs.readFileSync(eventsPath, 'utf-8') || '[]') : [];
        events.push({
          id: `evt-imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          campaignId,
          placementId,
          type: 'impression',
          timestamp: new Date().toISOString(),
          isValid,
          reason,
          device,
          sessionId,
        });
        if (events.length > 5000) events.splice(0, events.length - 5000);
        fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');

        if (isValid) {
          const analyticsPath = path.join(dataDir, 'adAnalytics.json');
          if (fs.existsSync(analyticsPath)) {
            const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8') || '{}');
            if (!analytics.impressions) analytics.impressions = {};
            if (!analytics.impressionsByPlacement) analytics.impressionsByPlacement = {};
            if (!analytics.deviceBreakdown) analytics.deviceBreakdown = { desktop: 0, tablet: 0, mobile: 0 };
            if (!analytics.dailyStats) analytics.dailyStats = {};

            analytics.impressions[campaignId] = (analytics.impressions[campaignId] || 0) + 1;
            analytics.impressionsByPlacement[placementId] = (analytics.impressionsByPlacement[placementId] || 0) + 1;
            analytics.deviceBreakdown[device] = (analytics.deviceBreakdown[device] || 0) + 1;

            const today = new Date().toISOString().split('T')[0];
            if (!analytics.dailyStats[today]) analytics.dailyStats[today] = {};
            if (!analytics.dailyStats[today][campaignId]) {
              analytics.dailyStats[today][campaignId] = { validImpressions: 0, grossClicks: 0, validClicks: 0 };
            }
            analytics.dailyStats[today][campaignId].validImpressions += 1;
            analytics.lastUpdated = new Date().toISOString();
            fs.writeFileSync(analyticsPath, JSON.stringify(analytics, null, 2), 'utf-8');
          }
        }

        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, recorded: isValid }));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ---------------------------------------------------------------------------
  // 3. LIVE VISITOR TRACKING TELEMETRY
  // ---------------------------------------------------------------------------
  if (pathname === '/api/track-visit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = req.body && typeof req.body === 'object' ? req.body : JSON.parse(body || '{}');
        const metricsFile = path.join(dataDir, 'siteMetrics.json');
        let metrics = {
          totalUniqueVisitors: 0,
          totalPageviews: 0,
          dailyStats: {},
          deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
          sourcesBreakdown: { instagram: 0, direct_whatsapp: 0, google_search: 0, referral: 0 },
          sectionsBreakdown: { proyectos: 0, home: 0, territorios: 0, academia: 0, acerca: 0 },
          lastUpdated: new Date().toISOString()
        };
        if (fs.existsSync(metricsFile)) {
          try { metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf-8')); } catch {}
        }
        
        const today = new Date().toISOString().split('T')[0];
        if (!metrics.dailyStats) metrics.dailyStats = {};
        if (!metrics.dailyStats[today]) {
          metrics.dailyStats[today] = { uniqueVisitors: 0, pageviews: 0, leads: 0 };
        }
        
        metrics.totalPageviews = (metrics.totalPageviews || 0) + 1;
        metrics.dailyStats[today].pageviews = (metrics.dailyStats[today].pageviews || 0) + 1;
        
        if (payload.isNewVisitor) {
          metrics.totalUniqueVisitors = (metrics.totalUniqueVisitors || 0) + 1;
          metrics.dailyStats[today].uniqueVisitors = (metrics.dailyStats[today].uniqueVisitors || 0) + 1;
        }
        
        const dev = payload.device || 'desktop';
        if (!metrics.deviceBreakdown) metrics.deviceBreakdown = { mobile: 0, desktop: 0, tablet: 0 };
        metrics.deviceBreakdown[dev] = (metrics.deviceBreakdown[dev] || 0) + 1;
        
        const sec = payload.section || 'home';
        if (!metrics.sectionsBreakdown) metrics.sectionsBreakdown = {};
        metrics.sectionsBreakdown[sec] = (metrics.sectionsBreakdown[sec] || 0) + 1;
        
        const src = payload.source || 'direct_whatsapp';
        if (!metrics.sourcesBreakdown) metrics.sourcesBreakdown = {};
        metrics.sourcesBreakdown[src] = (metrics.sourcesBreakdown[src] || 0) + 1;
        
        metrics.lastUpdated = new Date().toISOString();
        fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2), 'utf-8');
        
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, today: metrics.dailyStats[today] }));
      } catch (e) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ---------------------------------------------------------------------------
  // 4. GENERAL CRUD JSON API & SUBSCRIBERS
  // ---------------------------------------------------------------------------
  let filename = '';
  if (pathname === '/api/site-metrics' || pathname.includes('/site-metrics') || pathname === '/api/metrics') filename = 'siteMetrics.json';
  else if (pathname.includes('/opportunities')) filename = 'opportunities.json';
  else if (pathname.includes('/editorial')) filename = 'editorialOffice.json';
  else if (pathname.includes('/projects')) filename = 'projects.json';
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
  else if (pathname.includes('/subscribers') || pathname.includes('/subscribe')) filename = 'subscribers.json';

  if (!filename) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }

  const filePath = path.join(dataDir, filename);

  // DELETE: Remove lead by id
  if (req.method === 'DELETE' && (pathname.includes('/subscribers') || pathname.includes('/subscribe'))) {
    const queryId = parsedUrl.query?.id;
    if (!queryId) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Falta el id del suscriptor a eliminar.' }));
    }
    const currentSubs = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]')
      : [];
    const nextSubs = currentSubs.filter(s => s.id !== queryId);
    fs.writeFileSync(filePath, JSON.stringify(nextSubs, null, 2), 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: true, remaining: nextSubs.length }));
  }

  if (req.method === 'GET') {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      return res.end(data);
    }
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'File not found' }));
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const parsed = (req.body && typeof req.body === 'object') ? req.body : JSON.parse(body || '{}');

        // Handle subscriber capture
        if (pathname.includes('/subscribers') || pathname.includes('/subscribe')) {
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.email) {
            if (parsed.hp || parsed.honeypot) {
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, spam: true }));
            }
            const email = String(parsed.email).trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Dirección de correo electrónico inválida.' }));
            }
            const currentSubs = fs.existsSync(filePath)
              ? JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]')
              : [];
            const exists = currentSubs.find(s => s.email?.toLowerCase() === email);
            if (!exists) {
              currentSubs.push({
                id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                email,
                nombre: parsed.nombre || parsed.name || '',
                telefono: parsed.telefono || parsed.phone || '',
                section: parsed.section || 'general',
                source: parsed.source || 'banner-newsletter',
                createdAt: new Date().toISOString(),
              });
              fs.writeFileSync(filePath, JSON.stringify(currentSubs, null, 2), 'utf-8');

              // Increment leads in siteMetrics.json
              try {
                const metricsFile = path.join(dataDir, 'siteMetrics.json');
                if (fs.existsSync(metricsFile)) {
                  const m = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
                  const t = new Date().toISOString().split('T')[0];
                  if (!m.dailyStats) m.dailyStats = {};
                  if (!m.dailyStats[t]) m.dailyStats[t] = { uniqueVisitors: 0, pageviews: 0, leads: 0 };
                  m.dailyStats[t].leads = (m.dailyStats[t].leads || 0) + 1;
                  m.lastUpdated = new Date().toISOString();
                  fs.writeFileSync(metricsFile, JSON.stringify(m, null, 2), 'utf-8');
                }
              } catch (e) {}
            } else {
              if (parsed.nombre || parsed.telefono || parsed.name || parsed.phone) {
                exists.nombre = parsed.nombre || parsed.name || exists.nombre || '';
                exists.telefono = parsed.telefono || parsed.phone || exists.telefono || '';
                fs.writeFileSync(filePath, JSON.stringify(currentSubs, null, 2), 'utf-8');
              }
            }
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              success: true,
              alreadySubscribed: Boolean(exists),
              message: '¡Gracias por querer ser parte de esta conversación! Te avisaremos cuando haya nuevas publicaciones en EcuadorianArchitecture.',
            }));
          }
        }

        const bodyToWrite = typeof req.body === 'string' ? req.body : (body || JSON.stringify(parsed, null, 2));
        fs.writeFileSync(filePath, bodyToWrite, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ success: true, updated: filename }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.statusCode = 405;
  res.end('Method not allowed');
};
