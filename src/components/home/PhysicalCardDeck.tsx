import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Compass, MapPin, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { DECK_PROJECTS, DECK_DATA_BY_TAB, DeckProject, getDeckProjectsForTab } from '../../data/projectDeckData';
import { SECTION_COPIES, TapeStrip } from '../common/EditorialEmptyState';
import tagProyectosUrl from '../../assets/logos/tag_proyectos.svg';
import tagCiudadUrl from '../../assets/logos/tag_ciudad.svg';
import tagDatosUrl from '../../assets/logos/tag_datos.svg';
import { FigmaSectionTransition, TransitionSectionType } from './FigmaSectionTransition';

gsap.registerPlugin(ScrollTrigger, useGSAP);
if (typeof window !== 'undefined') {
  (window as any).ScrollTrigger = ScrollTrigger;
}

// =============================================================================
// UNIFIED ICONS MATCHING THE PROYECTOS SECTION & FIGMA DOODLES
// =============================================================================
const AuthorIcon: React.FC<{ className?: string }> = ({
  className = 'h-3.5 sm:h-4 w-auto object-contain text-ea-black shrink-0',
}) => (
  <svg viewBox="0 0 50 117" className={className} fill="currentColor" aria-hidden="true">
    <path d="M27.1447 0.96362C27.1447 0.96362 28.2718 2.95299 28.2718 3.326C28.3031 5.15995 27.8334 8.01968 27.5517 9.94688C27.4264 10.9105 26.8316 12.1538 26.8942 13.0864C26.9255 13.677 28.6788 17.9044 29.0545 18.7126C30.8391 22.567 35.5354 29.4987 38.8228 32.1408C42.1102 34.783 45.1785 36.4615 47.3388 40.5646C48.4972 42.7715 47.4953 42.6472 47.4327 44.1081C47.4014 45.0717 47.9963 46.8124 48.0589 47.9315C48.3406 52.2832 47.8084 56.262 47.5579 60.4894C47.4327 62.4788 47.7458 65.8047 47.3701 67.6076C47.2448 68.1982 46.8065 68.3847 46.7126 68.9442L47.2135 68.8199C47.2135 69.7835 47.2135 70.6538 47.464 71.5864C47.8397 72.923 49.3112 73.5757 49.4051 75.0678C49.4678 75.9381 48.7477 76.8395 48.7477 77.6166C48.7477 78.2383 49.2173 78.9843 49.2799 79.6682C49.3425 80.7561 48.8729 81.7508 49.0921 82.9631C49.2486 83.8024 49.8748 84.2064 49.9374 85.2633C50 86.5688 49.0607 87.5013 49.2173 88.5893C49.3112 89.3042 50 90.2056 50 91.1692C50 92.4437 48.8103 94.4331 48.0902 95.4899C47.5892 96.267 47.1196 95.8318 47.6205 97.4793L47.9963 96.9509C48.8416 97.2928 49.6869 104.598 49.6243 105.872L48.8729 106.027L49.6556 106.152C49.9687 106.68 48.8416 109.291 48.4972 109.944C48.0276 110.814 46.3056 113.332 45.6481 114.016C44.9593 114.762 44.3331 115.073 43.3626 115.353C40.3256 116.192 34.1265 116.347 30.9017 116.285C27.6769 116.223 23.7946 115.477 20.5698 115.974C20.1941 116.036 20.4133 116.192 19.3175 116.347C14.4959 116.938 8.73514 118.274 5.60427 113.488C3.94491 110.939 4.75893 109.944 4.53977 107.24C4.22668 103.354 3.22481 99.3443 4.2893 95.4899C4.19537 94.6507 1.65937 94.2155 1.44021 92.4126C1.37759 92.0085 1.65937 91.5733 1.56544 91.2314C1.47152 90.8273 0.657492 90.3922 0.532257 89.3664C0.344405 87.6568 1.7846 86.3201 1.72199 84.6416C2.16031 84.6105 1.84722 85.6052 2.5047 85.0146C1.31497 83.7402 2.16031 82.3725 1.7846 81.3156C1.59675 80.7872 0.93927 80.3831 0.626183 79.8858C0.344405 79.4817 -0.532239 78.0829 0.532257 78.2694L0.814035 78.7667L1.25236 75.161L0.782726 76.7152C0.281787 76.7774 0.563565 75.9381 0.626183 75.6894C0.907961 74.5393 1.31497 74.1352 2.25424 73.4825C0.814035 69.8767 1.53414 65.3696 1.7533 61.5152C1.87853 59.6501 2.41078 57.2877 2.129 55.3294C1.94115 54.0861 0.907961 53.0292 0.751418 52.0345C0.313096 49.4235 0.6888 45.2272 0.782726 42.5229C0.782726 42.0877 0.500948 41.6525 0.500948 41.2795C0.500948 41.1241 1.69068 38.886 1.87853 38.5752C2.94303 36.9899 5.07202 35.529 6.26175 33.9748C8.07765 31.6124 9.48655 28.5351 11.3964 26.0795C13.4628 23.4062 20.1941 16.9408 20.0063 13.708C19.975 13.1485 19.5366 12.8688 19.4427 12.4336C19.067 10.0712 18.5348 5.8438 18.8165 3.57467C19.0983 1.30554 20.0689 1.21229 21.9474 0.373024C22.0413 0.34194 22.0413 -0.0310669 22.1666 -0.0310669L27.1447 0.932536V0.96362Z" />
  </svg>
);

