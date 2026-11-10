import { useEffect, useRef } from 'react';

export function useVisitorTracking(currentView?: string, section?: string) {
  const lastTrackedKeyRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Do not track admin routes as public visitors
    if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/portal')) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const currentPath = window.location.pathname || '/';
    const trackKey = `${today}_${currentPath}_${currentView || 'home'}_${section || ''}`;

    // Prevent duplicate calls for the exact same view within the same session
    if (lastTrackedKeyRef.current === trackKey) return;
    lastTrackedKeyRef.current = trackKey;

    // Check if user is a new unique visitor today
    let isNewVisitor = false;
    try {
      const lastVisitDate = localStorage.getItem('ea_visitor_last_day');
      if (lastVisitDate !== today) {
        isNewVisitor = true;
        localStorage.setItem('ea_visitor_last_day', today);
      }
    } catch {
      isNewVisitor = false;
    }

    // Determine device type
    const width = window.innerWidth;
    const device = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';

    // Determine traffic source
    let source = 'direct_whatsapp';
    const ref = document.referrer?.toLowerCase() || '';
    if (ref.includes('instagram.com') || ref.includes('ig') || ref.includes('l.instagram')) {
      source = 'instagram';
    } else if (ref.includes('whatsapp') || ref.includes('wa.me')) {
      source = 'direct_whatsapp';
    } else if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo')) {
      source = 'google_search';
    } else if (ref && !ref.includes(window.location.hostname)) {
      source = 'referral';
    }

    // Determine section
    const currentSection = section || (currentView === 'catalog' ? 'proyectos' : currentView || 'home');

    // Notify Google Analytics 4 (GA4) on SPA route navigation
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      try {
        (window as any).gtag('event', 'page_view', {
          page_path: window.location.pathname,
          page_location: window.location.href,
          page_title: document.title,
          section: currentSection,
        });
      } catch {
        // Non-blocking fail-safe
      }
    }

    const payload = {
      isNewVisitor,
      device,
      source,
      section: currentSection,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    };

    let beaconSent = false;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        beaconSent = navigator.sendBeacon('/api/track-visit', blob);
      }
    } catch {
      beaconSent = false;
    }

    if (!beaconSent) {
      try {
        fetch('/api/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Non-blocking fail-safe
      }
    }
  }, [currentView, section]);
}
