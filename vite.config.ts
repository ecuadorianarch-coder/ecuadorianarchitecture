import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// ---------------------------------------------------------------------------
// Helpers Criptográficos y de Seguridad para Cuentas de Estudio (Dev & Server)
// ---------------------------------------------------------------------------
const JWT_STUDIO_SECRET = process.env.JWT_STUDIO_SECRET || 'ea_sec_studio_key_2026_94xkL8!scrypt_vault';

function getResendApiKey(): string {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  try {
    const envContent = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf8');
    const match = envContent.match(/RESEND_API_KEY=([^\r\n]+)/);
    return match ? match[1].trim() : '';
  } catch {
    return '';
  }
}

function hashStudioPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyStudioPassword(password: string, storedHash?: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  try {
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    return false;
  }
}

function generateStudioToken(studio: any): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    studioId: studio.id,
    email: studio.email,
    studioName: studio.studioName,
    exp: Math.floor(Date.now() / 1000) + (60 * 24 * 3600),
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_STUDIO_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${sig}`;
}

function verifyStudioToken(token?: string | null): any {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', JWT_STUDIO_SECRET).update(`${header}.${payload}`).digest('base64url');
  if (sig !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

function extractStudioTokenFromHeader(req: any): string | null {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const match = String(authHeader).match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

const apiPlugin = () => ({
  name: 'ea-cms-api',
  configureServer(server: any) {
    // Recent clicks cache for debouncing rapid duplicate clicks (within 3 seconds)
    const recentClicksCache = new Map<string, number>();

    server.middlewares.use((req: any, res: any, next: any) => {
      const dataPath = path.resolve(__dirname, './src/data');

      // -----------------------------------------------------------------------
      // 1. AD REDIRECTION & CLICK TRACKING ENDPOINT
      // -----------------------------------------------------------------------
      if (req.url?.startsWith('/api/ads/click')) {
        const urlObj = new URL(req.url, 'http://localhost:5173');
        const campaignId = urlObj.searchParams.get('c') || '';
        const placementId = urlObj.searchParams.get('p') || 'entre-proyectos';
        const rawDest = urlObj.searchParams.get('dest') || '';
        const isAdmin = urlObj.searchParams.get('admin') === 'true';
        const destinationUrl = rawDest ? decodeURIComponent(rawDest) : 'https://ecuadorianarchitecture.com';

        const userAgent = req.headers['user-agent'] || 'Unknown';
        const now = Date.now();
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const dedupeKey = `${clientIp}_${campaignId}`;
        const lastClickTime = recentClicksCache.get(dedupeKey) || 0;
        const isRapidDuplicate = now - lastClickTime < 3000;
        recentClicksCache.set(dedupeKey, now);

        const isBot = /bot|crawl|spider|slurp|facebookexternalhit|bingbot/i.test(userAgent);
        const isValid = !isAdmin && !isRapidDuplicate && !isBot;
        const reason = isAdmin ? 'admin_preview' : isBot ? 'bot_detected' : isRapidDuplicate ? 'rapid_duplicate' : 'valid';

        // 1. Log event to adEvents.json
        const eventsPath = path.join(dataPath, 'adEvents.json');
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
          // Limit stored events array to last 5,000 for storage efficiency
          if (events.length > 5000) events.splice(0, events.length - 5000);
          fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2), 'utf-8');
        } catch (e) {
          console.warn('Error recording ad click event:', e);
        }

        // 2. Increment counters in adAnalytics.json
        const analyticsPath = path.join(dataPath, 'adAnalytics.json');
        try {
          if (fs.existsSync(analyticsPath)) {
            const analytics = JSON.parse(fs.readFileSync(analyticsPath, 'utf-8') || '{}');
            if (!analytics.grossClicks) analytics.grossClicks = {};
            if (!analytics.validClicks) analytics.validClicks = {};
            if (!analytics.clicks) analytics.clicks = {};
            if (!analytics.clicksByPlacement) analytics.clicksByPlacement = {};
            if (!analytics.dailyStats) analytics.dailyStats = {};

            // Always increment gross clicks
            analytics.grossClicks[campaignId] = (analytics.grossClicks[campaignId] || 0) + 1;

            if (isValid) {
              analytics.validClicks[campaignId] = (analytics.validClicks[campaignId] || 0) + 1;
              analytics.clicks[campaignId] = (analytics.clicks[campaignId] || 0) + 1;
              analytics.clicksByPlacement[placementId] = (analytics.clicksByPlacement[placementId] || 0) + 1;

              // Daily stats aggregation
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
        } catch (e) {
          console.warn('Error updating analytics on ad click:', e);
        }

        // 3. Perform HTTP 302 Redirection to target
        res.writeHead(302, { Location: destinationUrl });
        res.end();
        return;
      }

      // -----------------------------------------------------------------------
      // 2. IMPRESSION TRACKING ENDPOINT (POST)
      // -----------------------------------------------------------------------
      if (req.url === '/api/ads/track-impression' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', () => {
          try {
            const { campaignId, placementId, device = 'desktop', isAdmin = false, sessionId = '' } = JSON.parse(body || '{}');
            const userAgent = req.headers['user-agent'] || 'Unknown';
            const isBot = /bot|crawl|spider|slurp|facebookexternalhit|bingbot/i.test(userAgent);
            const isValid = !isAdmin && !isBot;
            const reason = isAdmin ? 'admin_preview' : isBot ? 'bot_detected' : 'valid';

            // Log event to adEvents.json
            const eventsPath = path.join(dataPath, 'adEvents.json');
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

            // Update adAnalytics.json if valid
            if (isValid) {
              const analyticsPath = path.join(dataPath, 'adAnalytics.json');
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
            res.end(JSON.stringify({ success: true, recorded: isValid }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      // -----------------------------------------------------------------------
      // 3. ADVERTISER REPORT ENDPOINT (GET)
      // -----------------------------------------------------------------------
      if (req.url?.startsWith('/api/ads/report')) {
        const urlObj = new URL(req.url, 'http://localhost:5173');
        const token = urlObj.searchParams.get('token') || '';

        try {
          const campaignsPath = path.join(dataPath, 'adCampaigns.json');
          const brandsPath = path.join(dataPath, 'adBrands.json');
          const placementsPath = path.join(dataPath, 'adPlacements.json');
          const analyticsPath = path.join(dataPath, 'adAnalytics.json');

          const campaigns = fs.existsSync(campaignsPath) ? JSON.parse(fs.readFileSync(campaignsPath, 'utf-8')) : [];
          const matchedCampaign = campaigns.find((c: any) => c.shareToken === token && c.shareEnabled !== false);

          if (!matchedCampaign) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Reporte no encontrado o enlace revocado.' }));
            return;
          }

          const brands = fs.existsSync(brandsPath) ? JSON.parse(fs.readFileSync(brandsPath, 'utf-8')) : [];
          const brand = brands.find((b: any) => b.id === matchedCampaign.brandId) || { name: 'Anunciante Oficial' };
          const placements = fs.existsSync(placementsPath) ? JSON.parse(fs.readFileSync(placementsPath, 'utf-8')) : [];
          const analytics = fs.existsSync(analyticsPath) ? JSON.parse(fs.readFileSync(analyticsPath, 'utf-8')) : {};

          const validImpressions = analytics.impressions?.[matchedCampaign.id] || 0;
          const grossClicks = analytics.grossClicks?.[matchedCampaign.id] || 0;
          const validClicks = analytics.validClicks?.[matchedCampaign.id] || analytics.clicks?.[matchedCampaign.id] || 0;
          const ctr = validImpressions > 0 ? ((validClicks / validImpressions) * 100).toFixed(2) : '0.00';
          const deliveryPercent = matchedCampaign.targetImpressions
            ? ((validImpressions / matchedCampaign.targetImpressions) * 100).toFixed(1)
            : undefined;

          // Compute daily trend for this campaign
          const dailyTrend: any[] = [];
          if (analytics.dailyStats) {
            Object.keys(analytics.dailyStats).sort().forEach((d) => {
              const dayData = analytics.dailyStats[d]?.[matchedCampaign.id];
              if (dayData) {
                dailyTrend.push({
                  date: d,
                  validImpressions: dayData.validImpressions || 0,
                  grossClicks: dayData.grossClicks || 0,
                  validClicks: dayData.validClicks || 0,
                });
              }
            });
          }

          // Placement breakdown
          const placementBreakdown = matchedCampaign.placements.map((plcId: string) => {
            const plcConfig = placements.find((p: any) => p.id === plcId);
            const imp = analytics.impressionsByPlacement?.[plcId] || 0;
            const clk = analytics.clicksByPlacement?.[plcId] || 0;
            const pCtr = imp > 0 ? ((clk / imp) * 100).toFixed(2) : '0.00';
            return {
              placementId: plcId,
              name: plcConfig?.name || plcId,
              impressions: imp,
              clicks: clk,
              ctr: pCtr,
            };
          });

          const reportData = {
            campaign: matchedCampaign,
            brand,
            stats: {
              validImpressions,
              grossClicks,
              validClicks,
              ctr,
              deliveryPercent,
              targetImpressions: matchedCampaign.targetImpressions,
              budget: matchedCampaign.budget,
              startDate: matchedCampaign.startDate,
              endDate: matchedCampaign.endDate,
            },
            dailyTrend,
            placementBreakdown,
            methodology: {
              impressionRule: 'IntersectionObserver >= 50% de área visible durante al menos 1.000 ms continuo. Deduplicado por sesión de navegación.',
              clickRule: 'Redirección a través de endpoint /api/ads/click con filtrado de bots y bloqueo de clics rápidos duplicados (< 3s).',
              lastUpdated: analytics.lastUpdated || new Date().toISOString(),
            },
          };

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(reportData));
          return;
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
          return;
        }
      }

      // -----------------------------------------------------------------------
      // 3.5 ADVERTISER PORTAL ENDPOINT (GET - Consolidado por Marca)
      // -----------------------------------------------------------------------
      if (req.url?.startsWith('/api/ads/advertiser-portal')) {
        const urlObj = new URL(req.url, 'http://localhost:5173');
        const token = urlObj.searchParams.get('token') || '';

        try {
          const campaignsPath = path.join(dataPath, 'adCampaigns.json');
          const brandsPath = path.join(dataPath, 'adBrands.json');
          const placementsPath = path.join(dataPath, 'adPlacements.json');
          const analyticsPath = path.join(dataPath, 'adAnalytics.json');

          const brands = fs.existsSync(brandsPath) ? JSON.parse(fs.readFileSync(brandsPath, 'utf-8')) : [];
          const brand = brands.find(
            (b: any) => (b.portalToken === token || b.id === token) && b.portalEnabled !== false
          );

          if (!brand) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Portal de anunciante no encontrado o acceso revocado.' }));
            return;
          }

          const campaigns = fs.existsSync(campaignsPath) ? JSON.parse(fs.readFileSync(campaignsPath, 'utf-8')) : [];
          const brandCampaigns = campaigns.filter((c: any) => c.brandId === brand.id);
          const placements = fs.existsSync(placementsPath) ? JSON.parse(fs.readFileSync(placementsPath, 'utf-8')) : [];
          const analytics = fs.existsSync(analyticsPath) ? JSON.parse(fs.readFileSync(analyticsPath, 'utf-8')) : {};

          let totalBudget = 0;
          let totalTargetImpressions = 0;
          let totalValidImpressions = 0;
          let totalGrossClicks = 0;
          let totalValidClicks = 0;

          const campaignsWithMetrics = brandCampaigns.map((camp: any) => {
            const vImp = analytics.impressions?.[camp.id] || 0;
            const gClk = analytics.grossClicks?.[camp.id] || 0;
            const vClk = analytics.validClicks?.[camp.id] || analytics.clicks?.[camp.id] || 0;
            const ctr = vImp > 0 ? ((vClk / vImp) * 100).toFixed(2) : '0.00';
            const del = camp.targetImpressions ? ((vImp / camp.targetImpressions) * 100).toFixed(1) : undefined;

            totalBudget += (camp.budget || 0);
            totalTargetImpressions += (camp.targetImpressions || 0);
            totalValidImpressions += vImp;
            totalGrossClicks += gClk;
            totalValidClicks += vClk;

            return {
              ...camp,
              metrics: {
                validImpressions: vImp,
                grossClicks: gClk,
                validClicks: vClk,
                ctr,
                deliveryPercent: del,
              },
            };
          });

          const overallCtr =
            totalValidImpressions > 0 ? ((totalValidClicks / totalValidImpressions) * 100).toFixed(2) : '0.00';
          const overallDeliveryPercent =
            totalTargetImpressions > 0
              ? ((totalValidImpressions / totalTargetImpressions) * 100).toFixed(1)
              : undefined;

          // Aggregate daily trend across brand campaigns
          const dailyTrendMap: Record<string, { validImpressions: number; grossClicks: number; validClicks: number }> = {};
          if (analytics.dailyStats) {
            Object.keys(analytics.dailyStats).sort().forEach((d) => {
              brandCampaigns.forEach((camp: any) => {
                const dayData = analytics.dailyStats[d]?.[camp.id];
                if (dayData) {
                  if (!dailyTrendMap[d]) {
                    dailyTrendMap[d] = { validImpressions: 0, grossClicks: 0, validClicks: 0 };
                  }
                  dailyTrendMap[d].validImpressions += (dayData.validImpressions || 0);
                  dailyTrendMap[d].grossClicks += (dayData.grossClicks || 0);
                  dailyTrendMap[d].validClicks += (dayData.validClicks || 0);
                }
              });
            });
          }

          const dailyTrend = Object.keys(dailyTrendMap).sort().map((d) => ({
            date: d,
            ...dailyTrendMap[d],
          }));

          // Placement breakdown for this brand
          const usedPlacements = Array.from(new Set(brandCampaigns.flatMap((c: any) => c.placements || [])));
          const placementBreakdown = usedPlacements.map((plcId: any) => {
            const plcConfig = placements.find((p: any) => p.id === plcId);
            let plcImp = 0;
            let plcClk = 0;
            brandCampaigns.forEach((camp: any) => {
              if (camp.placements?.includes(plcId)) {
                plcImp += (analytics.impressions?.[camp.id] || 0);
                plcClk += (analytics.validClicks?.[camp.id] || analytics.clicks?.[camp.id] || 0);
              }
            });
            const pCtr = plcImp > 0 ? ((plcClk / plcImp) * 100).toFixed(2) : '0.00';
            return {
              placementId: plcId,
              name: plcConfig?.name || plcId,
              impressions: plcImp,
              clicks: plcClk,
              ctr: pCtr,
            };
          });

          const portalData = {
            brand,
            campaigns: campaignsWithMetrics,
            totals: {
              totalCampaigns: brandCampaigns.length,
              activeCampaigns: brandCampaigns.filter((c: any) => c.status === 'activa').length,
              totalBudget,
              totalTargetImpressions,
              validImpressions: totalValidImpressions,
              grossClicks: totalGrossClicks,
              validClicks: totalValidClicks,
              overallCtr,
              overallDeliveryPercent,
            },
            dailyTrend,
            placementBreakdown,
            methodology: {
              impressionRule: 'IntersectionObserver >= 50% de área visible durante al menos 1.000 ms continuo. Deduplicado por sesión de navegación.',
              clickRule: 'Redirección a través de endpoint /api/ads/click con filtrado de bots y bloqueo de clics rápidos duplicados (< 3s).',
              lastUpdated: analytics.lastUpdated || new Date().toISOString(),
            },
          };

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(portalData));
          return;
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
          return;
        }
      }

      // -----------------------------------------------------------------------
      // 3.9 STATIC SERVE FOR UPLOADED IMAGES (Direct streaming with correct MIME)
      // -----------------------------------------------------------------------
      if (req.url?.startsWith('/images/uploads/')) {
        try {
          const parsedUrl = new URL(req.url, 'http://localhost:5173');
          const cleanFilename = decodeURIComponent(path.basename(parsedUrl.pathname));
          const filePath = path.resolve(__dirname, './public/images/uploads', cleanFilename);

          if (fs.existsSync(filePath)) {
            const ext = path.extname(cleanFilename).toLowerCase();
            const mimeMap: Record<string, string> = {
              '.webp': 'image/webp',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.svg': 'image/svg+xml',
              '.gif': 'image/gif',
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', mimeMap[ext] || 'image/webp');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        } catch (e) {
          console.warn('Error serving uploaded image:', e);
        }
      }

      // -----------------------------------------------------------------------
      // 4. GENERAL CRUD JSON API & UPLOAD ENDPOINTS
      // -----------------------------------------------------------------------
      if (req.url === '/api/upload' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', () => {
          try {
            const { filename, data } = JSON.parse(body || '{}');
            if (!data) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No image data provided' }));
              return;
            }

            const uploadsDir = path.resolve(__dirname, './public/images/uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const originalName = filename || 'image.jpg';
            const ext = path.extname(originalName) || '.jpg';
            const rawBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
            const safeName = `${Date.now()}-${rawBase.substring(0, 40)}${ext}`;
            const targetPath = path.join(uploadsDir, safeName);

            // Strip metadata prefix if data:image/...;base64,
            const base64Data = data.includes(',') ? data.split(',')[1] : data;
            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(targetPath, buffer);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              url: `/images/uploads/${safeName}`,
              filename: safeName,
            }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
        return;
      }

      if (req.url?.startsWith('/api/track-visit') && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', () => {
          try {
            const payload = JSON.parse(body || '{}');
            const metricsFile = path.join(dataPath, 'siteMetrics.json');
            let metrics: any = {
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
            res.end(JSON.stringify({ success: true, today: metrics.dailyStats[today] }));
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      // -----------------------------------------------------------------------
      // PORTAL DE ESTUDIOS & SUBMISSIONS ("Sube tu trabajo")
      // -----------------------------------------------------------------------
      if (req.url?.startsWith('/api/auth/studio/login') && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', () => {
          try {
            const { email, password } = JSON.parse(body);
            const cleanEmail = (email || '').trim().toLowerCase();
            const cleanPass = (password || '').trim();

            if (!cleanEmail || !cleanPass) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Por favor ingresa tu correo y contraseña.' }));
              return;
            }

            const studiosPath = path.join(dataPath, 'studios.json');
            const studios = fs.existsSync(studiosPath) ? JSON.parse(fs.readFileSync(studiosPath, 'utf8') || '[]') : [];
            const studio = studios.find((s: any) => s.email.toLowerCase() === cleanEmail);

            if (!studio || !verifyStudioPassword(cleanPass, studio.passwordHash)) {
              res.statusCode = 401;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' }));
              return;
            }

            const token = generateStudioToken(studio);
            const safeStudio = {
              id: studio.id,
              email: studio.email,
              studioName: studio.studioName,
              studioPrincipals: studio.studioPrincipals,
              studioLocation: studio.studioLocation,
              foundationYear: studio.foundationYear,
              studioWebsite: studio.studioWebsite,
              studioAvatarUrl: studio.studioAvatarUrl,
              studioCoverUrl: studio.studioCoverUrl,
            };

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, token, studio: safeStudio }));
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (req.url?.startsWith('/api/auth/studio/forgot-password') && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', async () => {
          try {
            const { email } = JSON.parse(body || '{}');
            const cleanEmail = (email || '').trim().toLowerCase();

            if (!cleanEmail || !cleanEmail.includes('@')) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Por favor ingresa un correo electrónico válido.' }));
              return;
            }

            const studiosPath = path.join(dataPath, 'studios.json');
            let studios = fs.existsSync(studiosPath) ? JSON.parse(fs.readFileSync(studiosPath, 'utf8') || '[]') : [];
            let studio = studios.find((s: any) => s.email.toLowerCase() === cleanEmail);

            if (!studio) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No existe ninguna cuenta registrada con este correo.' }));
              return;
            }

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            studio.recoveryCode = code;
            studio.recoveryExpires = Date.now() + 15 * 60 * 1000;
            fs.writeFileSync(studiosPath, JSON.stringify(studios, null, 2), 'utf8');

            const resendKey = getResendApiKey();
            if (resendKey) {
              const recoveryHtml = `
                <div style="font-family:sans-serif; background:#FFFFFF; color:#18181B; padding:32px; border:1px solid #E4E4E7; border-radius:12px; max-width:550px; margin:0 auto;">
                  <h1 style="font-size:20px; color:#000; text-transform:uppercase; margin-bottom:4px;">Ecuadorian Architecture</h1>
                  <p style="font-size:13px; color:#71717A; margin-top:0;">Recuperación de Contraseña · Portal de Estudios</p>
                  <hr style="border:none; border-top:1px solid #E4E4E7; margin:20px 0;" />
                  <p style="font-size:15px; line-height:1.6;">
                    Hola <strong>${studio.studioName || 'Colega Arquitecto/a'}</strong>,
                  </p>
                  <p style="font-size:14px; line-height:1.6; color:#3F3F46;">
                    Has solicitado restablecer la contraseña de tu cuenta de estudio. Usa el siguiente código de seguridad de 6 dígitos:
                  </p>
                  <div style="background:#09090B; color:#FFFFFF; text-align:center; padding:20px; border-radius:8px; margin:24px 0; letter-spacing:8px; font-size:32px; font-family:monospace; font-weight:bold;">
                    ${code}
                  </div>
                  <p style="font-size:13px; color:#71717A; line-height:1.5;">
                    Este código es confidencial y expirará en <strong>15 minutos</strong>.
                  </p>
                </div>
              `;

              fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  from: 'Ecuadorian Architecture <editorial@ecuadorianarch.com>',
                  to: [cleanEmail],
                  subject: `🔒 Código de Seguridad: ${code} — Ecuadorian Architecture`,
                  html: recoveryHtml
                })
              }).catch(err => console.error('[Vite Forgot Password Error]:', err));
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, message: 'Código de seguridad enviado a tu correo.' }));
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (req.url?.startsWith('/api/auth/studio/reset-password') && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', async () => {
          try {
            const { email, code, newPassword } = JSON.parse(body || '{}');
            const cleanEmail = (email || '').trim().toLowerCase();
            const cleanCode = (code || '').trim();
            const cleanPass = (newPassword || '').trim();

            if (!cleanEmail || !cleanCode || !cleanPass) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Todos los campos son obligatorios.' }));
              return;
            }

            if (cleanPass.length < 6) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' }));
              return;
            }

            const studiosPath = path.join(dataPath, 'studios.json');
            let studios = fs.existsSync(studiosPath) ? JSON.parse(fs.readFileSync(studiosPath, 'utf8') || '[]') : [];
            let studio = studios.find((s: any) => s.email.toLowerCase() === cleanEmail);

            if (!studio) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Cuenta no encontrada.' }));
              return;
            }

            if (!studio.recoveryCode || String(studio.recoveryCode).trim() !== cleanCode) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'El código de seguridad es incorrecto.' }));
              return;
            }

            if (!studio.recoveryExpires || studio.recoveryExpires < Date.now()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'El código de seguridad ha expirado. Solicita uno nuevo.' }));
              return;
            }

            studio.passwordHash = hashStudioPassword(cleanPass);
            delete studio.recoveryCode;
            delete studio.recoveryExpires;
            fs.writeFileSync(studiosPath, JSON.stringify(studios, null, 2), 'utf8');

            const token = generateStudioToken(studio);
            const safeStudio = {
              id: studio.id,
              email: studio.email,
              studioName: studio.studioName,
              studioPrincipals: studio.studioPrincipals,
              studioLocation: studio.studioLocation,
              foundationYear: studio.foundationYear,
              studioWebsite: studio.studioWebsite,
              studioAvatarUrl: studio.studioAvatarUrl,
              studioCoverUrl: studio.studioCoverUrl,
            };

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, token, studio: safeStudio }));
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (req.url?.startsWith('/api/auth/studio/me') && req.method === 'GET') {
        const token = extractStudioTokenFromHeader(req);
        const decoded = verifyStudioToken(token);
        if (!decoded) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Sesión no válida o expirada.' }));
          return;
        }

        const studiosPath = path.join(dataPath, 'studios.json');
        const studios = fs.existsSync(studiosPath) ? JSON.parse(fs.readFileSync(studiosPath, 'utf8') || '[]') : [];
        const studio = studios.find((s: any) => s.id === decoded.studioId || s.email.toLowerCase() === decoded.email.toLowerCase());

        if (!studio) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Estudio no encontrado.' }));
          return;
        }

        const safeStudio = {
          id: studio.id,
          email: studio.email,
          studioName: studio.studioName,
          studioPrincipals: studio.studioPrincipals,
          studioLocation: studio.studioLocation,
          foundationYear: studio.foundationYear,
          studioWebsite: studio.studioWebsite,
          studioAvatarUrl: studio.studioAvatarUrl,
          studioCoverUrl: studio.studioCoverUrl,
        };

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, studio: safeStudio }));
        return;
      }

      if (req.url?.startsWith('/api/studio/my-submissions') && req.method === 'GET') {
        const token = extractStudioTokenFromHeader(req);
        const decoded = verifyStudioToken(token);
        if (!decoded) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Sesión no válida o expirada.' }));
          return;
        }

        const submissionsPath = path.join(dataPath, 'submissions.json');
        const allSubmissions = fs.existsSync(submissionsPath) ? JSON.parse(fs.readFileSync(submissionsPath, 'utf8') || '[]') : [];
        const mySubs = allSubmissions.filter((s: any) =>
          (s.contactEmail || '').toLowerCase() === decoded.email.toLowerCase() ||
          (s.studioId && s.studioId === decoded.studioId)
        );

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, submissions: mySubs }));
        return;
      }

      if (req.url?.startsWith('/api/editorial/submissions/status') && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', () => {
          try {
            const { id, status } = JSON.parse(body);
            const submissionsPath = path.join(dataPath, 'submissions.json');
            let submissions = fs.existsSync(submissionsPath)
              ? JSON.parse(fs.readFileSync(submissionsPath, 'utf8') || '[]')
              : [];
            submissions = submissions.map((sub: any) => sub.id === id ? { ...sub, status, updatedAt: new Date().toISOString() } : sub);
            fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2), 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, submissions }));
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (req.url?.startsWith('/api/editorial/submissions') && req.method === 'GET') {
        try {
          const submissionsPath = path.join(dataPath, 'submissions.json');
          const submissions = fs.existsSync(submissionsPath)
            ? JSON.parse(fs.readFileSync(submissionsPath, 'utf8') || '[]')
            : [];
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, submissions }));
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e.message }));
        }
        return;
      }

      if (req.url?.startsWith('/api/editorial/submissions') && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => body += chunk);
        req.on('end', async () => {
          try {
            const submission = JSON.parse(body);

            // Registro / Actualización Segura de Cuenta de Estudio (Cifrado scrypt)
            const studiosPath = path.join(dataPath, 'studios.json');
            let studios = fs.existsSync(studiosPath) ? JSON.parse(fs.readFileSync(studiosPath, 'utf8') || '[]') : [];
            const cleanEmail = (submission.contactEmail || '').toLowerCase().trim();
            let studio = studios.find((s: any) => s.email.toLowerCase() === cleanEmail);

            if (!studio && submission.studioPassword) {
              studio = {
                id: `studio-${Date.now()}`,
                email: cleanEmail,
                passwordHash: hashStudioPassword(submission.studioPassword),
                studioName: submission.studioName || '',
                studioPrincipals: submission.studioPrincipals || '',
                studioLocation: submission.studioLocation || '',
                foundationYear: submission.foundationYear || '',
                studioWebsite: submission.studioWebsite || '',
                studioAvatarUrl: submission.studioAvatarUrl || '',
                studioCoverUrl: submission.studioCoverUrl || '',
                createdAt: new Date().toISOString(),
              };
              studios.push(studio);
              fs.writeFileSync(studiosPath, JSON.stringify(studios, null, 2), 'utf8');
            } else if (studio && submission.studioPassword && !studio.passwordHash) {
              studio.passwordHash = hashStudioPassword(submission.studioPassword);
              fs.writeFileSync(studiosPath, JSON.stringify(studios, null, 2), 'utf8');
            }

            const studioToken = studio ? generateStudioToken(studio) : null;

            // Guardar propuesta en submissions.json
            const safeSubmissionToStore = { ...submission };
            delete safeSubmissionToStore.studioPassword;

            const submissionsPath = path.join(dataPath, 'submissions.json');
            const submissions = fs.existsSync(submissionsPath)
              ? JSON.parse(fs.readFileSync(submissionsPath, 'utf8') || '[]')
              : [];

            const newEntry = {
              id: `sub-${Date.now()}`,
              studioId: studio ? studio.id : undefined,
              status: 'pendiente_curaduria',
              receivedAt: new Date().toISOString(),
              ...safeSubmissionToStore
            };
            submissions.unshift(newEntry);
            fs.writeFileSync(submissionsPath, JSON.stringify(submissions, null, 2), 'utf8');

            // Enviar notificaciones vía Resend
            const resendKey = getResendApiKey();
            if (resendKey) {
              const editorEmail = process.env.RECIPIENT_EMAIL || 'ecuadorianarch@gmail.com';
              const notifySubject = `📐 Nueva Propuesta: ${submission.projectTitle || 'Sin título'} — ${submission.studioName || 'Estudio'}`;
              const notifyHtml = `
                <div style="font-family:sans-serif; background:#09090B; color:#E4E4E7; padding:32px; border-radius:8px;">
                  <h1 style="color:#FFF; font-size:20px;">Nueva Propuesta Recibida para Curaduría</h1>
                  <p><strong>Estudio:</strong> ${submission.studioName || 'N/A'} (${submission.studioLocation || 'Ecuador'})</p>
                  <p><strong>Titulares:</strong> ${submission.studioPrincipals || 'N/A'}</p>
                  <p><strong>Contacto:</strong> ${submission.contactEmail} · ${submission.contactPhone || 'N/A'}</p>
                  <p><strong>Web/IG:</strong> ${submission.studioWebsite || 'N/A'}</p>
                  <hr style="border-color:#27272A; margin:20px 0;" />
                  <h2 style="color:#FFF; font-size:16px;">Ficha Técnica</h2>
                  <p><strong>Obra:</strong> ${submission.projectTitle} (${submission.projectYear || 'Reciente'})</p>
                  <p><strong>Ubicación:</strong> ${submission.projectLocation || 'N/A'}</p>
                  <p><strong>Área:</strong> ${submission.builtArea || 'N/A'}</p>
                  <p><strong>Fotografía:</strong> ${submission.photographers || 'N/A'}</p>
                  <p><strong>Resumen:</strong> ${submission.shortSummary || 'N/A'}</p>
                  <hr style="border-color:#27272A; margin:20px 0;" />
                  <h2 style="color:#FFF; font-size:16px;">Mano de Obra &amp; Oficio</h2>
                  <p><strong>Maestro Mayor:</strong> ${submission.maestroMayorName || 'No indicado'} (${submission.maestroMayorSpecialty || 'N/A'})</p>
                  <p><strong>Cuadrilla:</strong> ${submission.constructionCrew || 'N/A'}</p>
                  <hr style="border-color:#27272A; margin:20px 0;" />
                  <h2 style="color:#FFF; font-size:16px;">Curaduría Crítica</h2>
                  <p><strong>Contexto:</strong> ${submission.contextRelation || 'N/A'}</p>
                  <p><strong>Usuarios:</strong> ${submission.usersAppropriation || 'N/A'}</p>
                  <p><strong>Materialidad:</strong> ${submission.materialityTectonics || 'N/A'}</p>
                  <p><strong>Memoria:</strong> ${submission.fullDescription || 'Ver enlace'}</p>
                  <hr style="border-color:#27272A; margin:20px 0;" />
                  <p style="background:#18181B; padding:16px; border-radius:6px;">
                    📂 <strong>Carpeta Cloud:</strong> <a href="${submission.cloudStorageUrl}" style="color:#38BDF8;" target="_blank">${submission.cloudStorageUrl}</a>
                  </p>
                </div>
              `;

              // 1. Notificación al equipo editorial
              fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  from: 'Ecuadorian Architecture Editorial <editorial@ecuadorianarch.com>',
                  to: [editorEmail],
                  subject: notifySubject,
                  html: notifyHtml
                })
              }).catch(err => console.error('[Resend Dev Editor Error]:', err));

              // 2. Confirmación al arquitecto / estudio postulante
              if (submission.contactEmail && submission.contactEmail.includes('@')) {
                const confirmationHtml = `
                  <div style="font-family:sans-serif; background:#FFFFFF; color:#18181B; padding:32px; border:1px solid #E4E4E7; border-radius:12px; max-width:600px; margin:0 auto;">
                    <h1 style="font-size:20px; color:#000; text-transform:uppercase; margin-bottom:4px;">Ecuadorian Architecture</h1>
                    <p style="font-size:13px; color:#71717A; margin-top:0;">Comité Curatorial y Editorial</p>
                    <hr style="border:none; border-top:1px solid #E4E4E7; margin:20px 0;" />
                    <p style="font-size:15px; line-height:1.6;">
                      Hola <strong>${submission.studioName || 'Colega Arquitecto/a'}</strong>,
                    </p>
                    <p style="font-size:14px; line-height:1.6; color:#3F3F46;">
                      Hemos recibido exitosamente el expediente y documentación de tu obra <strong>${submission.projectTitle || 'propuesta'}</strong> para el proceso de curaduría crítica en Ecuadorian Architecture.
                    </p>
                    <div style="background:#F4F4F5; padding:16px; border-radius:8px; margin:20px 0; font-size:13px; color:#27272A; line-height:1.6;">
                      <p style="margin:0 0 6px 0;"><strong>• Estado inicial:</strong> Pendiente de Curaduría</p>
                      <p style="margin:0 0 6px 0;"><strong>• Tiempo de revisión:</strong> De 3 a 5 días hábiles</p>
                      <p style="margin:0;"><strong>• Acceso a tu perfil:</strong> Tu cuenta de estudio ha quedado registrada. Puedes iniciar sesión en <a href="https://ecuadorianarch.com" style="color:#000; font-weight:bold;">ecuadorianarch.com</a> con este correo (<strong>${submission.contactEmail}</strong>) para consultar el estatus en vivo de tus obras enviadas.</p>
                    </div>
                    <p style="font-size:13px; color:#71717A;">
                      Agradecemos tu confianza en compartir tu producción arquitectónica para la memoria colectiva del país.
                    </p>
                    <hr style="border:none; border-top:1px solid #E4E4E7; margin:20px 0;" />
                    <p style="font-size:12px; color:#A1A1AA; margin:0;">
                      Ecuadorian Architecture · Archivo Crítico y Editorial · Quito, Ecuador
                    </p>
                  </div>
                `;

                fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${resendKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    from: 'Ecuadorian Architecture Editorial <editorial@ecuadorianarch.com>',
                    to: [submission.contactEmail],
                    subject: `📐 Confirmación de recepción: ${submission.projectTitle || 'Tu propuesta'} — Ecuadorian Architecture`,
                    html: confirmationHtml
                  })
                }).catch(err => console.error('[Resend Dev Studio Confirm Error]:', err));
              }
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              id: newEntry.id,
              token: studioToken,
              studio: studio ? {
                id: studio.id,
                email: studio.email,
                studioName: studio.studioName,
                studioPrincipals: studio.studioPrincipals,
                studioLocation: studio.studioLocation,
                foundationYear: studio.foundationYear,
                studioWebsite: studio.studioWebsite,
                studioAvatarUrl: studio.studioAvatarUrl,
                studioCoverUrl: studio.studioCoverUrl,
              } : null
            }));
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message }));
          }
        });
        return;
      }

      if (req.url?.startsWith('/api/')) {
        const endpoint = req.url.split('?')[0];
        let filename = '';
        if (endpoint === '/api/site-config') filename = 'siteConfig.json';
        else if (endpoint === '/api/projects') filename = 'projects.json';
        else if (endpoint === '/api/articles') filename = 'articles.json';
        else if (endpoint === '/api/academia') filename = 'academia.json';
        else if (endpoint === '/api/territorios') filename = 'territorios.json';
        else if (endpoint === '/api/community-notes') filename = 'communityNotes.json';
        else if (endpoint === '/api/authors') filename = 'authors.json';
        else if (endpoint === '/api/photographers') filename = 'photographers.json';
        else if (endpoint === '/api/master-builders') filename = 'masterBuilders.json';
        else if (endpoint === '/api/ad-brands') filename = 'adBrands.json';
        else if (endpoint === '/api/ad-campaigns') filename = 'adCampaigns.json';
        else if (endpoint === '/api/ad-placements') filename = 'adPlacements.json';
        else if (endpoint === '/api/ad-analytics') filename = 'adAnalytics.json';
        else if (endpoint === '/api/ad-events') filename = 'adEvents.json';
        else if (endpoint === '/api/feedback') filename = 'feedback.json';
        else if (endpoint === '/api/project-submissions') filename = 'projectSubmissions.json';
        else if (endpoint === '/api/subscribers' || endpoint === '/api/subscribe') filename = 'subscribers.json';
        else if (endpoint === '/api/site-metrics' || endpoint === '/api/metrics') filename = 'siteMetrics.json';

        if (filename) {
          const filePath = path.join(dataPath, filename);

          if (req.method === 'DELETE' && (endpoint === '/api/subscribers' || endpoint === '/api/subscribe')) {
            const urlObj = new URL(req.url, 'http://localhost:5173');
            const queryId = urlObj.searchParams.get('id');
            if (!queryId) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Falta el id del suscriptor a eliminar.' }));
              return;
            }
            const currentSubs = fs.existsSync(filePath)
              ? JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]')
              : [];
            const nextSubs = currentSubs.filter((s: any) => s.id !== queryId);
            fs.writeFileSync(filePath, JSON.stringify(nextSubs, null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, remaining: nextSubs.length }));
            return;
          }

          if (req.method === 'GET') {
            if (fs.existsSync(filePath)) {
              const data = fs.readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(data);
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'Not found' }));
            }
            return;
          } else if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk: any) => body += chunk);
            req.on('end', () => {
              try {
                // If this is a subscription action with a single { email, section, honeypot }
                if ((endpoint === '/api/subscribe' || endpoint === '/api/subscribers') && body) {
                  const parsed = JSON.parse(body);
                  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.email) {
                    if (parsed.hp || parsed.honeypot) {
                      // Anti-spam silent pass
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ success: true, spam: true }));
                      return;
                    }
                    const email = String(parsed.email).trim().toLowerCase();
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                      res.statusCode = 400;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify({ error: 'Dirección de correo electrónico inválida.' }));
                      return;
                    }
                    const currentSubs = fs.existsSync(filePath)
                      ? JSON.parse(fs.readFileSync(filePath, 'utf-8') || '[]')
                      : [];
                    const exists = currentSubs.find((s: any) => s.email?.toLowerCase() === email);
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

                      // Sincronizar incremento de nuevo lead en siteMetrics.json
                      try {
                        const metricsFile = path.join(dataPath, 'siteMetrics.json');
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
                    res.end(JSON.stringify({
                      success: true,
                      alreadySubscribed: Boolean(exists),
                      message: '¡Gracias por querer ser parte de esta conversación! Te avisaremos cuando haya nuevas publicaciones en EcuadorianArchitecture.',
                    }));
                    return;
                  }
                }

                fs.writeFileSync(filePath, body, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, updated: filename }));
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
            return;
          }
        }
      }

      // Rewrite /admin route to /admin.html
      if (req.url === '/admin' || req.url === '/admin/') {
        req.url = '/admin.html';
      }

      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: [
        '**/src/data/**',
        '**/public/images/**',
        '**/public/uploads/**',
        '**/.git/**',
        '**/.chrome*/**',
        '**/backups/**',
        '**/*.cjs',
      ],
    },
  },
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html'),
      },
    },
  },
});
