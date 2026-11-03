import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

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

        if (filename) {
          const filePath = path.join(dataPath, filename);
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
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html'),
      },
    },
  },
});
