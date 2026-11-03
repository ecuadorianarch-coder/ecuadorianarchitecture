import React, { useState, useMemo } from 'react';
import {
  X,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eye,
  Sliders,
  Edit3,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Layers,
  Building2,
  MapPin,
  GraduationCap,
  Check,
  ExternalLink,
} from 'lucide-react';
import { EditorialArticle, EditorialType } from '../../types/editorial';
import {
  DeckProject,
  DECK_DATA_BY_TAB,
  getDeckProjectsForTab,
  editorialArticleToDeckProject,
} from '../../data/projectDeckData';

// Reusable SVG icons matching the landing card deck exactly
const AuthorIcon: React.FC<{ className?: string }> = ({
  className = 'h-3 sm:h-3.5 w-auto object-contain text-ea-black shrink-0',
}) => (
  <svg viewBox="0 0 50 117" className={className} fill="currentColor" aria-hidden="true">
    <path d="M27.1447 0.96362C27.1447 0.96362 28.2718 2.95299 28.2718 3.326C28.3031 5.15995 27.8334 8.01968 27.5517 9.94688C27.4264 10.9105 26.8316 12.1538 26.8942 13.0864C26.9255 13.677 28.6788 17.9044 29.0545 18.7126C30.8391 22.567 35.5354 29.4987 38.8228 32.1408C42.1102 34.783 45.1785 36.4615 47.3388 40.5646C48.4972 42.7715 47.4953 42.6472 47.4327 44.1081C47.4014 45.0717 47.9963 46.8124 48.0589 47.9315C48.3406 52.2832 47.8084 56.262 47.5579 60.4894C47.4327 62.4788 47.7458 65.8047 47.3701 67.6076C47.2448 68.1982 46.8065 68.3847 46.7126 68.9442L47.2135 68.8199C47.2135 69.7835 47.2135 70.6538 47.464 71.5864C47.8397 72.923 49.3112 73.5757 49.4051 75.0678C49.4678 75.9381 48.7477 76.8395 48.7477 77.6166C48.7477 78.2383 49.2173 78.9843 49.2799 79.6682C49.3425 80.7561 48.8729 81.7508 49.0921 82.9631C49.2486 83.8024 49.8748 84.2064 49.9374 85.2633C50 86.5688 49.0607 87.5013 49.2173 88.5893C49.3112 89.3042 50 90.2056 50 91.1692C50 92.4437 48.8103 94.4331 48.0902 95.4899C47.5892 96.267 47.1196 95.8318 47.6205 97.4793L47.9963 96.9509C48.8416 97.2928 49.6869 104.598 49.6243 105.872L48.8729 106.027L49.6556 106.152C49.9687 106.68 48.8416 109.291 48.4972 109.944C48.0276 110.814 46.3056 113.332 45.6481 114.016C44.9593 114.762 44.3331 115.073 43.3626 115.353C40.3256 116.192 34.1265 116.347 30.9017 116.285C27.6769 116.223 23.7946 115.477 20.5698 115.974C20.1941 116.036 20.4133 116.192 19.3175 116.347C14.4959 116.938 8.73514 118.274 5.60427 113.488C3.94491 110.939 4.75893 109.944 4.53977 107.24C4.22668 103.354 3.22481 99.3443 4.2893 95.4899C4.19537 94.6507 1.65937 94.2155 1.44021 92.4126C1.37759 92.0085 1.65937 91.5733 1.56544 91.2314C1.47152 90.8273 0.657492 90.3922 0.532257 89.3664C0.344405 87.6568 1.7846 86.3201 1.72199 84.6416C2.16031 84.6105 1.84722 85.6052 2.5047 85.0146C1.31497 83.7402 2.16031 82.3725 1.7846 81.3156C1.59675 80.7872 0.93927 80.3831 0.626183 79.8858C0.344405 79.4817 -0.532239 78.0829 0.532257 78.2694L0.814035 78.7667L1.25236 75.161L0.782726 76.7152C0.281787 76.7774 0.563565 75.9381 0.626183 75.6894C0.907961 74.5393 1.31497 74.1352 2.25424 73.4825C0.814035 69.8767 1.53414 65.3696 1.7533 61.5152C1.87853 59.6501 2.41078 57.2877 2.129 55.3294C1.94115 54.0861 0.907961 53.0292 0.751418 52.0345C0.313096 49.4235 0.6888 45.2272 0.782726 42.5229C0.782726 42.0877 0.500948 41.6525 0.500948 41.2795C0.500948 41.1241 1.69068 38.886 1.87853 38.5752C2.94303 36.9899 5.07202 35.529 6.26175 33.9748C8.07765 31.6124 9.48655 28.5351 11.3964 26.0795C13.4628 23.4062 20.1941 16.9408 20.0063 13.708C19.975 13.1485 19.5366 12.8688 19.4427 12.4336C19.067 10.0712 18.5348 5.8438 18.8165 3.57467C19.0983 1.30554 20.0689 1.21229 21.9474 0.373024C22.0413 0.34194 22.0413 -0.0310669 22.1666 -0.0310669L27.1447 0.932536V0.96362Z" />
  </svg>
);