const CameraIcon: React.FC<{ className?: string }> = ({
  className = 'h-3 sm:h-3.5 w-auto object-contain text-ea-black shrink-0',
}) => (
  <svg viewBox="0 0 888.07 552.48" className={className} fill="currentColor" aria-hidden="true">
    <path d="M 676.99 134.59 C 680.93 145.67, 670.34 166.26, 676.07 176.19 C 678.85 181.02, 691.57 179.16, 697.03 179.28 C 703.25 179.42, 709.55 178.96, 715.42 179.23 C 719.97 179.45, 724.81 181.71, 729.08 181.60 C 736.01 181.43, 748.61 175.77, 756.72 174.79 C 762.60 174.08, 781.55 177.29, 784.47 171.60 C 787.14 166.42, 784.20 153.89, 783.56 147.75 C 782.85 140.90, 784.59 132.24, 779.39 126.72 C 768.53 124.16, 758.48 130.12, 748.59 131.14 C 744.49 131.56, 740.14 130.78, 736.01 131.16 C 716.39 132.98, 696.72 134.98, 676.99 134.59 M 800.74 105.94 L 784.70 105.94 C 786.86 109.23, 792.70 107.82, 795.56 110.55 C 797.34 112.26, 800.53 122.38, 800.68 125.01 C 794.37 141.11, 801.90 162.12, 799.52 177.48 C 796.91 194.38, 779.05 186.22, 768.21 187.42 C 753.72 189.03, 734.06 194.97, 719.78 195.24 C 701.31 195.58, 700.58 195.51, 682.79 199.40 C 679.08 200.20, 665.35 203.18, 662.65 203.15 C 648.56 203.04, 656.51 187.13, 656.41 181.05 C 656.32 175.92, 655.65 166.89, 655.07 161.66 C 653.58 148.28, 642.27 121.41, 663.24 117.87 C 690.04 113.34, 718.39 116.65, 745.10 112.74 C 752.36 111.68, 761.37 106.54, 769.80 108.22 C 770.45 105.41, 768.75 105.71, 766.63 105.15 C 756.89 102.59, 750.72 105.30, 742.93 104.76 C 683.60 100.66, 625.36 92.38, 565.22 90.99 C 503.74 89.57, 442.40 85.00, 380.83 81.83 C 289.58 77.13, 187.34 62.88, 97.75 74.99 C 95.22 75.33, 92.48 74.72, 89.85 75.12 C 83.83 76.03, 62.97 79.69, 58.71 81.85 C 57.86 82.28, 57.02 82.76, 56.27 83.35 C 54.67 88.95, 53.99 96.99, 53.65 103.09 C 52.16 130.08, 51.64 157.66, 51.39 184.37 C 51.36 188.14, 47.16 200.75, 50.14 202.84 C 52.87 203.64, 56.02 203.53, 58.85 203.38 C 86.93 201.92, 119.85 201.78, 148.13 202.14 C 190.92 202.70, 227.88 213.31, 269.89 204.74 C 273.64 203.97, 285.65 202.79, 289.19 203.28 C 291.60 203.61, 303.01 209.81, 302.35 213.02 C 299.54 220.33, 290.28 221.85, 283.20 222.39 C 276.97 222.85, 271.32 220.53, 266.19 220.42 C 246.71 220.01, 226.09 220.39, 206.62 221.68 C 193.87 222.52, 188.64 221.87, 176.82 221.68 C 171.72 221.60, 163.88 223.88, 158.54 224.01 C 132.03 224.67, 105.90 223.81, 79.43 226.26 C 73.42 226.82, 64.94 229.37, 59.79 229.64 C 55.81 229.84, 52.03 226.80, 48.47 230.83 C 47.54 258.58, 48.10 286.35, 47.20 314.10 C 45.29 372.64, 40.78 431.85, 38.76 490.39 C 38.64 493.70, 38.01 507.49, 39.82 508.80 L 61.13 507.17 C 103.74 513.17, 147.86 507.24, 190.57 509.29 C 252.72 512.28, 313.56 513.64, 375.11 513.81 C 401.62 513.88, 427.69 511.49, 454.13 510.44 C 473.21 509.68, 492.34 509.14, 511.46 509.23 C 527.59 509.32, 544.41 511.82, 560.73 510.48 C 582.42 508.69, 595.80 511.81, 616.89 512.76 C 654.94 514.48, 693.25 512.65, 731.47 512.67 L 846.47 516.05 C 847.81 515.27, 845.74 491.20, 845.16 487.21 C 843.85 478.04, 843.94 472.64, 843.01 464.14 C 842.55 459.96, 840.09 456.39, 839.67 452.60 C 839.02 446.70, 841.54 441.22, 840.88 435.34 C 840.34 430.51, 837.55 425.05, 837.31 419.33 C 836.06 389.27, 835.16 359.00, 833.96 328.82 L 819.07 237.71 C 816.47 239.26, 815.02 241.18, 811.66 241.18 C 758.81 241.29, 706.30 239.41, 653.49 241.14 C 643.17 241.48, 628.93 244.42, 633.78 229.45 C 635.48 224.21, 637.29 221.87, 643.24 221.62 C 662.47 220.83, 682.17 223.53, 701.67 223.92 C 735.96 224.60, 770.59 221.45, 804.77 218.25 C 808.71 217.88, 812.83 218.48, 816.78 218.23 Z" />
    <path d="M 495.77 166.85 C 477.51 163.81, 459.08 160.02, 440.36 162.08 C 395.12 167.06, 339.59 209.08, 314.41 245.81 C 307.41 256.02, 291.89 292.70, 290.85 304.76 C 290.29 311.37, 291.71 318.00, 291.62 324.08 C 291.58 326.78, 289.53 329.76, 289.68 334.50 C 290.00 345.01, 300.43 377.85, 305.94 387.04 C 329.70 426.73, 379.40 456.16, 425.43 460.05 C 455.08 462.56, 485.93 455.46, 514.83 451.97 C 538.23 449.15, 581.78 425.96, 595.45 406.54 C 621.88 368.97, 629.46 320.00, 617.73 275.78 C 616.49 271.09, 613.76 267.02, 612.65 262.52 C 609.99 251.73, 612.69 251.53, 604.11 242.41 C 586.84 224.07, 527.36 177.19, 504.09 171.89 C 500.29 171.03, 497.43 174.79, 495.77 166.85 M 463.63 133.78 C 468.76 133.66, 473.93 132.90, 479.08 133.69 C 505.23 142.86, 529.67 155.71, 554.01 168.77 C 586.10 185.98, 609.17 204.06, 628.67 236.19 C 630.91 239.89, 631.59 244.65, 634.08 247.96 C 635.90 250.37, 638.95 251.33, 640.11 253.40 C 655.76 281.27, 652.41 327.70, 645.51 358.06 C 643.90 365.12, 643.55 367.12, 642.60 374.63 C 641.08 386.59, 637.97 384.27, 634.34 391.58 C 632.03 396.25, 631.85 402.87, 629.10 408.11 C 621.98 421.73, 606.96 431.14, 595.62 441.09 C 587.84 447.91, 579.36 457.62, 571.00 463.44 C 539.04 485.70, 494.15 494.50, 455.27 494.48 C 447.27 494.47, 436.90 489.28, 428.62 487.80 C 409.71 484.42, 401.22 483.09, 382.58 477.70 C 377.00 476.08, 369.46 476.00, 363.53 473.83 C 361.31 473.01, 325.67 450.50, 323.50 448.55 C 315.59 441.45, 298.88 423.04, 292.18 414.55 C 285.62 406.26, 272.37 389.59, 268.21 380.08 C 265.78 374.52, 265.10 367.29, 262.75 361.48 C 260.94 357.02, 255.26 350.07, 254.45 346.86 C 254.05 345.28, 254.37 316.08, 254.78 314.34 C 255.19 312.60, 257.27 311.19, 257.84 309.55 C 269.96 274.85, 299.75 223.47, 325.75 197.57 C 345.79 177.62, 404.88 137.72, 432.49 134.73 C 441.55 133.75, 454.09 134.00, 463.63 133.78" />
  </svg>
);

