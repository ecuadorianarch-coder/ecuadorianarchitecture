import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import { ProjectModuleDefinition } from './projectModules';

export interface AuthenticFolderContainerProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  modules: ProjectModuleDefinition[];
  children: React.ReactNode;
}

interface TabGeometryInfo {
  xs: number;
  xe: number;
  center: number;
  title: string;
  subTitle?: string;
}

interface DepthStyle {
  yBase: number;
  yCorner: number;
  hExtra: number;
}

const DEPTH_STYLES: Record<number, DepthStyle> = {
  0: {
    yBase: 161.83,
    yCorner: 174.47,
    hExtra: 0,
  },
  1: {
    yBase: 144.24,
    yCorner: 156.88,
    hExtra: 17.63,
  },
  2: {
    yBase: 128.67,
    yCorner: 141.31,
    hExtra: 33.20,
  },
  3: {
    yBase: 107.67,
    yCorner: 120.31,
    hExtra: 54.16,
  },
};

const getDepthStyle = (depth: number): DepthStyle => {
  if (DEPTH_STYLES[depth]) {
    return DEPTH_STYLES[depth];
  }
  const yBase = 161.83 - 17.59 * depth;
  return {
    yBase,
    yCorner: yBase + 12.64,
    hExtra: 161.83 - yBase,
  };
};

/**
 * Computes tab horizontal boundaries and centers dynamically for any number of modules N.
 * If N === 4 and standard modules are present, matches exact Illustrator geometry to 2 decimal places.
 * For N === 2 or N === 3, smoothly spreads tabs across the shoulder without leaving gaps.
 */
const computeTabGeometries = (
  modules: ProjectModuleDefinition[]
): Record<string, TabGeometryInfo> => {
  const N = modules.length;

  // Exact canonical Illustrator coordinates for standard 4 tabs
  if (
    N === 4 &&
    modules[0].id === 'resena' &&
    modules[1].id === 'critica' &&
    modules[2].id === 'podcast' &&
    modules[3].id === 'obra-viva'
  ) {
    return {
      resena: {
        xs: 105.81,
        xe: 249.17,
        center: 177.5,
        title: 'RESENA',
      },
      critica: {
        xs: 263.98,
        xe: 407.35,
        center: 335.6,
        title: 'CRITICA',
      },
      podcast: {
        xs: 428.92,
        xe: 572.29,
        center: 500.6,
        title: 'PODCAST',
      },
      'obra-viva': {
        xs: 607.25,
        xe: 750.62,
        center: 678.9,
        title: 'NOTAS',
        subTitle: 'DE LA COMUNIDAD',
      },
    };
  }

  // Dynamic distribution over top shoulder: X in [105.81, 750.62]
  const X_START = 105.81;
  const X_END = 750.62;
  const totalSpan = X_END - X_START;

  let tabWidth = 143.37;
  if (N === 2) {
    tabWidth = 220;
  } else if (N === 3) {
    tabWidth = 175;
  } else if (N >= 5) {
    tabWidth = Math.max(90, (totalSpan - (N - 1) * 12) / N);
  }

  const totalTabWidth = tabWidth * N;
  const remainingSpace = Math.max(0, totalSpan - totalTabWidth);
  const gap = N > 1 ? remainingSpace / (N - 1) : 0;

  const result: Record<string, TabGeometryInfo> = {};
  modules.forEach((mod, idx) => {
    const xs = X_START + idx * (tabWidth + gap);
    const xe = xs + tabWidth;
    const center = xs + tabWidth / 2;
    result[mod.id] = {
      xs,
      xe,
      center,
      title: mod.title,
      subTitle: mod.subTitle,
    };
  });

  return result;
};

/**
 * Returns ordered sheets from backmost (highest depth, drawn first) to frontmost (depth 0, drawn last).
 * Dynamic for any number of modules.
 */
const getOrderedSheetsForTabs = (
  modules: ProjectModuleDefinition[],
  active: string
): { tabKey: string; depth: number }[] => {
  const inactive = modules.filter((m) => m.id !== active);
  const result: { tabKey: string; depth: number }[] = [];

  // Inactive sheets take depths 1, 2, ..., N-1 in original sequence
  inactive.forEach((mod, idx) => {
    result.push({ tabKey: mod.id, depth: idx + 1 });
  });

  // Active sheet always takes depth 0 (foreground)
  result.push({ tabKey: active, depth: 0 });

  // Render order: descending depth (back to front)
  return result.sort((a, b) => b.depth - a.depth);
};