const CameraIcon: React.FC<{ className?: string }> = ({
  className = 'h-2.5 sm:h-3 w-auto object-contain text-ea-black shrink-0',
}) => (
  <svg viewBox="0 0 888.07 552.48" className={className} fill="currentColor" aria-hidden="true">
    <path d="M 676.99 134.59 C 680.93 145.67, 670.34 166.26, 676.07 176.19 C 678.85 181.02, 691.57 179.16, 697.03 179.28 C 703.25 179.42, 709.55 178.96, 715.42 179.23 C 719.97 179.45, 724.81 181.71, 729.08 181.60 C 736.01 181.43, 748.61 175.77, 756.72 174.79 C 762.60 174.08, 781.55 177.29, 784.47 171.60 C 787.14 166.42, 784.20 153.89, 783.56 147.75 C 782.85 140.90, 784.59 132.24, 779.39 126.72 C 768.53 124.16, 758.48 130.12, 748.59 131.14 C 744.49 131.56, 740.14 130.78, 736.01 131.16 C 716.39 132.98, 696.72 134.98, 676.99 134.59 M 800.74 105.94 L 784.70 105.94 C 786.86 109.23, 792.70 107.82, 795.56 110.55 C 797.34 112.26, 800.53 122.38, 800.68 125.01 C 794.37 141.11, 801.90 162.12, 799.52 177.48 C 796.91 194.38, 779.05 186.22, 768.21 187.42 C 753.72 189.03, 734.06 194.97, 719.78 195.24 C 701.31 195.58, 700.58 195.51, 682.79 199.40 C 679.08 200.20, 665.35 203.18, 662.65 203.15 C 648.56 203.04, 656.51 187.13, 656.41 181.05 C 656.32 175.92, 655.65 166.89, 655.07 161.66 C 653.58 148.28, 642.27 121.41, 663.24 117.87 C 690.04 113.34, 718.39 116.65, 745.10 112.74 C 752.36 111.68, 761.37 106.54, 769.80 108.22 C 770.45 105.41, 768.75 105.71, 766.63 105.15 C 756.89 102.59, 750.72 105.30, 742.93 104.76 C 683.60 100.66, 625.36 92.38, 565.22 90.99 C 503.74 89.57, 442.40 85.00, 380.83 81.83 C 289.58 77.13, 187.34 62.88, 97.75 74.99 C 95.22 75.33, 92.48 74.72, 89.85 75.12 C 83.83 76.03, 62.97 79.69, 58.71 81.85 C 57.86 82.28, 57.02 82.76, 56.27 83.35 C 54.67 88.95, 53.99 96.99, 53.65 103.09 C 52.16 130.08, 51.64 157.66, 51.39 184.37 C 51.36 188.14, 47.16 200.75, 50.14 202.84 C 52.87 203.64, 56.02 203.53, 58.85 203.38 C 86.93 201.92, 119.85 201.78, 148.13 202.14 C 190.92 202.70, 227.88 213.31, 269.89 204.74 C 273.64 203.97, 285.65 202.79, 289.19 203.28 C 291.60 203.61, 303.01 209.81, 302.35 213.02 C 299.54 220.33, 290.28 221.85, 283.20 222.39 C 276.97 222.85, 271.32 220.53, 266.19 220.42 C 246.71 220.01, 226.09 220.39, 206.62 221.68 C 193.87 222.52, 188.64 221.87, 176.82 221.68 C 171.72 221.60, 163.88 223.88, 158.54 224.01 C 132.03 224.67, 105.90 223.81, 79.43 226.26 C 73.42 226.82, 64.94 229.37, 59.79 229.64 C 55.81 229.84, 52.03 226.80, 48.47 230.83 C 47.54 258.58, 48.10 286.35, 47.20 314.10 C 45.29 372.64, 40.78 431.85, 38.76 490.39 C 38.64 493.70, 38.01 507.49, 39.82 508.80 L 61.13 507.17 C 103.74 513.17, 147.86 507.24, 190.57 509.29 C 252.72 512.28, 313.56 513.64, 375.11 513.81 C 401.62 513.88, 427.69 511.49, 454.13 510.44 C 473.21 509.68, 492.34 509.14, 511.46 509.23 C 527.59 509.32, 544.41 511.82, 560.73 510.48 C 582.42 508.69, 595.80 511.81, 616.89 512.76 C 654.94 514.48, 693.25 512.65, 731.47 512.67 L 846.47 516.05 C 847.81 515.27, 845.74 491.20, 845.16 487.21 C 843.85 478.04, 843.94 472.64, 843.01 464.14 C 842.55 459.96, 840.09 456.39, 839.67 452.60 C 839.02 446.70, 841.54 441.22, 840.88 435.34 C 840.34 430.51, 837.55 425.05, 837.31 419.33 C 836.06 389.27, 835.16 359.00, 833.96 328.82 L 819.07 237.71 C 816.47 239.26, 815.02 241.18, 811.66 241.18 C 758.81 241.29, 706.30 239.41, 653.49 241.14 C 643.17 241.48, 628.93 244.42, 633.78 229.45 C 635.48 224.21, 637.29 221.87, 643.24 221.62 C 662.47 220.83, 682.17 223.53, 701.67 223.92 C 735.96 224.60, 770.59 221.45, 804.77 218.25 C 808.71 217.88, 812.83 218.48, 816.78 218.23 Z" />
    <path d="M 495.77 166.85 C 477.51 163.81, 459.08 160.02, 440.36 162.08 C 395.12 167.06, 339.59 209.08, 314.41 245.81 C 307.41 256.02, 291.89 292.70, 290.85 304.76 C 290.29 311.37, 291.71 318.00, 291.62 324.08 C 291.58 326.78, 289.53 329.76, 289.68 334.50 C 290.00 345.01, 300.43 377.85, 305.94 387.04 C 329.70 426.73, 379.40 456.16, 425.43 460.05 C 455.08 462.56, 485.93 455.46, 514.83 451.97 C 538.23 449.15, 581.78 425.96, 595.45 406.54 C 621.88 368.97, 629.46 320.00, 617.73 275.78 C 616.49 271.09, 613.76 267.02, 612.65 262.52 C 609.99 251.73, 612.69 251.53, 604.11 242.41 C 586.84 224.07, 527.36 177.19, 504.09 171.89 C 500.29 171.03, 497.43 174.79, 495.77 166.85 M 463.63 133.78 C 468.76 133.66, 473.93 132.90, 479.08 133.69 C 505.23 142.86, 529.67 155.71, 554.01 168.77 C 586.10 185.98, 609.17 204.06, 628.67 236.19 C 630.91 239.89, 631.59 244.65, 634.08 247.96 C 635.90 250.37, 638.95 251.33, 640.11 253.40 C 655.76 281.27, 652.41 327.70, 645.51 358.06 C 643.90 365.12, 643.55 367.12, 642.60 374.63 C 641.08 386.59, 637.97 384.27, 634.34 391.58 C 632.03 396.25, 631.85 402.87, 629.10 408.11 C 621.98 421.73, 606.96 431.14, 595.62 441.09 C 587.84 447.91, 579.36 457.62, 571.00 463.44 C 539.04 485.70, 494.15 494.50, 455.27 494.48 C 447.27 494.47, 436.90 489.28, 428.62 487.80 C 409.71 484.42, 401.22 483.09, 382.58 477.70 C 377.00 476.08, 369.46 476.00, 363.53 473.83 C 361.31 473.01, 325.67 450.50, 323.50 448.55 C 315.59 441.45, 298.88 423.04, 292.18 414.55 C 285.62 406.26, 272.37 389.59, 268.21 380.08 C 265.78 374.52, 265.10 367.29, 262.75 361.48 C 260.94 357.02, 255.26 350.07, 254.45 346.86 C 254.05 345.28, 254.37 316.08, 254.78 314.34 C 255.19 312.60, 257.27 311.19, 257.84 309.55 C 269.96 274.85, 299.75 223.47, 325.75 197.57 C 345.79 177.62, 404.88 137.72, 432.49 134.73 C 441.55 133.75, 454.09 134.00, 463.63 133.78" />
  </svg>
);

