/**
 * Clean URL Navigation & Routing Utility for Ecuadorian Architecture
 * 
 * Supports ArchDaily/Dezeen standard clean path URLs:
 * - / (Home)
 * - /proyectos, /academia, /territorios (Catalogs)
 * - /proyectos/:slug, /academia/:slug, /territorios/:slug (Project Detail)
 * - /acerca-de-ea (About)
 * 
 * Includes full backward-compatibility with legacy hash routes (#proyectos, #proyecto-id).
 */

export interface ParsedRoute {
  view: 'home' | 'catalog' | 'project-detail' | 'acerca';
  catalogSection?: 'proyectos' | 'academia' | 'territorios';
  projectId?: string;
  advertiserToken?: string | null;
  reportToken?: string | null;
  targetTab?: 'proyectos' | 'academia' | 'territorios' | 'acerca';
}

export function parseCurrentRoute(): ParsedRoute {
  if (typeof window === 'undefined') {
    return { view: 'home' };
  }

  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const hash = window.location.hash.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);

  // 1. Check Advertiser & Report tokens
  const advertiserToken =
    searchParams.get('anunciante') ||
    searchParams.get('ad-advertiser') ||
    searchParams.get('portal') ||
    (hash.startsWith('#anunciante=') ? window.location.hash.replace('#anunciante=', '') : null);

  const reportToken =
    searchParams.get('ad-report') ||
    searchParams.get('token') ||
    (hash.startsWith('#ad-report=') ? window.location.hash.replace('#ad-report=', '') : null);

  if (advertiserToken) {
    return { view: 'home', advertiserToken };
  }
  if (reportToken) {
    return { view: 'home', reportToken };
  }

  // 2. Backward compatibility: Handle Legacy Hashes if present
  if (hash === '#admin') {
    window.open('/admin.html', '_blank');
    window.location.hash = '';
  } else if (hash.startsWith('#proyecto-')) {
    const id = hash.replace('#proyecto-', '');
    return { view: 'project-detail', projectId: id };
  } else if (hash === '#proyectos' || hash === '#catalogo') {
    return { view: 'catalog', catalogSection: 'proyectos' };
  } else if (hash === '#academia') {
    return { view: 'catalog', catalogSection: 'academia' };
  } else if (hash === '#territorios' || hash === '#territorio') {
    return { view: 'catalog', catalogSection: 'territorios' };
  } else if (hash === '#acerca-de-ea' || hash === '#acerca') {
    return { view: 'acerca', targetTab: 'acerca' };
  }

  // 3. Clean Path-based Routing (ArchDaily / Dezeen standard)
  const segments = path.split('/').filter(Boolean);
  const deckParam = searchParams.get('deck') || searchParams.get('tab');
  const validDeck = (deckParam === 'academia' || deckParam === 'territorios' || deckParam === 'proyectos') ? deckParam : undefined;

  if (segments.length === 0 || path === '/' || path === '/home') {
    return { view: 'home', targetTab: validDeck };
  }

  const first = segments[0].toLowerCase();
  const second = segments[1];

  if (first === 'acerca-de-ea' || first === 'acerca') {
    return { view: 'acerca', targetTab: 'acerca' };
  }

  if (first === 'proyectos') {
    if (second) {
      return { view: 'project-detail', projectId: decodeURIComponent(second), catalogSection: 'proyectos' };
    }
    return { view: 'catalog', catalogSection: 'proyectos' };
  }

  if (first === 'academia') {
    if (second) {
      return { view: 'project-detail', projectId: decodeURIComponent(second), catalogSection: 'academia' };
    }
    return { view: 'catalog', catalogSection: 'academia' };
  }

  if (first === 'territorios') {
    if (second) {
      return { view: 'project-detail', projectId: decodeURIComponent(second), catalogSection: 'territorios' };
    }
    return { view: 'catalog', catalogSection: 'territorios' };
  }

  // Fallback to home
  return { view: 'home' };
}

/**
 * Pushes clean state to browser history without page reload
 */
export function pushAppRoute(url: string) {
  if (typeof window !== 'undefined' && window.history && window.history.pushState) {
    if (window.location.pathname !== url) {
      window.history.pushState({ path: url }, '', url);
    }
  }
}

/**
 * Replaces current browser history entry
 */
export function replaceAppRoute(url: string) {
  if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
    window.history.replaceState({ path: url }, '', url);
  }
}