const MODULE_PAPER_THEMES: Record<
  string,
  {
    bg: string;
    tabBgActive: string;
    tabBgInactive: string;
    label: string;
    edgeAccent: string;
  }
> = {
  resena: {
    bg: '#FFFFFF',
    tabBgActive: '#FFFFFF',
    tabBgInactive: '#EDEDED',
    label: 'EXPEDIENTE 01 // RESEÑA',
    edgeAccent: '#E8E5DD',
  },
  critica: {
    bg: '#FFFFFF',
    tabBgActive: '#FFFFFF',
    tabBgInactive: '#EDEDED',
    label: 'EXPEDIENTE 02 // CRÍTICA',
    edgeAccent: '#D8D4CA',
  },
  podcast: {
    bg: '#FFFFFF',
    tabBgActive: '#FFFFFF',
    tabBgInactive: '#DADADA',
    label: 'EXPEDIENTE 03 // PODCAST',
    edgeAccent: '#C2BCB1',
  },
  'obra-viva': {
    bg: '#FFFFFF',
    tabBgActive: '#FFFFFF',
    tabBgInactive: '#FAF9F5',
    label: 'EXPEDIENTE 04 // NOTAS DE LA COMUNIDAD',
    edgeAccent: '#DFDACF',
  },
};

export const AuthenticFolderContainer: React.FC<AuthenticFolderContainerProps> = ({
  activeTab,
  onSelectTab,
  modules,
  children,
}) => {
  // Ensure valid safe active tab
  const safeActiveTab = modules.some((m) => m.id === activeTab)
    ? activeTab
    : modules[0]?.id || 'resena';

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [contentHeight, setContentHeight] = useState<number>(850);
  const measureRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // Dynamic references map for physical sheet layers (desktop SVG)
  const sheetRefs = useRef<Record<string, SVGGElement | null>>({});

  // Dynamic references for mobile physical paper sheets & choreography (< 768px)
  const mobileFolderContainerRef = useRef<HTMLDivElement>(null);
  const mobileBodyCardRef = useRef<HTMLDivElement>(null);
  const mobileBackLayer1Ref = useRef<HTMLDivElement>(null);
  const mobileBackLayer2Ref = useRef<HTMLDivElement>(null);
  const mobileContentWrapperRef = useRef<HTMLDivElement>(null);
  const mobileTabBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const prevTabRef = useRef<string>(safeActiveTab);
  const isAnimatingRef = useRef(false);

  // Measure content dynamically and update folder height
  useLayoutEffect(() => {
    if (!measureRef.current) return;

    const updateHeight = () => {
      if (measureRef.current) {
        const measured = measureRef.current.scrollHeight || measureRef.current.offsetHeight;
        if (measured > 150) {
          setContentHeight(Math.max(480, Math.ceil(measured) + 24));
        }
      }
    };

    updateHeight();

    const ro = new ResizeObserver(() => {
      updateHeight();
    });

    ro.observe(measureRef.current);
    return () => ro.disconnect();
  }, [safeActiveTab, children]);

  // Master Physical Paper Choreography when safeActiveTab changes (Desktop SVG & Mobile HTML)
  useEffect(() => {
    const prevTab = prevTabRef.current;
    if (prevTab === safeActiveTab) {
      return;
    }
    prevTabRef.current = safeActiveTab;

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (isMobile) {
        if (mobileContentWrapperRef.current) {
          gsap.fromTo(
            mobileContentWrapperRef.current,
            { opacity: 0.3 },
            { opacity: 1, duration: 0.15, ease: 'none' }
          );
        }
      } else if (contentWrapperRef.current) {
        gsap.fromTo(
          contentWrapperRef.current,
          { opacity: 0.3 },
          { opacity: 1, duration: 0.15, ease: 'none' }
        );
      }
      return;
    }

    // Kill any running transition to avoid collisions on rapid clicks
    if (activeTimelineRef.current) {
      activeTimelineRef.current.kill();
    }

    const availableIds = modules.map((m) => m.id);
    const prevIdx = availableIds.indexOf(prevTab);
    const nextIdx = availableIds.indexOf(safeActiveTab);
    const dir = nextIdx >= prevIdx ? 1 : -1;

    // -------------------------------------------------------------------------
    // A. MOBILE PHYSICAL PAPER CHOREOGRAPHY (< 768px)
    // -------------------------------------------------------------------------
    if (isMobile) {
      isAnimatingRef.current = true;
      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
          if (mobileBodyCardRef.current) {
            gsap.set(mobileBodyCardRef.current, { clearProps: 'y,x,rotation,scale' });
          }
        },
      });
      activeTimelineRef.current = tl;

      // 1. Newly active tab pops & settles with elastic spring
      const activeBtn = mobileTabBtnRefs.current[safeActiveTab];
      if (activeBtn) {
        tl.fromTo(
          activeBtn,
          { y: -12, scale: 1.05 },
          { y: 0, scale: 1, duration: 0.38, ease: 'back.out(1.5)' },
          0
        );
      }

      // 2. Folder body: smooth gentle paper settle without screen shake
      if (mobileBodyCardRef.current) {
        tl.fromTo(
          mobileBodyCardRef.current,
          {
            y: -8,
            opacity: 0.92,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          },
          0
        );
      }

      // 3. Background stacked sheet layers physical recoil (if present)
      const layers = [mobileBackLayer1Ref.current, mobileBackLayer2Ref.current].filter(Boolean);
      if (layers.length > 0) {
        tl.fromTo(
          layers,
          { y: 6, x: -dir * 3, scale: 0.994 },
          { y: 0, x: 0, scale: 1, duration: 0.38, ease: 'back.out(1.2)', stagger: 0.02 },
          0.02
        );
      }

      // 4. Content inside front sheet smoothly fades & reveals
      if (mobileContentWrapperRef.current) {
        tl.fromTo(
          mobileContentWrapperRef.current,
          { opacity: 0.25, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' },
          0.05
        );
      }

      return;
    }

    // -------------------------------------------------------------------------
    // B. DESKTOP SVG PAPER CHOREOGRAPHY (>= 768px)
    // -------------------------------------------------------------------------
    const geometries = computeTabGeometries(modules);
    const tabCenter = geometries[safeActiveTab]?.center || 400;

    const targetEl = sheetRefs.current[safeActiveTab];
    const allEls = availableIds
      .map((id) => sheetRefs.current[id])
      .filter(Boolean) as SVGGElement[];
    const otherEls = allEls.filter((el) => el !== targetEl);

    isAnimatingRef.current = true;
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        // Clean all props and ensure resting state
        gsap.set(allEls, { clearProps: 'y,x,rotation,scale,filter' });
      },
    });
    activeTimelineRef.current = tl;

    // STEP 1: Newly promoted front sheet glides down from 3D flight elevation into foreground
    if (targetEl) {
      targetEl.setAttribute('filter', 'url(#sheet-lift-shadow)');

      tl.fromTo(
        targetEl,
        {
          y: -75,
          x: dir * 14,
          rotation: dir * 2.2,
          scale: 1.028,
          transformOrigin: `${tabCenter}px 140px`,
        },
        {
          y: 0,
          x: 0,
          rotation: 0,
          scale: 1,
          duration: 0.44,
          ease: 'power3.out',
          onComplete: () => {
            targetEl.removeAttribute('filter');
          },
        },
        0
      );
    }

    // STEP 2: Underlying background sheets recoil and cushion into their new depth positions
    if (otherEls.length > 0) {
      tl.fromTo(
        otherEls,
        {
          y: 12,
          rotation: -dir * 0.9,
          scale: 0.994,
        },
        {
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.40,
          ease: 'back.out(1.15)',
          stagger: 0.025,
        },
        0.03
      );
    }

    // STEP 3: Content inside front sheet smoothly fades and reveals
    if (contentWrapperRef.current) {
      tl.fromTo(
        contentWrapperRef.current,
        { opacity: 0.25, y: 14 },
        { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out' },
        0.06
      );
    }
  }, [safeActiveTab, modules, isMobile]);

  const handleTabClick = (tabId: string) => {
    if (tabId === safeActiveTab) return;
    onSelectTab(tabId);
  };

  const H = contentHeight;
  const totalHeight = 175 + H + 40;
  const tabGeometries = computeTabGeometries(modules);

  // Render individual sheet dynamically based on assigned depth
  const renderSheet = (tabKey: string, depth: number) => {
    const isActive = depth === 0;
    const geom = tabGeometries[tabKey];
    if (!geom) return null;

    const moduleDef = modules.find((m) => m.id === tabKey);
    const style = getDepthStyle(depth);

    const { xs, xe, center, title, subTitle } = geom;
    const { yBase, yCorner, hExtra } = style;
    const inactiveFill = moduleDef?.inactiveFillClass || 'af-fill-critica';
    const fillClass = isActive ? 'af-fill-white' : inactiveFill;
    const earWidth = xe - xs - 12.52; // accounts for 6.26 curve radius on both sides

    // Full Cardstock Sheet Body + Tab Ear path
    const sheetPath = `M67.38,${yCorner} c0,-6.98,5.66,-12.64,12.64,-12.64 H${xs} v-37.66 c0,-3.45,2.8,-6.26,6.26,-6.26 h${earWidth} c3.45,0,6.26,2.8,6.26,6.26 v37.66 H777.81 c6.98,0,12.64,5.66,12.64,12.64 v${H + hExtra} c0,6.98,-5.66,12.64,-12.64,12.64 H80.02 c-6.98,0,-12.64,-5.66,-12.64,-12.64 Z`;

    // Authentic inner lip line (paper pocket cut) on background sheets
    const innerLipPath = `M${xe},${yBase} c0,3.45,-2.8,6.26,-6.26,6.26 H${xs + 6.26} c-3.45,0,-6.26,-2.8,-6.26,-6.26`;

    return (
      <g
        key={tabKey}
        id={`sheet-${tabKey}`}
        ref={(el) => {
          sheetRefs.current[tabKey] = el;
        }}
        className="cursor-pointer group"
        onClick={() => handleTabClick(tabKey)}
      >
        {/* Full Cardstock Sheet Body + Tab Ear */}
        <path
          className={`af-stroke ${fillClass} transition-colors duration-150`}
          d={sheetPath}
        />

        {/* Authentic inner lip line on background sheets to give paper pocket depth */}
        {!isActive && (
          <path
            className="af-stroke fill-none"
            d={innerLipPath}
          />
        )}

        {/* Tab Title Typography */}
        {subTitle ? (
          <>
            <text
              className="af-cls-3 select-none"
              x={center}
              y={yBase - 22}
              textAnchor="middle"
              fontWeight={isActive ? 'bold' : 'normal'}
              opacity={isActive ? 1 : 0.85}
            >
              {title}
            </text>
            <text
              className="af-cls-4 select-none"
              x={center}
              y={yBase - 9}
              textAnchor="middle"
              fontWeight={isActive ? 'bold' : 'normal'}
              opacity={isActive ? 1 : 0.85}
            >
              {subTitle}
            </text>
          </>
        ) : (
          <text
            className="af-cls-3 select-none"
            x={center}
            y={yBase - 15.8}
            textAnchor="middle"
            fontWeight={isActive ? 'bold' : 'normal'}
            opacity={isActive ? 1 : 0.85}
          >
            {title}
          </text>
        )}

        {/* Extended transparent click target */}
        <rect
          id={`tab-click-${tabKey}`}
          x={xs - 10}
          y={yBase - 52}
          width={xe - xs + 20}
          height={60}
          fill="transparent"
          pointerEvents="auto"
          onClick={(e) => {
            e.stopPropagation();
            handleTabClick(tabKey);
          }}
        />
      </g>
    );
  };

  const orderedSheets = getOrderedSheetsForTabs(modules, safeActiveTab);

  if (isMobile) {
    const activeTheme = MODULE_PAPER_THEMES[safeActiveTab] || {
      bg: '#FFFFFF',
      tabBgActive: '#FFFFFF',
      tabBgInactive: '#EDEAE3',
      label: `EXPEDIENTE // ${safeActiveTab.toUpperCase()}`,
      edgeAccent: '#DFDACF',
    };
    const activeModuleIndex = modules.findIndex((m) => m.id === safeActiveTab);

    return (
      <div ref={mobileFolderContainerRef} className="w-full relative select-none">
        {/* Authentic Stepped Manila Folder Tabs: Clean, elegant architectural tabs without line artifacts */}
        <div className="flex items-end gap-1 px-0.5 -mb-[1px] z-30 relative w-full">
          {modules.map((mod) => {
            const isActive = mod.id === safeActiveTab;

            return (
              <button
                key={mod.id}
                ref={(el) => {
                  mobileTabBtnRefs.current[mod.id] = el;
                }}
                type="button"
                id={`mobile-tab-${mod.id}`}
                onClick={() => onSelectTab(mod.id)}
                className={`relative flex-1 flex flex-col items-center justify-center transition-all duration-150 cursor-pointer select-none rounded-t-[8px] sm:rounded-t-[10px] ${
                  isActive
                    ? 'bg-white z-30 min-h-[46px] sm:min-h-[50px] pb-1.5 pt-2 border-t-2 border-x-2 border-ea-black shadow-none -translate-y-[1px]'
                    : 'bg-[#EDEAE3] hover:bg-[#E5DFD4] z-10 min-h-[40px] sm:min-h-[43px] pb-1 pt-1.5 border-t border-x border-ea-black/25 opacity-90'
                }`}
              >
                {/* Seamless bridge for active tab merging into the white reading sheet */}
                {isActive && (
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-[2px] left-0 right-0 h-[3px] bg-white z-40 pointer-events-none"
                  />
                )}

                <span
                  className={`font-okcok uppercase tracking-wide leading-none select-none text-center ${
                    isActive
                      ? 'text-[12.5px] sm:text-[14px] text-ea-black font-bold'
                      : 'text-[11.5px] sm:text-[12.5px] text-ea-black/70 font-medium'
                  }`}
                >
                  {mod.title}
                </span>

                {mod.subTitle && (
                  <span
                    className={`font-okcok tracking-tight uppercase select-none text-center mt-0.5 leading-none ${
                      isActive
                        ? 'text-[7.5px] sm:text-[8px] text-ea-black/80 font-medium'
                        : 'text-[6.5px] sm:text-[7.5px] text-ea-black/55'
                    }`}
                  >
                    {mod.subTitle}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Reading Dossier Body: Clean, airy, spacious — Zero harsh black stacked lines, Zero heavy drop-shadow */}
        <div className="relative w-full z-20">
          <div
            ref={mobileBodyCardRef}
            id="dossier-mobile-body"
            className="w-full border border-ea-black/20 bg-white p-4 sm:p-6 md:p-8 relative select-text z-20 rounded-b-[12px] sm:rounded-b-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] will-change-transform"
          >
            {/* Authentic Paper Pocket / Header Meta Bar: Understated and clean */}
            <div className="flex items-center justify-between pb-2.5 mb-5 border-b border-ea-black/10 font-mono text-[9px] sm:text-[9.5px] uppercase tracking-wider text-ea-black/50 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-ea-black/70 rounded-full" />
                <span className="font-bold text-ea-black/85">{activeTheme.label}</span>
              </div>
              <span>HOJA 0{activeModuleIndex + 1} DE 0{modules.length}</span>
            </div>

            {/* Native HTML Content: 100% full scale, 100% legible, animated with GSAP */}
            <div ref={mobileContentWrapperRef} className="w-full">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative select-none">
      <svg
        className="folder-svg w-full h-auto block"
        viewBox={`0 0 841.89 ${totalHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(4px 4px 0px rgba(0,0,0,0.85))',
        }}
      >
        <defs>
          <style>{`
            @font-face {
              font-family: 'OKCOK';
              src: url('/fonts/OKCOK.otf') format('opentype');
            }
            .af-cls-3 { font-size: 19.27px; fill: #1d1d1b; font-family: 'OKCOK', sans-serif; letter-spacing: 0.5px; }
            .af-cls-4 { font-size: 9.9px; fill: #1d1d1b; font-family: 'OKCOK', sans-serif; letter-spacing: 0.5px; }
            .af-stroke { stroke: #1d1d1b; stroke-miterlimit: 10; stroke-width: 1.5px; }
            .af-fill-white { fill: #ffffff; }
            .af-fill-critica { fill: #ededed; }
            .af-fill-podcast { fill: #dadada; }
            .af-fill-notas { fill: #faf9f5; }
          `}</style>

          {/* Deep 3D Lift Shadow for elevated physical sheet */}
          <filter id="sheet-lift-shadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="24" stdDeviation="16" floodColor="#000000" floodOpacity="0.38" />
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* ============================================================= */}
        {/* PHYSICAL STACK OF SHEETS (Dynamically ordered by depth)       */}
        {/* ============================================================= */}
        {orderedSheets.map(({ tabKey, depth }) => renderSheet(tabKey, depth))}

        {/* ============================================================= */}
        {/* EMBEDDED EDITORIAL CONTENT RESTING INSIDE THE FRONT SHEET    */}
        {/* ============================================================= */}
        <foreignObject x="84" y="172" width="690" height={H}>
          <div
            ref={measureRef}
            xmlns="http://www.w3.org/1999/xhtml"
            className="w-full text-ea-black select-text"
            style={{
              padding: '36px 44px 48px 44px',
              boxSizing: 'border-box',
              minHeight: '400px',
            }}
          >
            <div ref={contentWrapperRef}>
              {children}
            </div>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
};