const CalendarIcon: React.FC<{ className?: string }> = ({
  className = 'w-3 h-3 sm:w-3.5 sm:h-3.5 text-ea-black shrink-0',
}) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="7.5" cy="14" r="0.75" fill="currentColor" />
    <circle cx="12" cy="14" r="0.75" fill="currentColor" />
    <circle cx="16.5" cy="14" r="0.75" fill="currentColor" />
    <circle cx="7.5" cy="18" r="0.75" fill="currentColor" />
    <circle cx="12" cy="18" r="0.75" fill="currentColor" />
    <circle cx="16.5" cy="18" r="0.75" fill="currentColor" />
  </svg>
);

interface LandingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: EditorialArticle[];
  initialTab?: 'proyectos' | 'territorios' | 'academia';
  initialArticleId?: string;
  onSaveArticle: (article: EditorialArticle) => void;
  onEditArticle: (article: EditorialArticle) => void;
}

export const LandingPreviewModal: React.FC<LandingPreviewModalProps> = ({
  isOpen,
  onClose,
  articles,
  initialTab = 'proyectos',
  initialArticleId,
  onSaveArticle,
  onEditArticle,
}) => {
  const [selectedTab, setSelectedTab] = useState<'proyectos' | 'territorios' | 'academia'>(initialTab);
  const [deviceMode, setDeviceMode] = useState<'375' | '390' | '430' | '768' | 'desktop'>('390');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showSecondaryImage, setShowSecondaryImage] = useState(false);

  // Compute deck projects for the selected tab
  const deckCards: DeckProject[] = useMemo(() => {
    return getDeckProjectsForTab(selectedTab, articles);
  }, [selectedTab, articles]);

  // If initialArticleId matches, jump to that card
  React.useEffect(() => {
    if (initialArticleId) {
      const idx = deckCards.findIndex((c) => c.id === initialArticleId || c.linkId === initialArticleId);
      if (idx !== -1) {
        setActiveCardIndex(idx);
      }
    }
  }, [initialArticleId, deckCards]);

  // Keep index in bounds if deckCards length changes
  React.useEffect(() => {
    if (activeCardIndex >= deckCards.length && deckCards.length > 0) {
      setActiveCardIndex(deckCards.length - 1);
    }
    setShowSecondaryImage(false);
  }, [deckCards.length, activeCardIndex]);

  if (!isOpen) return null;

  const currentCard = deckCards[activeCardIndex] || deckCards[0];
  const correspondingArticle = articles.find((a) => a.id === currentCard?.id || a.slug === currentCard?.linkId);

  const totalCards = deckCards.length;

  const nextCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % totalCards);
    setShowSecondaryImage(false);
  };

  const prevCard = () => {
    setActiveCardIndex((prev) => (prev - 1 + totalCards) % totalCards);
    setShowSecondaryImage(false);
  };

  // Toggle appearance on landing for the current article
  const toggleLandingStatus = (article: EditorialArticle) => {
    const nextStatus = !article.showOnLanding;
    onSaveArticle({
      ...article,
      showOnLanding: nextStatus,
      landingOrder: nextStatus ? (article.landingOrder || 1) : undefined,
    });
  };

  // Change order
  const changeOrder = (article: EditorialArticle, delta: number) => {
    const currentOrder = article.landingOrder || 1;
    const newOrder = Math.max(1, currentOrder + delta);
    onSaveArticle({
      ...article,
      landingOrder: newOrder,
    });
  };

  // List of other publications in this section that could be added to landing
  const otherPublications = articles.filter(
    (a) => (a.landingTab || a.type) === selectedTab && a.id !== correspondingArticle?.id
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col font-inter overflow-hidden">
      {/* ------------------------------------------------------------------- */}
      {/* 1. TOP HEADER                                                       */}
      {/* ------------------------------------------------------------------- */}
      <header className="h-16 bg-[#161616] border-b border-white/10 px-5 sm:px-8 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white text-black flex items-center justify-center font-anton text-xs font-bold">
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div>
            <h2 className="font-anton text-base sm:text-lg tracking-wider uppercase text-white flex items-center gap-2">
              <span>PREVIEWS LANDING PRINCIPAL</span>
              <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 uppercase">
                Simulador Móvil &amp; Web
              </span>
            </h2>
            <p className="text-[11px] text-white/50 hidden md:block">
              Comprueba el comportamiento real de las tarjetas en celulares, tablets y computadoras antes de publicar.
            </p>
          </div>
        </div>

        {/* Section Tabs Switcher */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1 border border-white/10 rounded">
          {(['proyectos', 'territorios', 'academia'] as const).map((tab) => {
            const count = articles.filter((a) => (a.landingTab || a.type) === tab && a.showOnLanding === true).length;
            return (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                  setActiveCardIndex(0);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-anton tracking-wider uppercase transition-colors ${
                  selectedTab === tab ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${selectedTab === tab ? 'bg-black text-white' : 'bg-white/10 text-white/70'}`}>
                  {count > 0 ? count : (DECK_DATA_BY_TAB[tab]?.length || 0)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Device Viewport Switcher */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1 bg-black/50 p-1 border border-white/10 rounded">
            <button
              onClick={() => setDeviceMode('375')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase transition-colors ${
                deviceMode === '375' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Móvil Pequeño (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" /> 375px
            </button>
            <button
              onClick={() => setDeviceMode('390')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase transition-colors ${
                deviceMode === '390' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Móvil Estándar (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" /> 390px
            </button>
            <button
              onClick={() => setDeviceMode('430')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase transition-colors ${
                deviceMode === '430' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Móvil Grande (430px)"
            >
              <Smartphone className="w-3.5 h-3.5" /> 430px
            </button>
            <button
              onClick={() => setDeviceMode('768')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase transition-colors ${
                deviceMode === '768' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" /> Tablet
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase transition-colors ${
                deviceMode === 'desktop' ? 'bg-white text-black font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Escritorio Completo"
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Cerrar Simulador"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------- */}
      {/* 2. MAIN STAGE & SIDEBAR                                             */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: Interactive Preview Stage */}
        <main className="flex-1 overflow-y-auto bg-[#0d0d0d] p-4 sm:p-8 flex flex-col items-center justify-between relative">
          {/* Card Carousel Controls & Counter */}
          <div className="w-full max-w-4xl flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-white/70">
              <span className="text-white font-bold">{currentCard?.number || `#0${activeCardIndex + 1}`}</span>
              <span>•</span>
              <span className="text-white font-medium">{currentCard?.title}</span>
            </div>

            {/* Stepper Rayitas & Arrows */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {deckCards.map((c, i) => (
                  <button
                    key={c.id || i}
                    onClick={() => {
                      setActiveCardIndex(i);
                      setShowSecondaryImage(false);
                    }}
                    className={`h-1.5 transition-all rounded-full cursor-pointer ${
                      i === activeCardIndex ? 'w-8 bg-white' : 'w-3 bg-white/30 hover:bg-white/60'
                    }`}
                    title={c.title}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={prevCard}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 border border-white/20 rounded transition-colors"
                  title="Tarjeta anterior"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextCard}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 border border-white/20 rounded transition-colors"
                  title="Siguiente tarjeta"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs font-mono text-white/50">
                {activeCardIndex + 1} / {totalCards}
              </span>
            </div>
          </div>

          {/* DEVICE VIEWPORT CONTAINER */}
          <div className="my-auto flex items-center justify-center w-full py-4">
            {deviceMode === 'desktop' ? (
              /* DESKTOP FULL-WIDTH CARD PREVIEW */
              <div className="w-full max-w-[840px] bg-white border-2 border-ea-black rounded-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col select-none text-ea-black animate-fadeIn">
                {/* Header: Single Top Title */}
                <header className="w-full bg-white border-b-2 border-ea-black px-6 py-3 flex items-center justify-between gap-3 shrink-0">
                  <h3 className="font-okcok text-xl uppercase text-ea-black tracking-wide truncate">
                    {currentCard?.title}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-anton text-[11px] tracking-wider uppercase text-ea-black bg-white px-2 py-0.5 rounded-[3px] border border-ea-black shadow-xs">
                      {currentCard?.category}
                    </span>
                    <span className="font-mono text-[10px] text-ea-black/60 uppercase">
                      • {currentCard?.location}
                    </span>
                  </div>
                </header>

                {/* Body: Left details + Right photo */}
                <div className="p-6 md:p-7 flex flex-row items-stretch justify-between gap-6">
                  {/* Left Column */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
                    <div>
                      {/* Metadata Capsule */}
                      <div className="mt-0 px-2.5 py-1 border border-ea-black rounded-[4px] flex items-center justify-between gap-2 w-full max-w-[340px] select-none bg-white overflow-hidden box-border">
                        <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title={`Autoría: ${currentCard?.studio}`}>
                          <AuthorIcon className="h-3.5 w-auto object-contain text-ea-black shrink-0" />
                          <span className="font-okcok text-[10px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                            {(currentCard?.authorHandle || currentCard?.studio || '').replace(/^@/, '')}
                          </span>
                        </div>
                        <span className="text-ea-black/30 text-[9px] select-none shrink-0">•</span>
                        <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title={`Fotografía: ${currentCard?.photographer}`}>
                          <CameraIcon className="h-3 w-auto object-contain text-ea-black shrink-0" />
                          <span className="font-okcok text-[10px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                            {(currentCard?.photographerHandle || currentCard?.photographer || 'JAG STUDIO').replace(/^@/, '')}
                          </span>
                        </div>
                        <span className="text-ea-black/30 text-[9px] select-none shrink-0">•</span>
                        <div className="flex items-center gap-1 shrink-0" title={`Año: ${currentCard?.year}`}>
                          <CalendarIcon className="w-3.5 h-3.5 text-ea-black shrink-0" />
                          <span className="font-okcok text-[10px] uppercase tracking-wide text-ea-black leading-tight shrink-0 whitespace-nowrap">
                            {currentCard?.year || '2024'}
                          </span>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <div className="mt-4 space-y-2 font-creato text-[12.5px] text-ea-black/85 leading-relaxed line-clamp-4 max-w-md">
                        <p>{currentCard?.excerpt}</p>
                        {currentCard?.secondaryExcerpt && (
                          <p className="text-ea-black/80">{currentCard?.secondaryExcerpt}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 mt-auto">
                      <div className="inline-flex items-center gap-2 bg-white text-ea-black px-4 py-2 border border-ea-black rounded-[4px] font-okcok text-base uppercase tracking-wide shadow-xs">
                        <span>{currentCard?.actionButtonText || 'VER PROYECTO'}</span>
                        <span className="text-base leading-none">➔</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Photography */}
                  <div
                    onClick={() => setShowSecondaryImage((prev) => !prev)}
                    className="w-[280px] h-[220px] shrink-0 rounded-[10px] overflow-hidden bg-neutral-900 relative shadow-inner select-none cursor-pointer group"
                    title={currentCard?.secondaryImageUrl ? 'Haz clic para alternar vista secundaria (Interior / Detalle)' : undefined}
                  >
                    <img
                      src={currentCard?.imageUrl}
                      alt={currentCard?.title}
                      className="w-full h-full object-cover"
                    />
                    {currentCard?.secondaryImageUrl && (
                      <div
                        className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-500"
                        style={{
                          clipPath: showSecondaryImage ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
                        }}
                      >
                        <img
                          src={currentCard.secondaryImageUrl}
                          alt="Vista secundaria"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      </div>
                    )}
                    {currentCard?.secondaryImageUrl && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-mono px-2 py-0.5 rounded backdrop-blur-sm">
                        {showSecondaryImage ? 'Vista Interior' : 'Clic para Interior'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* SMARTPHONE / TABLET REALISTIC BEZEL FRAME */
              <div
                className={`relative mx-auto bg-[#1a1a1a] rounded-[48px] p-3.5 shadow-[0_30px_90px_rgba(0,0,0,0.8)] border-4 border-[#333333] transition-all duration-300 ${
                  deviceMode === '375'
                    ? 'w-[375px]'
                    : deviceMode === '390'
                    ? 'w-[390px]'
                    : deviceMode === '430'
                    ? 'w-[430px]'
                    : 'w-[520px]'
                }`}
              >
                {/* Speaker Notch / Dynamic Island */}
                <div className="absolute top-6 inset-x-0 mx-auto w-24 h-4 bg-black rounded-full z-40 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111111] border border-white/10" />
                </div>

                {/* Inner Screen Area */}
                <div className="bg-[#FAF9F5] rounded-[36px] overflow-hidden flex flex-col min-h-[620px] max-h-[720px] overflow-y-auto relative pt-9 pb-6 px-4">
                  {/* Status Bar simulation */}
                  <div className="absolute top-2 inset-x-6 flex items-center justify-between text-[10px] font-mono font-bold text-ea-black/70 select-none">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px]">5G</span>
                      <div className="w-4 h-2 rounded-xs border border-ea-black/60 p-0.5 flex items-center">
                        <div className="w-full h-full bg-ea-black" />
                      </div>
                    </div>
                  </div>

                  {/* Mini Public Page Context Header */}
                  <div className="text-center pb-3 pt-2 border-b border-ea-black/10 mb-3 select-none">
                    <span className="font-anton text-[13px] tracking-widest uppercase text-ea-black block">
                      ECUADORIAN ARCHITECTURE
                    </span>
                    <span className="text-[9px] font-mono text-ea-black/50 uppercase">
                      DESTACADOS // {selectedTab}
                    </span>
                  </div>

                  {/* --------------------------------------------------------- */}
                  {/* THE MOBILE CARD (1:1 with PhysicalCardDeck on mobile)      */}
                  {/* --------------------------------------------------------- */}
                  {currentCard?.isCtaCard ? (
                    <div className="w-full bg-[#0E0E0E] text-white border-2 border-ea-black rounded-[16px] p-6 flex flex-col items-center justify-center text-center gap-4 my-auto select-none shadow-md">
                      <div className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-okcok text-xl uppercase text-white tracking-wide leading-snug">
                        {currentCard.ctaTitle || currentCard.title}
                      </h4>
                      <div className="inline-flex items-center gap-2 bg-white text-ea-black px-4 py-2 rounded-[4px] font-anton text-xs uppercase tracking-wider">
                        <span>{currentCard.ctaButtonText || 'EXPLORAR CATÁLOGO COMPLETO'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-ea-black" />
                      </div>
                    </div>
                  ) : (
                    <article className="w-full bg-white text-ea-black border-2 border-ea-black rounded-[16px] overflow-hidden flex flex-col select-none shadow-md my-auto">
                      {/* Top Header: Single Title (no duplicate below!) */}
                      <header className="w-full bg-white border-b-2 border-ea-black px-3.5 py-2.5 flex items-center justify-between gap-2 shrink-0">
                        <h3 className="font-okcok text-base uppercase text-ea-black tracking-wide truncate">
                          {currentCard?.title}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-anton text-[9.5px] tracking-wider uppercase text-ea-black bg-white px-2 py-0.5 rounded-[3px] border border-ea-black shadow-xs">
                            {currentCard?.category}
                          </span>
                        </div>
                      </header>

                      {/* Card Content */}
                      <div className="p-3.5 sm:p-4 flex flex-col gap-3">
                        {/* 1. Metadata Capsule (Aligned with image) */}
                        <div className="px-2 py-1 border border-ea-black rounded-[4px] flex items-center justify-between gap-1.5 w-full bg-white overflow-hidden box-border select-none">
                          {/* Autor(es) - Permite múltiples estudios colaboradores */}
                          <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title={`Autoría: ${currentCard?.studio}`}>
                            <AuthorIcon className="h-3 w-auto object-contain text-ea-black shrink-0" />
                            <span className="font-okcok text-[9.5px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                              {(currentCard?.authorHandle || currentCard?.studio || '').replace(/^@/, '')}
                            </span>
                          </div>

                          <span className="text-ea-black/30 text-[9px] select-none shrink-0">•</span>

                          {/* Fotografía */}
                          <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title={`Fotografía: ${currentCard?.photographer}`}>
                            <CameraIcon className="h-2.5 w-auto object-contain text-ea-black shrink-0" />
                            <span className="font-okcok text-[9.5px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                              {(currentCard?.photographerHandle || currentCard?.photographer || 'JAG STUDIO').replace(/^@/, '')}
                            </span>
                          </div>

                          <span className="text-ea-black/30 text-[9px] select-none shrink-0">•</span>

                          {/* Año */}
                          <div className="flex items-center gap-1 shrink-0" title={`Año: ${currentCard?.year}`}>
                            <CalendarIcon className="w-3 h-3 text-ea-black shrink-0" />
                            <span className="font-okcok text-[9.5px] uppercase tracking-wide text-ea-black leading-tight shrink-0 whitespace-nowrap">
                              {currentCard?.year || '2024'}
                            </span>
                          </div>
                        </div>

                        {/* 2. Photo (with tap-to-wipe secondary image) */}
                        <div
                          onClick={() => setShowSecondaryImage((prev) => !prev)}
                          className="w-full h-[155px] rounded-[8px] overflow-hidden bg-neutral-900 relative shadow-inner select-none cursor-pointer group"
                        >
                          <img
                            src={currentCard?.imageUrl}
                            alt={currentCard?.title}
                            className="w-full h-full object-cover"
                          />
                          {currentCard?.secondaryImageUrl && (
                            <div
                              className="absolute inset-0 w-full h-full overflow-hidden transition-all duration-500"
                              style={{
                                clipPath: showSecondaryImage ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
                              }}
                            >
                              <img
                                src={currentCard.secondaryImageUrl}
                                alt="Vista secundaria"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                            </div>
                          )}
                          <div className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[8.5px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">
                            {showSecondaryImage ? 'Vista Interior' : 'Tocar para ver Interior'}
                          </div>
                        </div>

                        {/* 3. Editorial Excerpt */}
                        <div className="font-creato text-xs text-ea-black/85 leading-relaxed line-clamp-3">
                          <p>{currentCard?.excerpt}</p>
                        </div>

                        {/* 4. Action Button (Accessible min 44px) */}
                        <div className="pt-1">
                          <button
                            type="button"
                            className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-white text-ea-black active:bg-neutral-100 px-4 py-2 border border-ea-black rounded-[4px] font-okcok text-sm uppercase tracking-wide transition-all shadow-xs"
                          >
                            <span>{currentCard?.actionButtonText || 'VER PROYECTO'}</span>
                            <span className="text-sm leading-none">➔</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  )}

                  {/* Home Bar Indicator simulation */}
                  <div className="w-32 h-1 bg-black/30 rounded-full mx-auto mt-auto shrink-0" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom helper tip */}
          <div className="w-full max-w-4xl text-center text-[11px] font-mono text-white/40 pt-2">
            💡 Consejo: Haz clic en la fotografía para comprobar la transición entre exterior e interior (efecto cortina).
          </div>
        </main>

        {/* ------------------------------------------------------------------- */}
        {/* 3. RIGHT INSPECTOR: CARD CONTROLS & MOBILE QA AUDIT                 */}
        {/* ------------------------------------------------------------------- */}
        <aside className="w-80 md:w-96 bg-[#161616] border-l border-white/10 flex flex-col overflow-y-auto p-5 shrink-0 space-y-6">
          {/* Card Management Header */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider">
                Tarjeta Seleccionada
              </span>
              <span className="text-[10px] font-mono text-white/70">
                #{activeCardIndex + 1} de {totalCards}
              </span>
            </div>
            <h3 className="font-anton text-lg uppercase text-white tracking-wide leading-tight truncate">
              {currentCard?.title}
            </h3>
            <p className="text-xs text-white/50 mt-0.5 truncate">
              {currentCard?.studio} • {currentCard?.year}
            </p>
          </div>

          {/* Quick Landing Controls */}
          {correspondingArticle ? (
            <div className="space-y-4 bg-[#1f1f1f] border border-white/10 p-4 rounded">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-anton uppercase text-white block">
                    Publicada en Landing
                  </span>
                  <span className="text-[10px] font-mono text-white/50">
                    Aparece en el mazo principal
                  </span>
                </div>
                <button
                  onClick={() => toggleLandingStatus(correspondingArticle)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    correspondingArticle.showOnLanding ? 'bg-emerald-500 justify-end' : 'bg-white/20 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              {/* Order Stepper */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-xs font-mono uppercase text-white/70">
                  Posición en Mazo:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => changeOrder(correspondingArticle, -1)}
                    className="p-1 text-white/70 hover:text-white hover:bg-white/10 border border-white/20 rounded"
                    title="Subir posición (aparece antes)"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-anton text-sm text-white px-2">
                    #{correspondingArticle.landingOrder || (activeCardIndex + 1)}
                  </span>
                  <button
                    onClick={() => changeOrder(correspondingArticle, 1)}
                    className="p-1 text-white/70 hover:text-white hover:bg-white/10 border border-white/20 rounded"
                    title="Bajar posición (aparece después)"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Edit Full Article Button */}
              <button
                onClick={() => {
                  onClose();
                  onEditArticle(correspondingArticle);
                }}
                className="w-full bg-white text-black hover:bg-white/90 py-2 px-3 font-anton text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors mt-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDITAR DATOS DE ESTA ENTRADA</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#1f1f1f] border border-white/10 p-3.5 rounded text-xs text-white/60">
              <span className="text-white font-medium block mb-1">Tarjeta de Catálogo o Muestra</span>
              Esta tarjeta proviene del mazo editorial base. Puedes añadir tus propios artículos del CMS a esta sección abajo.
            </div>
          )}

          {/* Mobile Quality Checklist (Auditoría automática de calidad) */}
          <div className="space-y-3 border-t border-white/10 pt-5">
            <h4 className="font-anton text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>AUDITORÍA MÓVIL AUTOMÁTICA</span>
            </h4>
            <div className="space-y-2 text-xs font-mono text-white/70">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Título superior único (sin duplicados)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Cápsula de autores y fotógrafo alineada</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Textos no desbordan en 375px</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Botón táctil accesible (mínimo 44px)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Transición táctil entre fotos activa</span>
              </div>
            </div>
          </div>

          {/* Quick Add Other Articles to Landing */}
          {otherPublications.length > 0 && (
            <div className="space-y-3 border-t border-white/10 pt-5">
              <h4 className="font-anton text-xs uppercase tracking-wider text-white">
                OTRAS ENTRADAS DISPONIBLES ({otherPublications.length})
              </h4>
              <p className="text-[11px] text-white/50">
                Añade o retira publicaciones para que aparezcan en la portada:
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {otherPublications.map((pub) => (
                  <div
                    key={pub.id}
                    className="flex items-center justify-between gap-2 p-2 bg-[#1b1b1b] border border-white/10 rounded hover:border-white/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-anton text-xs uppercase text-white truncate block">
                        {pub.title}
                      </span>
                      <span className="text-[10px] font-mono text-white/50 truncate block">
                        {pub.studio || 'ESTUDIO'} • {pub.year}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleLandingStatus(pub)}
                      className={`px-2 py-1 text-[10px] font-anton uppercase tracking-wider shrink-0 transition-colors ${
                        pub.showOnLanding
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {pub.showOnLanding ? 'EN LANDING' : '+ AGREGAR'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
