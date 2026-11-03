/**
 * Ecuadorian Architecture — Design System Tokens
 * Source of Truth: Figma 3V7IU6R40ynuRVKPnVGHGY
 * 
 * Strict 1:1 visual tokens for typography, geometry, color, and motion.
 */

export const tokens = {
  colors: {
    black: '#000000',
    white: '#ffffff',
    offwhite: '#f7f7f7',
    border: '#c8c8c8',
    muted: 'rgba(0, 0, 0, 0.15)',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },

  typography: {
    fonts: {
      okcok: 'OKCOK, sans-serif',
      creato: '"Creato Display", sans-serif',
      anton: 'Anton, sans-serif',
      inter: 'Inter, sans-serif',
      klein: '"Klein Condensed Trial", sans-serif',
    },
    scales: {
      // Hero & Monumental Displays (OKCOK)
      heroHeadline: {
        fontSize: 'clamp(36px, 5vw, 72px)',
        lineHeight: '1.08',
        fontWeight: '400',
        fontFamily: 'OKCOK',
        textTransform: 'uppercase' as const,
      },
      heroSubtitle: {
        fontSize: 'clamp(16px, 2vw, 24px)',
        lineHeight: '1.3',
        fontWeight: '400',
        fontFamily: 'OKCOK',
        textTransform: 'uppercase' as const,
      },
      // Monograph Headline (OKCOK)
      monographTitle: {
        fontSize: 'clamp(40px, 5.5vw, 72px)',
        lineHeight: '1.1',
        fontWeight: '400',
        fontFamily: 'OKCOK',
        textTransform: 'uppercase' as const,
      },
      // Project Cards (OKCOK 24px)
      cardTitle: {
        fontSize: '24px',
        lineHeight: '36px',
        fontWeight: '400',
        fontFamily: 'OKCOK',
        textTransform: 'uppercase' as const,
      },
      // Category Pillars & Studios (Anton 400)
      studioName: {
        fontSize: '16px',
        lineHeight: '24px',
        fontWeight: '400',
        fontFamily: 'Anton',
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
      },
      pillarHeading: {
        fontSize: 'clamp(28px, 3vw, 36px)',
        lineHeight: '1.2',
        fontWeight: '400',
        fontFamily: 'Anton',
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
      },
      pillarLabel: {
        fontSize: '15px',
        lineHeight: '20px',
        fontWeight: '400',
        fontFamily: 'Anton',
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
      },
      // Architectural Memory & Criticism (Creato Display 400)
      conceptualQuote: {
        fontSize: 'clamp(20px, 2.5vw, 28px)',
        lineHeight: '1.3',
        fontWeight: '400',
        fontFamily: 'OKCOK',
      },
      cardExcerpt: {
        fontSize: '12px',
        lineHeight: '18px',
        fontWeight: '400',
        fontFamily: '"Creato Display"',
      },
      editorialBody: {
        fontSize: '14px',
        lineHeight: '22px',
        fontWeight: '400',
        fontFamily: '"Creato Display"',
      },
      // Search Placeholder (OKCOK 14px)
      searchPlaceholder: {
        fontSize: '14px',
        lineHeight: '21px',
        fontFamily: 'OKCOK',
      },
    },
  },

  layout: {
    maxCanvasWidth: '1440px',
    frameHeight: '900px',
    // Exact component geometries extracted from Figma
    searchCapsule: {
      maxWidth: '420px',
      height: '52px',
      borderWidth: '2px',
      borderRadius: '14px',
    },
    projectCardVertical: {
      width: '345px',
      height: '414px',
      borderWidth: '1px',
    },
    projectCardPanoramic: {
      width: '570px',
      height: '193px',
      borderWidth: '1px',
    },
    criticalTab: {
      width: '306px',
      height: '95px',
      borderWidth: '1px',
    },
    footerContainer: {
      height: '323px',
      logoWidth: '594px',
      logoHeight: '146px',
    },
  },

  borders: {
    card: '1px solid #000000',
    capsule: '2px solid #000000',
    divider: '1px solid #c8c8c8',
    subtle: '1px solid rgba(0, 0, 0, 0.1)',
  },

  radii: {
    none: '0px',
    tag: '2px',
    capsule: '14px',
    full: '9999px',
  },

  motion: {
    timings: {
      micro: 0.2,
      fast: 0.35,
      normal: 0.6,
      editorial: 1.0,
      monumental: 1.4,
    },
    eases: {
      editorial: 'power3.out',
      dramatic: 'expo.out',
      snappy: 'power2.out',
      bounce: 'back.out(1.3)',
      smooth: 'power2.inOut',
    },
    stagger: {
      tight: 0.06,
      normal: 0.1,
      loose: 0.18,
    },
  },

  breakpoints: {
    sm: '430px',   // Mobile large
    md: '768px',   // Tablet portrait
    lg: '1024px',  // Tablet landscape / small laptop
    xl: '1280px',  // Standard laptop
    '2xl': '1440px', // Figma desktop base
  },
} as const;

export type DesignTokens = typeof tokens;