const CalendarIcon: React.FC<{ className?: string }> = ({
  className = 'w-3.5 h-3.5 sm:w-4 sm:h-4 text-ea-black shrink-0',
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

const DeckEmptyCardBody: React.FC<{
  section: 'proyectos' | 'territorios' | 'academia';
}> = ({ section }) => {
  const copy = SECTION_COPIES[section] || SECTION_COPIES.territorios;
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage(null);

    // Spam honeypot
    if (honeypot) {
      setIsSuccess(true);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          section,
          source: `deck-empty-${section}`,
          hp: honeypot,
        }),
      });

      try {
        const stored = JSON.parse(localStorage.getItem('ea_subscribers') || '[]');
        if (!stored.some((s: any) => (typeof s === 'string' ? s : s.email) === cleanEmail)) {
          stored.push({
            email: cleanEmail,
            section,
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem('ea_subscribers', JSON.stringify(stored));
        }
      } catch {}

      if (response.ok || response.status === 200) {
        setIsSuccess(true);
      } else {
        setIsSuccess(true);
      }
    } catch {
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex-1 p-5 sm:p-7 md:p-8 flex flex-col justify-between overflow-y-auto bg-[#FAF8F5] relative select-text cursor-default"
      style={{
        backgroundImage:
          'radial-gradient(#1d1d1b 0.5px, transparent 0.5px), radial-gradient(#1d1d1b 0.5px, #FAF8F5 0.5px)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <TapeStrip className="-top-2 left-6 sm:left-10 -rotate-2" />
      <TapeStrip className="-top-2 right-6 sm:right-10 rotate-3" />

      {/* Top Editorial Copy */}
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ea-black animate-pulse" />
          <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-ea-black/70 font-semibold">
            {copy.badge}
          </span>
        </div>

        <h4 className="font-okcok text-lg sm:text-2xl md:text-[25px] uppercase text-ea-black leading-tight tracking-tight">
          {copy.title}
        </h4>

        <div className="space-y-1.5 font-creato text-ea-black/85 text-xs sm:text-[13.5px] leading-relaxed max-w-xl">
          <p>{copy.body1}</p>
          {copy.body2 && <p className="hidden sm:block text-ea-black/75">{copy.body2}</p>}
        </div>
      </div>

      {/* Divider */}
      <div className="my-2.5 sm:my-3 border-t border-dashed border-ea-black/25 relative">
        <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-[#FAF8F5] px-3 font-mono text-[8.5px] sm:text-[9.5px] uppercase tracking-widest text-ea-black/50 whitespace-nowrap">
          SUSCRIPCIÓN EDITORIAL DIRECTA
        </span>
      </div>

      {/* Bottom CTA / Form */}
      {isSuccess ? (
        <div className="bg-white border-2 border-ea-black p-4 sm:p-5 shadow-[3px_3px_0px_#1d1d1b] flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-ea-black text-white flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#FAF8F5]" />
          </div>
          <div>
            <span className="font-anton text-[11px] sm:text-xs uppercase tracking-widest text-ea-black block mb-0.5">
              REGISTRO CONFIRMADO
            </span>
            <p className="font-creato text-xs sm:text-[13.5px] text-ea-black/90 font-medium leading-snug">
              ¡Gracias por querer ser parte de esta conversación! Te avisaremos cuando haya nuevas publicaciones en EcuadorianArchitecture.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div>
            <h5 className="font-anton text-xs sm:text-sm uppercase text-ea-black tracking-wide">
              {copy.ctaHeading}
            </h5>
            <p className="font-creato text-[11px] sm:text-xs text-ea-black/75">
              {copy.ctaSub}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-2">
            <input
              type="text"
              name="ea_deck_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ea-black/45 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="tu.correo@ejemplo.com"
                  data-no-deck-cursor
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-white border-2 border-ea-black font-creato text-xs sm:text-sm text-ea-black placeholder:text-ea-black/40 focus:outline-none focus:ring-2 focus:ring-ea-black shadow-[2px_2px_0px_#1d1d1b]"
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                data-no-deck-cursor
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-ea-black text-white border-2 border-ea-black font-anton text-[11px] sm:text-xs uppercase tracking-wider shadow-[2px_2px_0px_#1d1d1b] hover:bg-neutral-800 hover:shadow-[1px_1px_0px_#1d1d1b] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-60 whitespace-nowrap cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Registrando...</span>
                ) : (
                  <>
                    <span>{copy.buttonText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-1.5 text-red-600 font-creato text-[11px]">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <p className="font-mono text-[9px] sm:text-[9.5px] text-ea-black/50 tracking-tight">
              * Cero spam. Respetamos tu privacidad y solo te escribiremos con publicaciones reales e investigaciones verificadas.
            </p>
          </form>
        </div>
      )}
    </div>
  );
};

interface PhysicalCardDeckProps {
  onSelectProject?: (projectId: string) => void;
  onNavigateToCatalog?: () => void;
  onNavigateToSection?: (section: string) => void;
  activeTab?: 'proyectos' | 'academia' | 'territorios' | 'acerca';
  onTabChange?: (tab: 'proyectos' | 'academia' | 'territorios' | 'acerca') => void;
  projects?: DeckProject[];
}

export const PhysicalCardDeck: React.FC<PhysicalCardDeckProps> = ({
  onSelectProject,
  onNavigateToCatalog,
  onNavigateToSection,
  activeTab = 'proyectos',
  onTabChange,
  projects: customProjects,
}) => {
  const currentTab = (activeTab === 'acerca' ? 'proyectos' : activeTab) as 'proyectos' | 'territorios' | 'academia';
  const projects = customProjects && customProjects.length > 0 ? customProjects : getDeckProjectsForTab(currentTab);
  const totalCards = projects.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const [isAnimating, setIsAnimating] = useState(false);
  const isAnimatingRef = useRef(false);
  isAnimatingRef.current = isAnimating;

  // DOM node references
  const sectionRef = useRef<HTMLElement>(null);
  const deckContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Drag & Anti-Accidental Click state
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const isIntentDeterminedRef = useRef(false);
  const isHorizontalGestureRef = useRef(false);

  // Custom Circular Cursor State (Desktop only)
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isCursorVisible, setIsCursorVisible] = useState(false);
  const [isCursorHoveringButton, setIsCursorHoveringButton] = useState(false);

  // Dynamic Secondary Image Preview (Hover & Click transitions to invite reading)
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [manualSecondImageId, setManualSecondImageId] = useState<string | null>(null);

  // Prefers reduced motion detection
  const prefersReducedMotion = useRef(false);
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Reset manual second image when active card changes
  useEffect(() => {
    setManualSecondImageId(null);
  }, [activeIndex]);

  // Cinematic Architectural Shutter State & Refs (Figma 1440x885 frames)
  const shutterRef = useRef<HTMLDivElement>(null);
  const apertureRef = useRef<HTMLDivElement>(null);
  const shutterBadgeRef = useRef<HTMLSpanElement>(null);
  const shutterTitleRef = useRef<HTMLHeadingElement>(null);
  const shutterDescRef = useRef<HTMLParagraphElement>(null);
  const shutterLineRef = useRef<HTMLDivElement>(null);
  const shutterIconRef = useRef<HTMLImageElement>(null);
  const shutterBtnRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef(false);

  const [shutterSection, setShutterSection] = useState<TransitionSectionType>(currentTab);

  // Card slot configuration
  // Slot 0 = Front (centered, straight)
  // Slot 1 = 1st behind (offset Y, rotated +3.5°, top banner fully visible)
  // Slot 2 = 2nd behind (offset Y, rotated -3.8°, top banner fully visible)
  // Slot 3 & 4 = bottom of deck (hidden underneath stack)
  const getSlotConfig = (slot: number) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    switch (slot) {
      case 0:
        return {
          y: 0,
          rotation: 0,
          scale: 1,
          zIndex: 6,
          boxShadow: '0 26px 50px -12px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.12)',
        };
      case 1:
        return {
          y: isMobile ? -36 : -46,
          rotation: 3.5, // Between 2° and 5°
          scale: isMobile ? 0.98 : 0.985,
          zIndex: 5,
          boxShadow: '0 18px 34px -10px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.1)',
        };
      case 2:
        return {
          y: isMobile ? -72 : -92,
          rotation: -3.8, // Between 2° and 5°, distinct angle
          scale: isMobile ? 0.96 : 0.97,
          zIndex: 4,
          boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.08)',
        };
      case 3:
        return {
          y: isMobile ? -76 : -96,
          rotation: -1.2,
          scale: isMobile ? 0.94 : 0.95,
          zIndex: 3,
          boxShadow: '0 6px 14px -6px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.06)',
        };
      case 4:
        return {
          y: isMobile ? -78 : -98,
          rotation: 1.0,
          scale: isMobile ? 0.93 : 0.94,
          zIndex: 2,
          boxShadow: '0 4px 10px -6px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        };
      case 5:
      default:
        return {
          y: isMobile ? -80 : -100,
          rotation: -0.6,
          scale: isMobile ? 0.92 : 0.93,
          zIndex: 1,
          boxShadow: '0 4px 10px -6px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        };
    }
  };

  const getSlotForCard = (cardIndex: number, currentActive: number, cardCount = projects.length) => {
    if (cardCount <= 0) return 0;
    return (cardIndex - currentActive + cardCount) % cardCount;
  };

  // Instant layout setter (mount & reduced motion)
  const applySlotsInstant = useCallback(
    (currentActive: number) => {
      const cardCount = projects.length;
      if (cardCount <= 0) return;

      // Truncate any obsolete elements beyond current count
      cardRefs.current.length = cardCount;

      cardRefs.current.forEach((cardEl, idx) => {
        if (!cardEl) return;
        gsap.killTweensOf(cardEl);

        const slot = (idx - currentActive + cardCount) % cardCount;
        const cfg = getSlotConfig(slot);

        gsap.set(cardEl, {
          x: 0,
          y: cfg.y,
          rotation: cfg.rotation,
          scale: cfg.scale,
          zIndex: cfg.zIndex,
          boxShadow: cfg.boxShadow,
          opacity: 1, // MANDATORY: 100% Opaque at all times
          transformOrigin: 'bottom center',
        });
      });
    },
    [projects.length]
  );

  const applySlotsInstantRef = useRef(applySlotsInstant);
  applySlotsInstantRef.current = applySlotsInstant;

  const handleTabSwitch = useCallback(
    (targetTab: 'proyectos' | 'territorios' | 'academia') => {
      if (isTransitioningRef.current || targetTab === currentTab) return;

      if (!shutterRef.current || !apertureRef.current) {
        onTabChange && onTabChange(targetTab);
        return;
      }

      isTransitioningRef.current = true;
      setShutterSection(targetTab);

      const shutter = shutterRef.current;
      const aperture = apertureRef.current;
      const badge = shutterBadgeRef.current;
      const title = shutterTitleRef.current;
      const line = shutterLineRef.current;
      const desc = shutterDescRef.current;
      const icon = shutterIconRef.current;
      const btn = shutterBtnRef.current;
      const animatedElements = [icon, badge, title, line, desc, btn].filter(Boolean);

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(shutter, { autoAlpha: 0 });
          gsap.set(aperture, { yPercent: 0, scaleY: 0, transformOrigin: 'top center' });
          isTransitioningRef.current = false;
          applySlotsInstantRef.current(0);
          ScrollTrigger.refresh();
        },
      });

      // 1. Reset and make shutter visible
      gsap.set(shutter, { autoAlpha: 1 });
      gsap.set(aperture, { scaleY: 0, yPercent: 0, transformOrigin: 'top center' });
      gsap.set([badge, title, desc, btn].filter(Boolean), { opacity: 0, y: 20 });
      if (icon) gsap.set(icon, { opacity: 0, scale: 0.85 });
      if (line) gsap.set(line, { scaleX: 0, opacity: 0 });

      // 2. Black architectural aperture drops down smoothly over screen
      tl.to(aperture, {
        scaleY: 1,
        duration: 0.38,
        ease: 'power3.inOut',
      });

      // 3. Shutter icon & typography reveal dramatically
      if (icon) {
        tl.to(icon, { opacity: 1, scale: 1, duration: 0.28, ease: 'back.out(1.4)' }, '-=0.08');
      }
      tl.to(
        [badge, title, desc, btn].filter(Boolean),
        {
          opacity: 1,
          y: 0,
          duration: 0.24,
          ease: 'power2.out',
          stagger: 0.05,
        },
        '-=0.18'
      );
      if (line) {
        tl.to(line, { scaleX: 1, opacity: 1, duration: 0.24, ease: 'power2.out' }, '<');
      }

      // 4. In the middle of total darkness: swap tab and reset deck state behind the curtain
      tl.call(() => {
        onTabChange && onTabChange(targetTab);
        setActiveIndex(0);
        activeIndexRef.current = 0;
        setHoveredCardId(null);
        setManualSecondImageId(null);
        if (scrollTriggerRef.current) {
          const st = scrollTriggerRef.current;
          if (window.scrollY > st.start) {
            window.scrollTo({ top: st.start, behavior: 'instant' });
          }
        }
      });

      // 5. Brief dramatic architectural pause
      tl.to({}, { duration: 0.28 });

      // 6. Elements fade out smoothly upwards
      tl.to(animatedElements, {
        opacity: 0,
        y: -14,
        duration: 0.18,
        ease: 'power2.in',
      });

      // 7. Aperture wipes away upwards like a theatrical curtain revealing the cards
      tl.to(aperture, {
        yPercent: -100,
        duration: 0.42,
        ease: 'power3.inOut',
      });
    },
    [currentTab, onTabChange]
  );

  // Sync external tab changes (e.g. from Hero or nav) with cinematic transition
  const prevTabRef = useRef(currentTab);
  useEffect(() => {
    if (prevTabRef.current !== currentTab) {
      const nextTab = currentTab;
      prevTabRef.current = nextTab;
      handleTabSwitch(nextTab);
    }
  }, [currentTab, handleTabSwitch]);

  useEffect(() => {
    if (isAnimatingRef.current) return;
    applySlotsInstant(activeIndex);

    const handleResize = () => {
      if (isAnimatingRef.current) return;
      applySlotsInstant(activeIndexRef.current);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [applySlotsInstant, activeIndex]);

  // Reset deck state when switching categories (Proyectos / Territorios / Academia)
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, projects.length);
    setActiveIndex(0);
    activeIndexRef.current = 0;
    setHoveredCardId(null);
    setManualSecondImageId(null);
    const raf = requestAnimationFrame(() => {
      applySlotsInstant(0);
    });
    return () => cancelAnimationFrame(raf);
  }, [currentTab, projects.length, applySlotsInstant]);

  // =========================================================================
  // PHYSICAL CARD SHUFFLE ANIMATION (BARAJAR CARTAS)
  // Direct GSAP Tween for next / prev buttons, swipe gestures & arrow keys.
  // Front card sweeps out with physical rotation, drops behind stack, and
  // all cards advance with a tactile back.out bounce.
  // =========================================================================
  const shuffleDeck = useCallback(
    (direction: 'next' | 'prev') => {
      if (totalCards <= 1 || isAnimatingRef.current || projects[0]?.isEditorialEmptyCard) return;

      const currentIdx = activeIndexRef.current;
      const targetIdx =
        direction === 'next'
          ? (currentIdx + 1) % totalCards
          : (currentIdx - 1 + totalCards) % totalCards;

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const exitDist = -(typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth * 1.15 : 750);
      const lastSlotCfg = getSlotConfig(totalCards - 1);

      isAnimatingRef.current = true;
      setIsAnimating(true);

      const tl = gsap.timeline({
        onComplete: () => {
          activeIndexRef.current = targetIdx;
          setActiveIndex(targetIdx);
          isAnimatingRef.current = false;
          setIsAnimating(false);
        },
      });

      if (direction === 'next') {
        // FRONT CARD pulls out to the left and slides into the back slot
        const frontCard = cardRefs.current[currentIdx];
        if (frontCard) {
          gsap.killTweensOf(frontCard);
          tl.set(frontCard, { zIndex: 6 }, 0);
          // 1. Pull out to the left
          tl.to(
            frontCard,
            { x: exitDist, rotation: -8, y: 12, duration: 0.38, ease: 'power1.in' },
            0
          );
          // 2. Drop behind stack
          tl.set(frontCard, { zIndex: 1 }, 0.38);
          // 3. Slide smoothly into the last slot from behind
          tl.to(
            frontCard,
            {
              x: 0,
              y: lastSlotCfg.y,
              rotation: lastSlotCfg.rotation,
              scale: lastSlotCfg.scale,
              zIndex: 1,
              boxShadow: lastSlotCfg.boxShadow,
              duration: 0.44,
              ease: 'power2.out',
            },
            0.38
          );
        }

        // All OTHER CARDS advance forward one slot
        for (let idx = 0; idx < totalCards; idx++) {
          if (idx === currentIdx) continue;
          const otherCard = cardRefs.current[idx];
          if (!otherCard) continue;

          gsap.killTweensOf(otherCard);
          const nextSlot = (idx - targetIdx + totalCards) % totalCards;
          const nextCfg = getSlotConfig(nextSlot);

          tl.set(otherCard, { zIndex: nextCfg.zIndex }, 0.2);
          tl.to(
            otherCard,
            {
              x: 0,
              y: nextCfg.y,
              rotation: nextCfg.rotation,
              scale: nextCfg.scale,
              zIndex: nextCfg.zIndex,
              boxShadow: nextCfg.boxShadow,
              duration: 0.58,
              ease: nextSlot === 0 ? 'back.out(1.15)' : 'power2.out',
            },
            0.12
          );
        }
      } else {
        // PREVIOUS CARD: the card from the very back slot pulls out to the left and lands on the front
        const incomingCard = cardRefs.current[targetIdx];
        if (incomingCard) {
          gsap.killTweensOf(incomingCard);
          // 1. Pull out to the left from underneath
          tl.to(
            incomingCard,
            { x: exitDist, rotation: -8, y: 12, duration: 0.38, ease: 'power1.in' },
            0
          );
          // 2. Bring above all other cards
          tl.set(incomingCard, { zIndex: 7 }, 0.38);
          // 3. Drop into front slot (Slot 0)
          tl.to(
            incomingCard,
            {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              zIndex: 6,
              boxShadow: getSlotConfig(0).boxShadow,
              duration: 0.44,
              ease: 'back.out(1.15)',
            },
            0.38
          );
        }

        // All OTHER CARDS shift back one slot
        for (let idx = 0; idx < totalCards; idx++) {
          if (idx === targetIdx) continue;
          const otherCard = cardRefs.current[idx];
          if (!otherCard) continue;

          gsap.killTweensOf(otherCard);
          const nextSlot = (idx - targetIdx + totalCards) % totalCards;
          const nextCfg = getSlotConfig(nextSlot);

          tl.set(otherCard, { zIndex: nextCfg.zIndex }, 0.18);
          tl.to(
            otherCard,
            {
              x: 0,
              y: nextCfg.y,
              rotation: nextCfg.rotation,
              scale: nextCfg.scale,
              zIndex: nextCfg.zIndex,
              boxShadow: nextCfg.boxShadow,
              duration: 0.52,
              ease: 'power2.out',
            },
            0.1
          );
        }
      }
    },
    [totalCards, projects, applySlotsInstant]
  );

  const goToCard = useCallback(
    (targetIndex: number) => {
      if (totalCards <= 1) {
        setActiveIndex(0);
        activeIndexRef.current = 0;
        applySlotsInstant(0);
        return;
      }
      if (isAnimatingRef.current) return;
      const currentIdx = activeIndexRef.current;
      if (targetIndex === currentIdx) return;

      if (targetIndex === (currentIdx + 1) % totalCards) {
        shuffleDeck('next');
        return;
      }
      if (targetIndex === (currentIdx - 1 + totalCards) % totalCards) {
        shuffleDeck('prev');
        return;
      }

      // Multi-step jump (e.g. clicking rayita from 0 to 4): animate all cards to target slots
      isAnimatingRef.current = true;
      setIsAnimating(true);
      cardRefs.current.forEach((cardEl, idx) => {
        if (!cardEl) return;
        gsap.killTweensOf(cardEl);
        const nextSlot = (idx - targetIndex + totalCards) % totalCards;
        const nextCfg = getSlotConfig(nextSlot);
        gsap.to(cardEl, {
          x: 0,
          y: nextCfg.y,
          rotation: nextCfg.rotation,
          scale: nextCfg.scale,
          zIndex: nextCfg.zIndex,
          boxShadow: nextCfg.boxShadow,
          duration: 0.45,
          ease: nextSlot === 0 ? 'back.out(1.15)' : 'power2.out',
        });
      });
      setTimeout(() => {
        activeIndexRef.current = targetIndex;
        setActiveIndex(targetIndex);
        isAnimatingRef.current = false;
        setIsAnimating(false);
      }, 450);
    },
    [totalCards, shuffleDeck, applySlotsInstant]
  );

  const nextCard = useCallback(() => {
    shuffleDeck('next');
  }, [shuffleDeck]);

  const prevCard = useCallback(() => {
    shuffleDeck('prev');
  }, [shuffleDeck]);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      // If only 1 card or empty editorial state, cleanly dismantle any pinned ScrollTrigger
      if (totalCards <= 1 || Boolean(projects[0]?.isEditorialEmptyCard)) {
        if (scrollTriggerRef.current) {
          scrollTriggerRef.current.kill(true);
          scrollTriggerRef.current = null;
        }
        applySlotsInstant(0);
        setActiveIndex(0);
        activeIndexRef.current = 0;
        return;
      }

      // Ensure cards start at slot 0 initial state
      applySlotsInstant(0);
      setActiveIndex(0);
      activeIndexRef.current = 0;

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const exitDist = -(typeof window !== 'undefined' && window.innerWidth < 768 ? window.innerWidth * 1.15 : 750);
      const lastSlotCfg = getSlotConfig(totalCards - 1);

      // Build Master Deck Scrubbed Timeline
      // Total duration = totalCards - 1 (1.0 duration per card transition)
      const tl = gsap.timeline({ paused: true });

      for (let s = 0; s < totalCards - 1; s++) {
        const frontCard = cardRefs.current[s];

        if (frontCard) {
          // Explicit keyframes for zIndex and motion
          tl.set(frontCard, { zIndex: 6 }, s);
          // 1. Front card pulls out to the left
          tl.to(
            frontCard,
            { x: exitDist, rotation: -8, y: 12, duration: 0.45, ease: 'power1.in' },
            s
          );
          // 2. Drop behind stack
          tl.set(frontCard, { zIndex: 1 }, s + 0.46);
          // 3. Slides smoothly into the last slot from behind
          tl.to(
            frontCard,
            {
              x: 0,
              y: lastSlotCfg.y,
              rotation: lastSlotCfg.rotation,
              scale: lastSlotCfg.scale,
              zIndex: 1,
              boxShadow: lastSlotCfg.boxShadow,
              duration: 0.54,
              ease: 'power2.out',
            },
            s + 0.46
          );
        }

        // Advance all other cards forward one slot
        for (let idx = 0; idx < totalCards; idx++) {
          if (idx === s) continue;
          const otherCard = cardRefs.current[idx];
          if (!otherCard) continue;

          const nextSlot = (idx - (s + 1) + totalCards) % totalCards;
          const nextCfg = getSlotConfig(nextSlot);

          // Update zIndex at midpoint
          tl.set(otherCard, { zIndex: nextCfg.zIndex }, s + 0.2);

          tl.to(
            otherCard,
            {
              x: 0,
              y: nextCfg.y,
              rotation: nextCfg.rotation,
              scale: nextCfg.scale,
              zIndex: nextCfg.zIndex,
              boxShadow: nextCfg.boxShadow,
              duration: 0.75,
              ease: nextSlot === 0 ? 'back.out(1.15)' : 'power2.out',
            },
            s + 0.15
          );
        }
      }

      // Scroll distance per card transition (gives comfortable reading time)
      const scrollDistancePerCard = isMobile ? 480 : 620;
      const totalScrollDist = (totalCards - 1) * scrollDistancePerCard;

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        pin: true,
        pinSpacing: true,
        start: 'top top',
        end: () => `+=${totalScrollDist}`,
        scrub: 0.35,
        animation: tl,
        onUpdate: (self) => {
          if (isAnimatingRef.current) return;
          const step = Math.min(totalCards - 1, Math.round(self.progress * (totalCards - 1)));
          if (step !== activeIndexRef.current) {
            activeIndexRef.current = step;
            setActiveIndex(step);
          }
        },
      });

      scrollTriggerRef.current = st;

      return () => {
        if (st) st.kill(true);
        if (tl) tl.kill();
        scrollTriggerRef.current = null;
      };
    },
    { dependencies: [currentTab, totalCards], scope: sectionRef }
  );

  // =========================================================================
  // HORIZONTAL DRAG / SWIPE (Mouse & Touch) + ANTI-ACCIDENTAL-CLICK
  // =========================================================================
  const handlePointerDown = (e: React.PointerEvent) => {
    if (totalCards <= 1 || projects[0]?.isEditorialEmptyCard) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('[data-no-deck-cursor]')) {
      return;
    }

    dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    isIntentDeterminedRef.current = false;
    isHorizontalGestureRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Custom cursor positioning relative to deck container
    if (cursorRef.current && deckContainerRef.current) {
      const containerRect = deckContainerRef.current.getBoundingClientRect();
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;
      gsap.to(cursorRef.current, {
        x,
        y,
        duration: 0.10,
        ease: 'power1.out',
      });
    }

    if (totalCards <= 1 || projects[0]?.isEditorialEmptyCard) return;
    if (!isDraggingRef.current || !dragStartRef.current || isAnimatingRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Gesture disambiguation: determine whether user wants horizontal swipe or vertical page scroll
    if (!isIntentDeterminedRef.current) {
      if (absX > 8 || absY > 8) {
        isIntentDeterminedRef.current = true;
        if (absX > absY) {
          isHorizontalGestureRef.current = true;
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch (_) {}
        } else {
          // Intent is vertical scroll: cancel drag so native page scroll continues smoothly
          isDraggingRef.current = false;
          return;
        }
      } else {
        return;
      }
    }

    if (!isHorizontalGestureRef.current) return;

    if (absX > 6) {
      hasDraggedRef.current = true;
    }

    const frontCardEl = cardRefs.current[activeIndexRef.current];
    if (frontCardEl) {
      const tilt = deltaX * 0.025;
      gsap.set(frontCardEl, {
        x: deltaX,
        rotation: tilt,
        opacity: 1,
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      if ((e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    if (totalCards <= 1 || projects[0]?.isEditorialEmptyCard) return;
    if (!isDraggingRef.current || !dragStartRef.current) {
      isDraggingRef.current = false;
      isIntentDeterminedRef.current = false;
      isHorizontalGestureRef.current = false;
      return;
    }

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaTime = Date.now() - dragStartRef.current.time;
    const velocity = Math.abs(deltaX) / Math.max(1, deltaTime);

    const wasHorizontal = isHorizontalGestureRef.current;
    isDraggingRef.current = false;
    dragStartRef.current = null;
    isIntentDeterminedRef.current = false;
    isHorizontalGestureRef.current = false;

    if (!wasHorizontal) return;

    const frontCardEl = cardRefs.current[activeIndexRef.current];

    if (deltaX < -55 || (deltaX < -25 && velocity > 0.4)) {
      nextCard();
    } else if (deltaX > 55 || (deltaX > 25 && velocity > 0.4)) {
      prevCard();
    } else if (frontCardEl) {
      // Rebound gently back straight to center
      gsap.to(frontCardEl, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration: 0.35,
        ease: 'back.out(1.2)',
      });
    }
  };

  const handleCardClick = (project: DeckProject) => {
    if (project.isEditorialEmptyCard) {
      return;
    }
    // Only open if the user clicked cleanly without dragging
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    if (project.isCtaCard) {
      if (onNavigateToCatalog) {
        onNavigateToCatalog();
      } else if (onNavigateToSection) {
        onNavigateToSection('proyectos');
      } else {
        window.location.hash = '#proyectos';
      }
      return;
    }
    if (onSelectProject) {
      onSelectProject(project.linkId || project.id);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextCard, prevCard]);

  return (
    <section
      ref={sectionRef}
      id="destacados"
      className="relative w-full h-screen min-h-[640px] bg-white flex flex-col justify-between py-5 sm:py-8 md:py-10 px-4 sm:px-8 md:px-12 select-none overflow-hidden"
      role="region"
      aria-label="Previsualización de proyectos destacados en mazo de cartas"
    >
      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP HEADER BAR: SECTION SWITCHER TABS & RAYITAS INDICATOR           */}
      {/* --------------------------------------------------------------------- */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 pb-4 sm:pb-5">
        {/* Category Switcher Tabs (Proyectos / Territorios / Academia) */}
        <div className="flex items-center gap-3.5 sm:gap-8 md:gap-10 overflow-x-auto no-scrollbar py-1">
          {/* TAB 1: PROYECTOS */}
          {currentTab === 'proyectos' ? (
            <div className="flex items-center gap-2.5 sm:gap-3 text-left shrink-0">
              <img
                src={tagProyectosUrl}
                alt=""
                className="w-8 h-8 sm:w-14 sm:h-14 object-contain"
              />
              <div>
                <span className="font-anton text-xl sm:text-[34px] tracking-wide uppercase text-ea-black block leading-none">
                  PROYECTOS
                </span>
                <span className="font-okcok text-xs sm:text-[22px] text-ea-black uppercase block leading-none mt-0.5 sm:mt-1">
                  DESTACADOS
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleTabSwitch('proyectos')}
              className="flex items-center gap-2 sm:gap-3 text-left opacity-40 hover:opacity-80 active:opacity-100 transition-all cursor-pointer min-h-[44px] py-1 px-1 rounded-md shrink-0 active:scale-95"
              title="Explorar Proyectos Destacados"
              data-no-deck-cursor
            >
              <img
                src={tagProyectosUrl}
                alt=""
                className="w-7 h-7 sm:w-10 sm:h-10 object-contain grayscale"
              />
              <div>
                <span className="font-anton text-xs sm:text-[20px] tracking-wide uppercase text-ea-black block leading-none">
                  PROYECTOS
                </span>
                <span className="hidden sm:block font-okcok text-xs sm:text-[14px] text-ea-black uppercase leading-none mt-0.5">
                  DESTACADOS
                </span>
              </div>
            </button>
          )}

          {/* TAB 2: TERRITORIOS */}
          {currentTab === 'territorios' ? (
            <div className="flex items-center gap-2.5 sm:gap-3 text-left shrink-0">
              <img
                src={tagCiudadUrl}
                alt=""
                className="w-8 h-8 sm:w-14 sm:h-14 object-contain"
              />
              <div>
                <span className="font-anton text-xl sm:text-[34px] tracking-wide uppercase text-ea-black block leading-none">
                  TERRITORIOS
                </span>
                <span className="font-okcok text-xs sm:text-[22px] text-ea-black uppercase block leading-none mt-0.5 sm:mt-1">
                  DESTACADOS
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleTabSwitch('territorios')}
              className="flex items-center gap-2 sm:gap-3 text-left opacity-40 hover:opacity-80 active:opacity-100 transition-all cursor-pointer min-h-[44px] py-1 px-1 rounded-md shrink-0 active:scale-95"
              title="Explorar Territorios Destacados"
              data-no-deck-cursor
            >
              <img
                src={tagCiudadUrl}
                alt=""
                className="w-7 h-7 sm:w-10 sm:h-10 object-contain grayscale"
              />
              <div>
                <span className="font-anton text-xs sm:text-[20px] tracking-wide uppercase text-ea-black block leading-none">
                  TERRITORIOS
                </span>
                <span className="hidden sm:block font-okcok text-xs sm:text-[14px] text-ea-black uppercase leading-none mt-0.5">
                  DESTACADOS
                </span>
              </div>
            </button>
          )}

          {/* TAB 3: ACADEMIA */}
          {currentTab === 'academia' ? (
            <div className="flex items-center gap-2.5 sm:gap-3 text-left shrink-0">
              <img
                src={tagDatosUrl}
                alt=""
                className="w-8 h-8 sm:w-14 sm:h-14 object-contain"
              />
              <div>
                <span className="font-anton text-xl sm:text-[34px] tracking-wide uppercase text-ea-black block leading-none">
                  ACADEMIA
                </span>
                <span className="font-okcok text-xs sm:text-[22px] text-ea-black uppercase block leading-none mt-0.5 sm:mt-1">
                  DESTACADOS
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleTabSwitch('academia')}
              className="flex items-center gap-2 sm:gap-3 text-left opacity-40 hover:opacity-80 active:opacity-100 transition-all cursor-pointer min-h-[44px] py-1 px-1 rounded-md shrink-0 active:scale-95"
              title="Explorar Academia Destacada"
              data-no-deck-cursor
            >
              <img
                src={tagDatosUrl}
                alt=""
                className="w-7 h-7 sm:w-10 sm:h-10 object-contain grayscale"
              />
              <div>
                <span className="font-anton text-xs sm:text-[20px] tracking-wide uppercase text-ea-black block leading-none">
                  ACADEMIA
                </span>
                <span className="hidden sm:block font-okcok text-xs sm:text-[14px] text-ea-black uppercase leading-none mt-0.5">
                  DESTACADOS
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Right Side: Synchronized Rayitas Indicator + Navigation Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1">
          {!projects[0]?.isEditorialEmptyCard && (
            <div
              className="flex items-center gap-1.5 sm:gap-2"
              role="tablist"
              aria-label="Indicador de proyectos en el mazo"
            >
              {projects.map((proj, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => goToCard(idx)}
                    className={`h-2 sm:h-1.5 transition-all duration-300 rounded-full cursor-pointer focus:outline-hidden min-h-[44px] flex items-center justify-center ${
                      isActive
                        ? 'w-9 sm:w-14'
                        : 'w-4 sm:w-7'
                    }`}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={
                      proj.isCtaCard
                        ? 'Ir a Ver todos los proyectos'
                        : `Ir al proyecto ${idx + 1}: ${proj.title}`
                    }
                    title={proj.isCtaCard ? 'Ver todos los proyectos' : `${proj.number} — ${proj.title}`}
                    data-no-deck-cursor
                  >
                    <span className={`h-1.5 w-full rounded-full ${isActive ? 'bg-ea-black shadow-xs' : 'bg-ea-black/20 hover:bg-ea-black/45'}`} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Previous / Next Arrow Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevCard}
              disabled={isAnimating || totalCards <= 1 || Boolean(projects[0]?.isEditorialEmptyCard)}
              className="w-11 h-11 sm:w-10 sm:h-10 min-h-[44px] min-w-[44px] rounded-full border border-ea-black/30 hover:border-ea-black hover:bg-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Ver proyecto anterior"
              title="Anterior (Flecha izquierda)"
              data-no-deck-cursor
            >
              <ArrowLeft className="w-4 h-4 text-ea-black" />
            </button>
            <button
              type="button"
              onClick={nextCard}
              disabled={isAnimating || totalCards <= 1 || Boolean(projects[0]?.isEditorialEmptyCard)}
              className="w-11 h-11 sm:w-10 sm:h-10 min-h-[44px] min-w-[44px] rounded-full bg-ea-black text-white hover:bg-black/85 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Ver siguiente proyecto"
              title="Siguiente (Flecha derecha)"
              data-no-deck-cursor
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
            <span className="font-mono text-xs text-ea-black/60 uppercase ml-1">
              {projects[0]?.isEditorialEmptyCard ? (
                <span className="text-ea-black font-semibold text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full border border-ea-black/30 bg-white shadow-xs">
                  EN PREPARACIÓN
                </span>
              ) : (
                <>
                  <strong className="text-ea-black font-bold">{activeIndex + 1}</strong> / {totalCards}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. MAIN STAGE: THE PHYSICAL CARD DECK CONTAINER                        */}
      {/* --------------------------------------------------------------------- */}
      <div
        ref={deckContainerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => setIsCursorVisible(true)}
        onMouseLeave={() => setIsCursorVisible(false)}
        className={`relative w-full max-w-4xl mx-auto my-auto py-16 sm:py-24 flex items-center justify-center min-h-[500px] sm:min-h-[560px] ${
          totalCards > 1 && !projects[0]?.isEditorialEmptyCard
            ? 'cursor-grab active:cursor-grabbing touch-pan-y'
            : 'cursor-default'
        }`}
        style={{ perspective: '1400px' }}
      >
        {/* Custom Circular Cursor (Desktop only, invites to advance cards) */}
        <div
          ref={cursorRef}
          aria-hidden="true"
          className={`hidden md:flex pointer-events-none fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-50 transition-transform duration-150 ease-out ${
            isCursorVisible && !isCursorHoveringButton && totalCards > 1 && !projects[0]?.isEditorialEmptyCard
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-50'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-ea-black text-white shadow-xl border-2 border-white/80 flex flex-col items-center justify-center backdrop-blur-xs">
            <ArrowRight className="w-4 h-4 text-white animate-pulse" />
            <span className="font-anton text-[8px] tracking-widest uppercase mt-0.5">AVANZAR</span>
          </div>
        </div>

        {/* THE 5 PHYSICAL CARDS STACK */}
        <div className="relative w-[92vw] sm:w-[600px] md:w-[680px] lg:w-[740px] h-[460px] sm:h-[475px] md:h-[495px] translate-y-7 sm:translate-y-8 md:translate-y-9">
          {projects.map((project, idx) => {
            const isFrontCard = idx === activeIndex;
            const isShowingSecondary =
              isFrontCard &&
              Boolean(project.secondaryImageUrl) &&
              (hoveredCardId === project.id || manualSecondImageId === project.id);

            const slot = (idx - activeIndex + projects.length) % projects.length;
            const cfg = getSlotConfig(slot);

            return (
              <article
                key={`${project.id}-${currentTab}`}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => isFrontCard && handleCardClick(project)}
                role="group"
                aria-roledescription="tarjeta"
                aria-label={
                  project.isEditorialEmptyCard
                    ? `Estado editorial: ${project.title}`
                    : project.isCtaCard
                    ? 'Ver todos los proyectos - Explorar catálogo completo'
                    : `Proyecto ${idx + 1}: ${project.title}`
                }
                tabIndex={isFrontCard && !project.isEditorialEmptyCard ? 0 : -1}
                onKeyDown={(e) => {
                  if (project.isEditorialEmptyCard) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (project.isCtaCard) {
                      if (currentTab === 'territorios') {
                        if (onNavigateToSection) onNavigateToSection('territorios');
                        else window.location.hash = '#territorios';
                      } else if (currentTab === 'academia') {
                        if (onNavigateToSection) onNavigateToSection('academia');
                        else window.location.hash = '#academia';
                      } else {
                        if (onNavigateToCatalog) onNavigateToCatalog();
                        else if (onNavigateToSection) onNavigateToSection('proyectos');
                        else window.location.hash = '#proyectos';
                      }
                    } else {
                      onSelectProject && onSelectProject(project.linkId || project.id);
                    }
                  }
                }}
                className={`absolute inset-0 ${
                  project.isEditorialEmptyCard
                    ? 'bg-[#FAF8F5] text-ea-black border-2 border-ea-black shadow-[0_20px_45px_rgba(0,0,0,0.12)]'
                    : project.isCtaCard
                    ? 'bg-[#0E0E0E] text-white border-2 border-ea-black shadow-[0_20px_45px_rgba(0,0,0,0.45)]'
                    : 'bg-[#FFFFFF] text-ea-black border-2 border-ea-black'
                } rounded-[16px] sm:rounded-[20px] overflow-hidden flex flex-col justify-between ${
                  project.isEditorialEmptyCard
                    ? 'select-text cursor-default'
                    : isFrontCard
                    ? 'select-none cursor-pointer'
                    : 'select-none pointer-events-none'
                }`}
                style={{
                  opacity: 1, // MANDATORY: 100% OPAQUE - NEVER FADES
                  transformOrigin: 'bottom center',
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
              >
                {/* ------------------------------------------------------------- */}
                {/* TOP BANNER / PESTAÑA: ALWAYS 100% VISIBLE ON CARDS BEHIND      */}
                {/* ------------------------------------------------------------- */}
                {project.isEditorialEmptyCard ? (
                  <header className="w-full bg-[#FAF8F5] border-b-2 border-ea-black px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3 truncate">
                      <span className="w-2.5 h-2.5 rounded-full bg-ea-black animate-pulse shrink-0" />
                      <h3 className="font-okcok text-base sm:text-lg md:text-xl uppercase text-ea-black tracking-wide truncate">
                        {project.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-anton text-[9.5px] sm:text-[11px] tracking-wider uppercase text-ea-black bg-white px-2 py-0.5 rounded-[3px] border border-ea-black shadow-xs">
                        {project.category}
                      </span>
                    </div>
                  </header>
                ) : project.isCtaCard ? (
                  <header className="w-full bg-[#0E0E0E] border-b-2 border-neutral-800 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-end shrink-0 select-none">
                    <ArrowRight className="w-3.5 h-3.5 text-white/70 shrink-0" />
                  </header>
                ) : (
                  <header className="w-full bg-white border-b-2 border-ea-black px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3 truncate">
                      <h3 className="font-okcok text-base sm:text-lg md:text-xl uppercase text-ea-black tracking-wide truncate">
                        {project.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-anton text-[9.5px] sm:text-[11px] tracking-wider uppercase text-ea-black bg-white px-2 py-0.5 rounded-[3px] border border-ea-black shadow-xs">
                        {project.category}
                      </span>
                      <span className="hidden sm:inline font-mono text-[10px] text-ea-black/60 uppercase">
                        • {project.location}
                      </span>
                    </div>
                  </header>
                )}

                {/* ------------------------------------------------------------- */}
                {/* CARD BODY                                                     */}
                {/* ------------------------------------------------------------- */}
                {project.isEditorialEmptyCard ? (
                  <DeckEmptyCardBody section={project.emptySection || currentTab} />
                ) : project.isCtaCard ? (
                  <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center gap-4 sm:gap-6 bg-[#0E0E0E] text-white overflow-hidden select-none">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 bg-white/5 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>

                    <h4 className="font-okcok text-xl sm:text-2xl md:text-3xl uppercase text-white tracking-wide leading-snug max-w-md">
                      {project.ctaTitle || project.title}
                    </h4>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentTab === 'territorios') {
                            if (onNavigateToSection) onNavigateToSection('territorios');
                            else window.location.hash = '#territorios';
                          } else if (currentTab === 'academia') {
                            if (onNavigateToSection) onNavigateToSection('academia');
                            else window.location.hash = '#academia';
                          } else {
                            if (onNavigateToCatalog) onNavigateToCatalog();
                            else if (onNavigateToSection) onNavigateToSection('proyectos');
                            else window.location.hash = '#proyectos';
                          }
                        }}
                        onMouseEnter={() => setIsCursorHoveringButton(true)}
                        onMouseLeave={() => setIsCursorHoveringButton(false)}
                        className="inline-flex items-center gap-2.5 bg-white text-ea-black hover:bg-neutral-100 px-5 sm:px-6 py-2.5 sm:py-3 rounded-[4px] font-anton text-xs sm:text-[13px] uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                        data-no-deck-cursor
                        title={project.ctaButtonText || 'Explorar catálogo completo'}
                      >
                        <span>{project.ctaButtonText || 'EXPLORAR CATÁLOGO COMPLETO'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-ea-black" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 p-4 sm:p-6 md:p-7 flex flex-col sm:flex-row items-stretch justify-between gap-4 sm:gap-6 overflow-hidden">
                    {/* Left Column: Metadata Capsule, Editorial Description, White Button */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 pr-1 overflow-hidden">
                      <div>
                        {/* Metadata Pill Capsule: Author, Photographer, Year (Aligned with top edge of image) */}
                        <div className="mt-0 px-2 sm:px-2.5 py-1 border border-ea-black rounded-[4px] flex items-center justify-between gap-1.5 sm:gap-2 w-full max-w-[340px] select-none bg-white overflow-hidden box-border">
                          {/* 1. Autor (Sin arroba, se va a segunda línea si es muy grande) */}
                          <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title={`Autoría: ${project.studio}`}>
                            <AuthorIcon className="h-3 sm:h-3.5 w-auto object-contain text-ea-black shrink-0" />
                            <span className="font-okcok text-[9.5px] sm:text-[10px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                              {(project.authorHandle || project.studio).replace(/^@/, '')}
                            </span>
                          </div>

                          {/* 2. Fotografía (solo si está especificado en el proyecto) */}
                          {Boolean(project.photographer?.trim() || project.photographerHandle?.trim()) && (
                            <>
                              <span className="text-ea-black/30 text-[9px] select-none shrink-0">•</span>
                              <div className="flex items-center gap-1 min-w-0 flex-1 overflow-hidden" title={`Fotografía: ${project.photographer}`}>
                                <CameraIcon className="h-2.5 sm:h-3 w-auto object-contain text-ea-black shrink-0" />
                                <span className="font-okcok text-[9.5px] sm:text-[10px] uppercase tracking-wide text-ea-black leading-tight line-clamp-2 break-words min-w-0">
                                  {(project.photographerHandle || project.photographer || '').replace(/^@/, '')}
                                </span>
                              </div>
                            </>
                          )}

                          {/* Separador sutil */}
                          <span className="text-ea-black/30 text-[9px] select-none shrink-0">•</span>

                          {/* 3. Año */}
                          <div className="flex items-center gap-1 shrink-0" title={`Año: ${project.year}`}>
                            <CalendarIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-ea-black shrink-0" />
                            <span className="font-okcok text-[9.5px] sm:text-[10px] uppercase tracking-wide text-ea-black leading-tight shrink-0 whitespace-nowrap">
                              {project.year || '2024'}
                            </span>
                          </div>
                        </div>

                        {/* Editorial Description Text (Faithful to the 2 paragraphs in the mockup) */}
                        <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 font-creato text-xs sm:text-[12px] md:text-[12.5px] text-ea-black/85 leading-relaxed line-clamp-3 sm:line-clamp-4 md:line-clamp-5 max-w-md overflow-hidden">
                          <p>{project.excerpt}</p>
                          {project.secondaryExcerpt && (
                            <p className="hidden sm:block text-ea-black/80">
                              {project.secondaryExcerpt}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Button: White box, thin black border, handwritten font-okcok "VER PROYECTO ➔" */}
                      <div className="pt-3 sm:pt-4 mt-auto shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectProject) onSelectProject(project.linkId || project.id);
                          }}
                          onMouseEnter={() => setIsCursorHoveringButton(true)}
                          onMouseLeave={() => setIsCursorHoveringButton(false)}
                          className="inline-flex items-center gap-2 bg-white text-ea-black hover:bg-neutral-50 px-3.5 sm:px-4 py-1.5 sm:py-2 border border-ea-black rounded-[3px] sm:rounded-[4px] font-okcok text-sm sm:text-base uppercase tracking-wide transition-all shadow-xs hover:translate-x-0.5 cursor-pointer"
                          data-no-deck-cursor
                          title={`Explorar expediente monográfico de ${project.title}`}
                        >
                          <span>{project.actionButtonText || 'VER PROYECTO'}</span>
                          <span className="text-sm sm:text-base leading-none">➔</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Architectural Photography with Dynamic 2nd View Transition */}
                    <div
                      onMouseEnter={() => isFrontCard && setHoveredCardId(project.id)}
                      onMouseLeave={() => isFrontCard && setHoveredCardId(null)}
                      onClick={(e) => {
                        if (!hasDraggedRef.current && isFrontCard && project.secondaryImageUrl) {
                          e.stopPropagation();
                          setManualSecondImageId((prev) => (prev === project.id ? null : project.id));
                        }
                      }}
                      onDragStart={(e) => e.preventDefault()}
                      className="w-full sm:w-[210px] md:w-[250px] lg:w-[280px] h-[145px] sm:h-full shrink-0 rounded-[10px] overflow-hidden bg-neutral-900 relative shadow-inner select-none cursor-pointer group/photo"
                      style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'pan-y' }}
                      title={project.secondaryImageUrl ? 'Pasa el cursor o haz clic para ver la vista secundaria del proyecto' : undefined}
                    >
                      {/* Primary Image: Exterior / Fachada */}
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out pointer-events-none select-none ${
                          isShowingSecondary ? 'scale-105' : 'scale-100 group-hover/photo:scale-105'
                        }`}
                        style={{
                          WebkitUserDrag: 'none',
                          userSelect: 'none',
                        }}
                        loading={idx < 3 ? 'eager' : 'lazy'}
                      />

                      {/* Secondary Image: Interior / Detalle Tectónico (Solid dynamic architectural wipe) */}
                      {project.secondaryImageUrl && (
                        <div
                          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none"
                          style={{
                            clipPath: isShowingSecondary ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
                            transition: 'clip-path 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          <img
                            src={project.secondaryImageUrl}
                            alt={`${project.title} - Vista interior`}
                            draggable={false}
                            onDragStart={(e) => e.preventDefault()}
                            className="w-full h-full object-cover scale-100 transition-transform duration-700 pointer-events-none select-none"
                            style={{
                              WebkitUserDrag: 'none',
                              userSelect: 'none',
                            }}
                            loading="lazy"
                          />
                          {/* Shutter Reveal Line */}
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. BOTTOM FOOTER HINT & EXPLORE CATALOG BUTTON                        */}
      {/* --------------------------------------------------------------------- */}
      <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs font-mono text-ea-black/60 uppercase">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <Compass className="w-3.5 h-3.5 text-ea-black/50 shrink-0" />
          <span className="hidden sm:inline">DESPLÁZATE CON EL SCROLL O USA LAS FLECHAS PARA BARAJAR</span>
          <span className="sm:hidden text-[11px] tracking-wider">DESLIZA CON EL DEDO PARA BARAJAR</span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (currentTab === 'territorios') {
              if (onNavigateToSection) onNavigateToSection('territorios');
              else window.location.hash = '#territorios';
            } else if (currentTab === 'academia') {
              if (onNavigateToSection) onNavigateToSection('academia');
              else window.location.hash = '#academia';
            } else {
              if (onNavigateToCatalog) onNavigateToCatalog();
              else if (onNavigateToSection) onNavigateToSection('proyectos');
              else window.location.hash = '#proyectos';
            }
          }}
          className="font-anton text-xs uppercase tracking-wider text-ea-black/70 hover:text-ea-black hover:underline underline-offset-4 flex items-center gap-1.5 cursor-pointer min-h-[44px] py-2 px-1 active:scale-95 transition-all"
          data-no-deck-cursor
        >
          <span>
            {currentTab === 'territorios'
              ? 'VER MAPA COMPLETO'
              : currentTab === 'academia'
              ? 'VER CATÁLOGO COMPLETO'
              : 'VER CATÁLOGO COMPLETO'}
          </span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 4. CINEMATIC BLACK SHUTTER APERTURE OVERLAY (Portal to document.body, Figma 1440x885) */}
      {typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={shutterRef}
              className="fixed inset-0 z-[99999] pointer-events-none select-none overflow-hidden"
              style={{ visibility: 'hidden' }}
            >
              <div
                ref={apertureRef}
                className="absolute inset-0 w-full h-full bg-ea-black flex flex-col items-center justify-center text-white"
              >
                <FigmaSectionTransition
                  section={shutterSection}
                  isOverlay={true}
                  badgeRef={shutterBadgeRef}
                  titleRef={shutterTitleRef}
                  descRef={shutterDescRef}
                  lineRef={shutterLineRef}
                  iconRef={shutterIconRef}
                  btnRef={shutterBtnRef}
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </section>
  );
};

export default PhysicalCardDeck;
