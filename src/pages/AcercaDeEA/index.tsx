import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Building, BookOpen, Compass, CheckCircle2, ArrowUpRight } from 'lucide-react';

// Brand Assets
import logoUrl from '../../assets/logos/logo.svg';
import tagProyectosUrl from '../../assets/logos/tag_proyectos.svg';
import tagCiudadUrl from '../../assets/logos/tag_ciudad.svg';
import tagDatosUrl from '../../assets/logos/tag_datos.svg';
import tagAcercaBoxUrl from '../../assets/logos/tag_acerca_box.svg';
import tagAcercaDeNosotrosUrl from '../../assets/logos/tag_acerca_de_nosotros.svg';

// Figma SVGs exact from frame #131:1872
import acercaHojaStackOpaqueUrl from '../../assets/svg/acerca_hoja_stack_opaque.svg';
import acercaBtnVectorUrl from '../../assets/svg/acerca_btn_vector.svg';
import acercaPostitTornUrl from '../../assets/svg/acerca_postit_torn.svg';

import { FooterModal, FooterModalTab } from '../../components/footer/FooterModal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface AcercaDeEAProps {
  onNavigate?: (section: string) => void;
  onSelectProject?: (projectId: string) => void;
}

// Tape strip component for the authentic dossier aesthetic
const TapeStrip: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    aria-hidden="true"
    className={`absolute w-10 sm:w-12 h-3.5 sm:h-4 bg-[#E8E6E1]/95 border border-ea-black/30 shadow-[0_1px_2px_rgba(0,0,0,0.18)] pointer-events-none z-30 ${className}`}
    style={{
      backgroundImage:
        'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.035) 2px, rgba(0,0,0,0.035) 4px)',
    }}
  />
);

// Hand-drawn sketched oval doodle around card titles (replicating the architectural sketch in Card 1)
const SketchedBadge: React.FC<{
  children: React.ReactNode;
  variant?: 1 | 2 | 3 | 4 | 5;
  className?: string;
}> = ({ children, variant = 1, className = '' }) => {
  const paths: Record<number, string> = {
    1: 'M 14,24 C 11,9 38,4 68,4 C 102,4 120,9 118,24 C 115,38 94,43 60,43 C 24,43 7,37 9,21 C 11,8 44,4 76,4 C 106,4 122,11 119,26',
    2: 'M 12,22 C 9,8 36,3 72,3 C 108,3 124,8 122,23 C 120,37 98,42 64,42 C 26,42 8,36 10,20 C 12,7 48,3 82,3 C 112,3 126,10 123,25',
    3: 'M 13,23 C 10,9 34,4 64,4 C 98,4 116,10 114,23 C 111,37 90,42 56,42 C 22,42 6,36 8,22 C 10,8 40,4 72,4 C 102,4 118,11 116,25',
    4: 'M 14,25 C 12,10 40,4 74,4 C 110,4 126,10 124,24 C 121,38 96,43 62,43 C 25,43 7,37 10,21 C 12,8 46,4 80,4 C 114,4 128,11 125,26',
    5: 'M 13,24 C 11,9 38,4 70,4 C 104,4 122,9 120,24 C 117,38 94,43 58,43 C 23,43 7,37 9,21 C 12,8 44,4 78,4 C 108,4 124,11 121,26',
  };

  const pathD = paths[variant] || paths[1];

  return (
    <span className={`relative inline-flex items-center justify-center px-3 sm:px-4 py-0.5 sm:py-1 ${className}`}>
      <span className="relative z-10 font-okcok text-sm sm:text-base md:text-[17px] tracking-wider uppercase select-none">
        {children}
      </span>
      <svg
        className="absolute inset-0 w-[calc(100%+14px)] h-[calc(100%+10px)] -top-1.5 -left-1.5 pointer-events-none overflow-visible"
        viewBox="0 0 130 46"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d={pathD}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};

export const AcercaDeEA: React.FC<AcercaDeEAProps> = ({ onNavigate }) => {
  // Modal for Project Submissions & Publicity
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<FooterModalTab>('proyectos');

  // Donation Drawer Modal State
  const [donationDrawerOpen, setDonationDrawerOpen] = useState(false);
  const [selectedDonationTier, setSelectedDonationTier] = useState<number | 'custom'>(15);
  const [customDonationAmount, setCustomDonationAmount] = useState<string>('25');
  const [donationSuccess, setDonationSuccess] = useState(false);

  // Animation Refs
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const sheetsPinSectionRef = useRef<HTMLDivElement>(null);
  const sheet1Ref = useRef<HTMLDivElement>(null);
  const sheet2Ref = useRef<HTMLDivElement>(null);
  const sheet3Ref = useRef<HTMLDivElement>(null);
  const manifestoPinSectionRef = useRef<HTMLDivElement>(null);

  const shufflePinSectionRef = useRef<HTMLDivElement>(null);
  const card0Ref = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);

  const financingSectionRef = useRef<HTMLDivElement>(null);
  const postitPublicidadRef = useRef<HTMLDivElement>(null);
  const postitDonacionesRef = useRef<HTMLDivElement>(null);

  const handleOpenSubmission = () => {
    setModalTab('proyectos');
    setModalOpen(true);
  };

  const handleOpenPublicidad = () => {
    setModalTab('publicidad');
    setModalOpen(true);
  };

  // GSAP Physics ScrollTrigger Animations
  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // =========================================================================
      // 1. TRANSICIÓN HOJA 1 → HOJA 2 → HOJA 3 (FÍSICAS REALES SIN FADE)
      // Cada hoja se levanta y se desliza físicamente fuera de pantalla con inercia,
      // dejando al descubierto la siguiente hoja debajo.
      // =========================================================================
      if (
        sheetsPinSectionRef.current &&
        sheet1Ref.current &&
        sheet2Ref.current &&
        sheet3Ref.current
      ) {
        const sheetsTl = gsap.timeline({
          scrollTrigger: {
            trigger: sheetsPinSectionRef.current,
            start: 'top top',
            end: '+=240%',
            pin: true,
            scrub: prefersReduced ? true : 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
            preventOverlaps: true,
          },
        });

        gsap.set(sheet1Ref.current, { yPercent: 0, xPercent: 0, rotation: 0, zIndex: 30 });
        gsap.set(sheet2Ref.current, { yPercent: 0, xPercent: 0, rotation: 0, zIndex: 20 });
        gsap.set(sheet3Ref.current, { yPercent: 0, xPercent: 0, rotation: 0, zIndex: 10 });

        // Tramo 1: Hoja 1 sale hacia arriba-izquierda, revelando Hoja 2
        sheetsTl.to(sheet1Ref.current, {
          yPercent: -135,
          xPercent: prefersReduced ? 0 : -4,
          rotation: prefersReduced ? 0 : -4,
          ease: 'power2.inOut',
          duration: 1,
        });

        // Tramo 2: Hoja 2 sale hacia arriba-derecha, revelando Hoja 3
        sheetsTl.to(sheet2Ref.current, {
          yPercent: -135,
          xPercent: prefersReduced ? 0 : 4,
          rotation: prefersReduced ? 0 : 3.5,
          ease: 'power2.inOut',
          duration: 1,
        });
      }

      // =========================================================================
      // 2. CINCO FUNDAMENTOS DE ECUADORIAN ARCHITECTURE (TARJETAS INDEPENDIENTES)
      // Cada tarjeta aparece una a una con el scroll en posiciones distintas.
      // Al final del scroll, las 5 quedan 100% visibles y legibles a la vez.
      // =========================================================================
      if (manifestoPinSectionRef.current) {
        const mm = gsap.matchMedia();

        // DESKTOP & TABLET (>= 768px): Cuadrícula editorial de 5 posiciones
        mm.add('(min-width: 768px)', () => {
          const deskCards = [
            { el: '.manifesto-desk-1', xOffset: prefersReduced ? 0 : -20, rot: prefersReduced ? 0 : -1.2 },
            { el: '.manifesto-desk-2', xOffset: 0, rot: prefersReduced ? 0 : 1.0 },
            { el: '.manifesto-desk-3', xOffset: prefersReduced ? 0 : 20, rot: prefersReduced ? 0 : -0.8 },
            { el: '.manifesto-desk-4', xOffset: prefersReduced ? 0 : -16, rot: prefersReduced ? 0 : 0.8 },
            { el: '.manifesto-desk-5', xOffset: prefersReduced ? 0 : 16, rot: prefersReduced ? 0 : -1.0 },
          ];

          deskCards.forEach((c) => {
            gsap.set(c.el, {
              opacity: 0,
              y: 35,
              x: c.xOffset,
              scale: 0.94,
              rotation: 0,
            });
          });

          const manifestoTl = gsap.timeline({
            scrollTrigger: {
              trigger: manifestoPinSectionRef.current,
              start: 'top top',
              end: '+=260%',
              pin: true,
              scrub: prefersReduced ? true : 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              fastScrollEnd: true,
              preventOverlaps: true,
            },
          });

          // Paso 1: Hipótesis (Fundamento)
          manifestoTl.to('.manifesto-desk-1', {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotation: prefersReduced ? 0 : -1.2,
            duration: 1,
            ease: 'power2.out',
          }, 0.1);

          // Paso 2: Convicción (Creencia)
          manifestoTl.to('.manifesto-desk-2', {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotation: prefersReduced ? 0 : 1.0,
            duration: 1,
            ease: 'power2.out',
          }, 0.7);

          // Paso 3: Acción (Método)
          manifestoTl.to('.manifesto-desk-3', {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotation: prefersReduced ? 0 : -0.8,
            duration: 1,
            ease: 'power2.out',
          }, 1.3);

          // Paso 4: Propósito (Visión)
          manifestoTl.to('.manifesto-desk-4', {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotation: prefersReduced ? 0 : 0.8,
            duration: 1,
            ease: 'power2.out',
          }, 1.9);

          // Paso 5: Principio (Axioma culminante)
          manifestoTl.to('.manifesto-desk-5', {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotation: prefersReduced ? 0 : -1.0,
            duration: 1,
            ease: 'power2.out',
          }, 2.5);

          // Buffer final: mantiene todas las 5 tarjetas visibles para lectura cómoda
          manifestoTl.to({}, { duration: 0.6 });
        });

        // MOBILE (< 768px): Columna compacta vertical
        mm.add('(max-width: 767px)', () => {
          gsap.set('.manifesto-mob-card', {
            opacity: 0,
            y: 20,
            scale: 0.95,
          });

          const mobTl = gsap.timeline({
            scrollTrigger: {
              trigger: manifestoPinSectionRef.current,
              start: 'top top',
              end: '+=220%',
              pin: true,
              scrub: prefersReduced ? true : 0.5,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              fastScrollEnd: true,
              preventOverlaps: true,
            },
          });

          mobTl.to('.manifesto-mob-1', { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }, 0.1)
            .to('.manifesto-mob-2', { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }, 0.6)
            .to('.manifesto-mob-3', { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }, 1.1)
            .to('.manifesto-mob-4', { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }, 1.6)
            .to('.manifesto-mob-5', { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' }, 2.1)
            .to({}, { duration: 0.5 });
        });
      }

      // =========================================================================
      // 2. EFECTO "BARAJAR" MAZO DE TARJETAS EN "APORTAR AL ESPACIO"
      // Cada tramo de scroll saca la carta de adelante hacia un lado
      // y la coloca al fondo de la pila como un verdadero barajado de cartas.
      // Bidireccional (bajar y subir), movimiento 100% horizontal, sin desvanecimientos.
      // =========================================================================
      if (
        shufflePinSectionRef.current &&
        card0Ref.current &&
        card1Ref.current &&
        card2Ref.current
      ) {
        // Estado inicial del mazo apilado
        gsap.set(card0Ref.current, {
          xPercent: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          zIndex: 30,
        });
        gsap.set(card1Ref.current, {
          xPercent: 0,
          y: 18,
          scale: 0.95,
          rotation: prefersReduced ? 0 : 2.2,
          zIndex: 20,
        });
        gsap.set(card2Ref.current, {
          xPercent: 0,
          y: 36,
          scale: 0.9,
          rotation: prefersReduced ? 0 : -2.2,
          zIndex: 10,
        });

        const shuffleTl = gsap.timeline({
          scrollTrigger: {
            trigger: shufflePinSectionRef.current,
            start: 'top top',
            end: '+=200%',
            pin: true,
            scrub: prefersReduced ? true : 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
            preventOverlaps: true,
          },
        });

        // TRAMO 1: Carta 0 sale horizontalmente a la izquierda y se coloca al final de la pila.
        // Cartas 1 y 2 avanzan.
        shuffleTl
          .to(
            card0Ref.current,
            {
              xPercent: -125,
              y: 0,
              rotation: prefersReduced ? 0 : -8,
              ease: 'power2.inOut',
              duration: 0.5,
            },
            0
          )
          .to(
            card1Ref.current,
            {
              y: 0,
              scale: 1,
              rotation: 0,
              zIndex: 28,
              ease: 'power2.out',
              duration: 0.5,
            },
            0.1
          )
          .to(
            card2Ref.current,
            {
              y: 18,
              scale: 0.95,
              rotation: prefersReduced ? 0 : 2.2,
              zIndex: 18,
              ease: 'power2.out',
              duration: 0.5,
            },
            0.1
          )
          .set(
            card0Ref.current,
            {
              zIndex: 8,
              scale: 0.9,
              y: 36,
              rotation: prefersReduced ? 0 : -2.2,
            },
            0.5
          )
          .to(
            card0Ref.current,
            {
              xPercent: 0,
              ease: 'power2.out',
              duration: 0.5,
            },
            0.5
          );

        // TRAMO 2: Carta 1 (ahora al frente) sale horizontalmente a la derecha y se coloca al final de la pila.
        // Carta 2 pasa al frente y Carta 0 pasa al medio.
        shuffleTl
          .to(
            card1Ref.current,
            {
              xPercent: 125,
              y: 0,
              rotation: prefersReduced ? 0 : 8,
              ease: 'power2.inOut',
              duration: 0.5,
            },
            1.0
          )
          .to(
            card2Ref.current,
            {
              y: 0,
              scale: 1,
              rotation: 0,
              zIndex: 35,
              ease: 'power2.out',
              duration: 0.5,
            },
            1.1
          )
          .to(
            card0Ref.current,
            {
              y: 18,
              scale: 0.95,
              rotation: prefersReduced ? 0 : -2.2,
              zIndex: 22,
              ease: 'power2.out',
              duration: 0.5,
            },
            1.1
          )
          .set(
            card1Ref.current,
            {
              zIndex: 12,
              scale: 0.9,
              y: 36,
              rotation: prefersReduced ? 0 : 2.2,
            },
            1.5
          )
          .to(
            card1Ref.current,
            {
              xPercent: 0,
              ease: 'power2.out',
              duration: 0.5,
            },
            1.5
          );
      }

      // =========================================================================
      // 3. ENTRADA DE NOTAS EN "COMO NOS FINANCIAMOS?": PUBLICIDAD LUEGO DONACIÓN
      // =========================================================================
      if (
        financingSectionRef.current &&
        postitPublicidadRef.current &&
        postitDonacionesRef.current
      ) {
        gsap.fromTo(
          postitPublicidadRef.current,
          { y: 30 },
          {
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: financingSectionRef.current,
              start: 'top 85%',
              end: 'top 55%',
              scrub: 0.8,
            },
          }
        );

        gsap.fromTo(
          postitDonacionesRef.current,
          { y: 50 },
          {
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: financingSectionRef.current,
              start: 'top 75%',
              end: 'top 45%',
              scrub: 0.8,
            },
          }
        );
      }
    },
    { scope: pageContainerRef }
  );

  return (
    <div
      ref={pageContainerRef}
      className="w-full min-h-screen bg-white text-ea-black font-okcok overflow-x-hidden selection:bg-ea-black selection:text-white"
    >
      {/* ========================================================================= */}
      {/* 1. HEADER 1:1 CON FIGMA FRAME "ACERCA EA" (#131:1872)                     */}
      {/* Izquierda: "ACERCA DE" + logo doodle "ea"                                 */}
      {/* Derecha: Pilares CIUDAD (Territorios), DATOS (Academia), BOX (Acerca de)  */}
      {/* ========================================================================= */}
      <header className="w-full max-w-[1440px] mx-auto px-4 sm:px-12 md:px-20 pt-6 sm:pt-12 pb-4 flex items-center justify-between select-none">
        {/* Left: ACERCA DE + logo.svg (Exacto a Figma) */}
        <div
          onClick={() => {
            if (onNavigate) onNavigate('home');
            else window.location.hash = '';
          }}
          className="flex items-center gap-2.5 sm:gap-4 cursor-pointer group shrink-0"
          data-cursor
          title="Volver al portal principal"
        >
          <span className="font-okcok text-[clamp(1.5rem,5.5vw,3rem)] uppercase tracking-normal text-ea-black leading-[1.2] py-0.5 inline-block overflow-visible whitespace-nowrap">
            ACERCA DE
          </span>
          <img
            src={logoUrl}
            alt="ea"
            className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 object-contain group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Right: The 4 Navigation Pillars (Proyectos, Territorios, Academia, Acerca de EA) */}
        <nav
          aria-label="Pilares editoriales"
          className="flex items-center sm:items-end gap-2.5 sm:gap-7 md:gap-9 shrink-0"
        >
          {/* Pillar 0: PROYECTOS (Inactivo en este frame) */}
          <button
            onClick={() => {
              if (onNavigate) onNavigate('proyectos');
              else window.location.hash = '#proyectos';
            }}
            className="flex flex-col items-center group cursor-pointer opacity-40 hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-ea-black/70 focus-visible:outline-hidden min-h-[44px] min-w-[36px] sm:min-w-[44px] justify-center p-1 active:scale-95"
            data-cursor
            title="Ir a Proyectos"
          >
            <div className="w-7 h-7 sm:w-14 sm:h-14 flex items-center justify-center">
              <img
                src={tagProyectosUrl}
                alt="PROYECTOS"
                className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="hidden sm:block font-anton text-[9.5px] sm:text-[10.5px] tracking-widest text-ea-black uppercase mt-1">
              PROYECTOS
            </span>
          </button>

          {/* Pillar 1: TERRITORIOS (Inactivo en este frame) */}
          <button
            onClick={() => {
              if (onNavigate) onNavigate('territorios');
              else window.location.hash = '#territorios';
            }}
            className="flex flex-col items-center group cursor-pointer opacity-40 hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-ea-black/70 focus-visible:outline-hidden min-h-[44px] min-w-[36px] sm:min-w-[44px] justify-center p-1 active:scale-95"
            data-cursor
            title="Ir a Territorios"
          >
            <div className="w-7 h-7 sm:w-14 sm:h-14 flex items-center justify-center">
              <img
                src={tagCiudadUrl}
                alt="TERRITORIOS"
                className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="hidden sm:block font-anton text-[9.5px] sm:text-[10.5px] tracking-widest text-ea-black uppercase mt-1">
              TERRITORIOS
            </span>
          </button>

          {/* Pillar 2: ACADEMIA (Inactivo en este frame) */}
          <button
            onClick={() => {
              if (onNavigate) onNavigate('academia');
              else window.location.hash = '#academia';
            }}
            className="flex flex-col items-center group cursor-pointer opacity-40 hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-ea-black/70 focus-visible:outline-hidden min-h-[44px] min-w-[36px] sm:min-w-[44px] justify-center p-1 active:scale-95"
            data-cursor
            title="Ir a Academia"
          >
            <div className="w-7 h-7 sm:w-14 sm:h-14 flex items-center justify-center">
              <img
                src={tagDatosUrl}
                alt="ACADEMIA"
                className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="hidden sm:block font-anton text-[9.5px] sm:text-[10.5px] tracking-widest text-ea-black uppercase mt-1">
              ACADEMIA
            </span>
          </button>

          {/* Pillar 3: ACERCA DE EA (ACTIVO - 100% Black) */}
          <div
            className="flex flex-col items-center cursor-default opacity-100 min-h-[44px] min-w-[36px] sm:min-w-[44px] justify-center p-1"
            title="Sección actual: Acerca de EA"
          >
            <div className="w-7 h-7 sm:w-14 sm:h-14 flex items-center justify-center">
              <img
                src={tagAcercaBoxUrl}
                alt="ACERCA DE EA"
                className="max-h-full max-w-full object-contain drop-shadow-sm scale-110"
              />
            </div>
            <span className="hidden sm:block font-anton text-[9.5px] sm:text-[10.5px] tracking-widest text-ea-black uppercase mt-1 font-bold">
              ACERCA DE EA
            </span>
          </div>
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* 2. PINNED CONTAINER: HOJA 1 (MANIFIESTO) → HOJA 2 (TEXTO CENTRADO) → HOJA 3 */}
      {/* El texto está estrictamente contenido en la zona segura superior,         */}
      {/* garantizando con clamp() que NUNCA se cruce con los trazos ni con el fold */}
      {/* ========================================================================= */}
      <section
        ref={sheetsPinSectionRef}
        className="relative w-full min-h-screen md:h-screen flex items-center justify-center px-4 sm:px-6 py-4 sm:py-6 overflow-hidden bg-white select-none"
      >
        <div className="relative w-full max-w-[620px] sm:max-w-[680px] md:max-w-[720px] aspect-[991/1136] max-h-[82vh] sm:max-h-[85vh] flex items-center justify-center">
          {/* ------------------------------------------------------------------- */}
          {/* HOJA 3 – CONVERSACIONES (REPOSA EN EL FONDO, z-index 10)            */}
          {/* ------------------------------------------------------------------- */}
          <article
            ref={sheet3Ref}
            className="absolute inset-0 w-full h-full will-change-transform z-10 flex items-center justify-center"
          >
            {/* SVG del contorno exacto de la pila de hojas con fondo blanco opaco */}
            <img
              src={acercaHojaStackOpaqueUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
            />

            {/* Zona segura de texto: confinada al 58% superior */}
            <div className="absolute top-[12%] sm:top-[14%] left-[13%] right-[13%] bottom-[28%] z-20 flex flex-col items-center justify-center text-center px-2 sm:px-4">
              {/* Logo / Doodle de conversación idéntico a Figma */}
              <div className="w-12 sm:w-14 md:w-16 mb-3 sm:mb-4 shrink-0">
                <img
                  src={tagAcercaDeNosotrosUrl}
                  alt=""
                  className="w-full h-auto object-contain mx-auto"
                />
              </div>

              {/* Texto exacto requerido para Hoja 3 */}
              <div className="font-okcok uppercase text-ea-black text-center max-w-[480px] space-y-2 sm:space-y-3">
                <p className="text-[clamp(10px,2.4vw,13px)] leading-[clamp(14px,3.2vw,19px)] tracking-wider text-ea-black/75">
                  ESTE ESPACIO SE CONSTRUYÓ TRAS PROFUNDAS CONVERSACIONES CON:
                </p>
                <p className="text-[clamp(10.5px,2.5vw,14px)] leading-[clamp(15px,3.5vw,22px)] tracking-wide text-ea-black font-bold">
                  JOSE GRANDA, ESTEBAN NAJAS, ERDC ARQUITECTOS, JOSE MARIA SAENZ, PASCUAL GANGOTENA, BERNARDO ROSERO, JOSE GOMEZ, TODOS LOS ASISTENTES DEL PAREDÓN DEL 29 DE OCTUBRE DE 2026.
                </p>
                <p className="text-[clamp(10px,2.4vw,13px)] leading-[clamp(14px,3.2vw,19px)] tracking-wider text-ea-black/90 pt-0.5 sm:pt-1">
                  GRACIAS POR SER LOS CIMIENTOS DE ESTE ESPACIO.
                </p>
              </div>
            </div>
          </article>

          {/* ------------------------------------------------------------------- */}
          {/* HOJA 2 – DEMOCRATIZAR ACCESO (REPOSA EN EL MEDIO, z-index 20)       */}
          {/* ------------------------------------------------------------------- */}
          <article
            ref={sheet2Ref}
            className="absolute inset-0 w-full h-full will-change-transform z-20 flex items-center justify-center"
          >
            {/* SVG del contorno exacto de la pila de hojas con fondo blanco opaco */}
            <img
              src={acercaHojaStackOpaqueUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
            />

            {/* Zona segura de texto: confinada al 58% superior (termina en Y=72%, muy por encima del fold a Y=76.5%) */}
            <div className="absolute top-[12%] sm:top-[14%] left-[13%] right-[13%] bottom-[28%] z-20 flex flex-col items-center justify-center text-center px-2 sm:px-4">
              {/* Logo / Doodle de conversación idéntico a Figma */}
              <div className="w-12 sm:w-14 md:w-16 mb-3 sm:mb-4 shrink-0">
                <img
                  src={tagAcercaDeNosotrosUrl}
                  alt=""
                  className="w-full h-auto object-contain mx-auto"
                />
              </div>

              {/* Texto exacto requerido para Hoja 2 */}
              <p className="font-okcok text-[clamp(11px,2.8vw,15.5px)] uppercase text-ea-black leading-[clamp(15.5px,3.8vw,24px)] tracking-wide text-center max-w-[440px]">
                “Ecuadorian Architecture busca democratizar el acceso a la opinión, a la crítica y a la conversación, lejos del elitismo de una profesión que ha buscado que sea así. La arquitectura y las decisiones de ciudad nos afectan a todos y, por ello, es justo que todos seamos parte. Porque tenemos la convicción de que aquí todas las voces son relevantes.”
              </p>
            </div>
          </article>

          {/* ------------------------------------------------------------------- */}
          {/* HOJA 1 – MANIFIESTO (REPOSA ENCIMA, z-index 30)                     */}
          {/* El texto respeta exactamente las 15 líneas y NUNCA toca el trazo    */}
          {/* ------------------------------------------------------------------- */}
          <article
            ref={sheet1Ref}
            className="absolute inset-0 w-full h-full will-change-transform z-30 flex items-center justify-center"
          >
            {/* SVG del contorno exacto con fondo blanco opaco */}
            <img
              src={acercaHojaStackOpaqueUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
            />

            {/* Zona segura de texto: confinada al 58% superior, garantizando 0 colisión con el trazo y dog-ear */}
            <div className="absolute top-[12%] sm:top-[13%] left-[13%] right-[13%] bottom-[28%] z-20 flex flex-col items-center justify-center text-center px-2 sm:px-4">
              {/* Doodle superior: e 💬 9 de Figma */}
              <div className="w-10 sm:w-12 md:w-15 mb-1.5 sm:mb-2.5 shrink-0">
                <img
                  src={tagAcercaDeNosotrosUrl}
                  alt=""
                  className="w-full h-auto object-contain mx-auto"
                />
              </div>

              {/* Texto exacto del manifiesto con las 15 líneas formateadas limpiamente */}
              <div className="font-okcok text-[clamp(9.5px,2.4vw,12.5px)] uppercase text-ea-black leading-[clamp(13px,3.3vw,18.5px)] tracking-tight text-center max-w-[460px]">
                <p>EL FIN ÚLTIMO DE ESTE ESPACIO ES GENERAR UN</p>
                <p>CAMBIO, SURGE DE UN NATURAL DESEO DE CONSTRUIR,</p>
                <p>RE PENSAR Y DESAPRENDER CONCEPTOS</p>
                <p>PARADIGMÁTICOS DE UNA PROFESIÓN ENALTECIDA POR</p>
                <p>MUCHOS, EN UNA SOCIEDAD TAN POLARIZADA, ESTE ES</p>
                <p>NUESTRO INTENTO POR APORTAR A MEJORAR, CON</p>
                <p>CONVICCIONES PERO SIN PRETENSIONES, CREEMOS QUE</p>
                <p>CRITICAR ES CONSTRUIR, NO CREEMOS QUE EXISTE</p>
                <p>CRÍTICA POSITIVA Y NEGATIVA, CREEMOS QUE EXISTE</p>
                <p>CRÍTICA, Y ESTA DEBE SER ENTENDIDA COMO UNA</p>
                <p>PERSPECTIVA DIFERENTE A LOS OJOS EGOÍSTAS QUE</p>
                <p>CREEN TENER LA RAZÓN, CON ELLO LA CRÍTICA ES UN</p>
                <p>PROFUNDO ACTO DE RESPETO, DE ENTENDER QUE EL</p>
                <p>OTRO TIENE MUCHO QUE DECIR, QUE EXISTE Y POR</p>
                <p>ELLO ES JUSTO CONVERSAR, OPINAR Y CRITICAR.</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PINNED CONTAINER: CINCO FUNDAMENTOS DE ECUADORIAN ARCHITECTURE         */}
      {/* 5 tarjetas físicas independientes que aparecen una a una con el scroll,    */}
      {/* ubicándose en lugares distintos sin apilarse para leer las 5 juntas.      */}
      {/* ========================================================================= */}
      <section
        ref={manifestoPinSectionRef}
        className="relative w-full min-h-screen md:h-screen flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 lg:px-12 py-6 overflow-hidden bg-white select-none border-t border-ea-black/10"
      >
        {/* Curatorial Header exact to mockup: 5 FUNDAMENTOS DE ECUADORIAN ARCHITECTURE in OKCOK font */}
        <div className="w-full max-w-[1240px] text-center mb-6 sm:mb-8 md:mb-10 shrink-0">
          <h2 className="font-okcok text-3xl sm:text-4xl md:text-5xl lg:text-[52px] text-ea-black uppercase tracking-wide leading-[1.05]">
            5 FUNDAMENTOS
            <br />
            DE ECUADORIAN ARCHITECTURE
          </h2>
        </div>

        {/* 5-Card Distributed Editorial Board */}
        <div className="w-full max-w-[1240px] flex-1 max-h-[720px] flex flex-col justify-center">
          {/* DESKTOP & TABLET: 12-Column Editorial Grid (3 cards top, 2 cards bottom) */}
          <div className="hidden md:grid grid-cols-12 gap-3.5 lg:gap-5 w-full items-stretch">
            {/* 01. HIPÓTESIS */}
            <article
              className="manifesto-desk-1 col-span-4 bg-white border-2 border-ea-black rounded-[18px] sm:rounded-[20px] p-5 lg:p-6 shadow-[5px_5px_0px_#000000] flex flex-col justify-between relative will-change-transform min-h-[175px] lg:min-h-[195px]"
            >
              <TapeStrip className="-top-2.5 left-6 -rotate-6" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <SketchedBadge variant={1}>HIPÓTESIS</SketchedBadge>
                  <span className="font-anton text-[9.5px] sm:text-[10.5px] tracking-widest uppercase text-ea-black/40">
                    FUNDAMENTO
                  </span>
                </div>
                <p className="font-okcok text-base lg:text-[17px] uppercase text-ea-black leading-[1.3] tracking-wide pt-1">
                  La producción arquitectónica ecuatoriana posee un valor que trasciende lo construido.
                </p>
              </div>
              <div className="pt-2 flex justify-end">
                <span className="font-mono text-[9px] text-ea-black/35 uppercase">
                  EA // 01
                </span>
              </div>
            </article>

            {/* 02. CONVICCIÓN */}
            <article
              className="manifesto-desk-2 col-span-4 bg-white border-2 border-ea-black rounded-[18px] sm:rounded-[20px] p-5 lg:p-6 shadow-[5px_5px_0px_#000000] flex flex-col justify-between relative will-change-transform min-h-[175px] lg:min-h-[195px]"
            >
              <TapeStrip className="-top-2.5 right-6 rotate-4" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <SketchedBadge variant={2}>CONVICCIÓN</SketchedBadge>
                  <span className="font-anton text-[9.5px] sm:text-[10.5px] tracking-widest uppercase text-ea-black/40">
                    CREENCIA
                  </span>
                </div>
                <p className="font-okcok text-[15px] lg:text-[16.5px] uppercase text-ea-black leading-[1.3] tracking-wide pt-1">
                  Creemos que reconocer ese valor implica ir más allá de la contemplación. Necesitamos observar, interpretar y cuestionar la arquitectura que producimos.
                </p>
              </div>
              <div className="pt-2 flex justify-end">
                <span className="font-mono text-[9px] text-ea-black/35 uppercase">
                  EA // 02
                </span>
              </div>
            </article>

            {/* 03. ACCIÓN */}
            <article
              className="manifesto-desk-3 col-span-4 bg-white border-2 border-ea-black rounded-[18px] sm:rounded-[20px] p-5 lg:p-6 shadow-[5px_5px_0px_#000000] flex flex-col justify-between relative will-change-transform min-h-[175px] lg:min-h-[195px]"
            >
              <TapeStrip className="-top-2.5 right-6 -rotate-3" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <SketchedBadge variant={3}>ACCIÓN</SketchedBadge>
                  <span className="font-anton text-[9.5px] sm:text-[10.5px] tracking-widest uppercase text-ea-black/40">
                    METODO
                  </span>
                </div>
                <p className="font-okcok text-[15px] lg:text-[16.5px] uppercase text-ea-black leading-[1.3] tracking-wide pt-1">
                  Criticar, investigar, documentar y difundir. Generar espacios de discusión donde las ideas puedan confrontarse, cuestionarse y evolucionar.
                </p>
              </div>
              <div className="pt-2 flex justify-end">
                <span className="font-mono text-[9px] text-ea-black/35 uppercase">
                  EA // 03
                </span>
              </div>
            </article>

            {/* 04. PROPÓSITO */}
            <article
              className="manifesto-desk-4 col-span-6 bg-white border-2 border-ea-black rounded-[18px] sm:rounded-[20px] p-5 lg:p-6 shadow-[5px_5px_0px_#000000] flex flex-col justify-between relative will-change-transform min-h-[160px] lg:min-h-[180px]"
            >
              <TapeStrip className="-top-2.5 left-6 rotate-4" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <SketchedBadge variant={4}>PROPÓSITO</SketchedBadge>
                  <span className="font-anton text-[9.5px] sm:text-[10.5px] tracking-widest uppercase text-ea-black/40">
                    VISION
                  </span>
                </div>
                <p className="font-okcok text-base lg:text-[17.5px] uppercase text-ea-black leading-[1.3] tracking-wide pt-1">
                  Contribuir a una cultura arquitectónica más crítica, consciente y participativa, capaz de impulsar el pensamiento y la producción arquitectónica ecuatoriana.
                </p>
              </div>
              <div className="pt-2 flex justify-end">
                <span className="font-mono text-[9px] text-ea-black/35 uppercase">
                  EA // 04
                </span>
              </div>
            </article>

            {/* 05. PRINCIPIO (Card de alto contraste arquitectónico) */}
            <article
              className="manifesto-desk-5 col-span-6 bg-[#0E0E0E] text-white border-2 border-ea-black rounded-[18px] sm:rounded-[20px] p-5 lg:p-6 shadow-[5px_5px_0px_#000000] flex flex-col justify-between relative will-change-transform min-h-[160px] lg:min-h-[180px]"
            >
              <TapeStrip className="-top-2.5 right-6 -rotate-2" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <SketchedBadge variant={5}>PRINCIPIO</SketchedBadge>
                  <span className="font-anton text-[9.5px] sm:text-[10.5px] tracking-widest uppercase text-white/50">
                    AXIOMA
                  </span>
                </div>
                <p className="font-okcok text-lg lg:text-[20px] uppercase text-white leading-[1.3] tracking-wide pt-1">
                  “La crítica no debilita aquello que cuestiona. Lo pone en movimiento.”
                </p>
              </div>
              <div className="pt-2 flex justify-end">
                <span className="font-mono text-[9px] text-white/40 uppercase">
                  EA // MANIFIESTO FINAL
                </span>
              </div>
            </article>
          </div>

          {/* MOBILE: Clean Vertical Column (All 5 fit cleanly on screen, appear one by one) */}
          <div className="flex md:hidden flex-col gap-2.5 w-full max-w-[460px] mx-auto">
            {/* Card 1 Mob */}
            <article
              className="manifesto-mob-card manifesto-mob-1 bg-white border-2 border-ea-black rounded-[14px] p-2.5 sm:p-3 shadow-[2.5px_2.5px_0px_#000000] relative will-change-transform"
            >
              <TapeStrip className="-top-2 left-4 -rotate-6 w-8 h-2.5" />
              <div className="flex items-center justify-between mb-1">
                <SketchedBadge variant={1} className="scale-90 origin-left">HIPÓTESIS</SketchedBadge>
                <span className="font-anton text-[9px] text-ea-black/40 uppercase">FUNDAMENTO</span>
              </div>
              <p className="font-okcok text-[11px] sm:text-[12px] uppercase text-ea-black leading-snug pt-0.5">
                La producción arquitectónica ecuatoriana posee un valor que trasciende lo construido.
              </p>
            </article>

            {/* Card 2 Mob */}
            <article
              className="manifesto-mob-card manifesto-mob-2 bg-white border-2 border-ea-black rounded-[14px] p-2.5 sm:p-3 shadow-[2.5px_2.5px_0px_#000000] relative will-change-transform"
            >
              <TapeStrip className="-top-2 right-4 rotate-4 w-8 h-2.5" />
              <div className="flex items-center justify-between mb-1">
                <SketchedBadge variant={2} className="scale-90 origin-left">CONVICCIÓN</SketchedBadge>
                <span className="font-anton text-[9px] text-ea-black/40 uppercase">CREENCIA</span>
              </div>
              <p className="font-okcok text-[11px] sm:text-[12px] uppercase text-ea-black leading-snug pt-0.5">
                Creemos que reconocer ese valor implica ir más allá de la contemplación. Necesitamos observar, interpretar y cuestionar la arquitectura que producimos.
              </p>
            </article>

            {/* Card 3 Mob */}
            <article
              className="manifesto-mob-card manifesto-mob-3 bg-white border-2 border-ea-black rounded-[14px] p-2.5 sm:p-3 shadow-[2.5px_2.5px_0px_#000000] relative will-change-transform"
            >
              <TapeStrip className="-top-2 right-4 -rotate-3 w-8 h-2.5" />
              <div className="flex items-center justify-between mb-1">
                <SketchedBadge variant={3} className="scale-90 origin-left">ACCIÓN</SketchedBadge>
                <span className="font-anton text-[9px] text-ea-black/40 uppercase">METODO</span>
              </div>
              <p className="font-okcok text-[11px] sm:text-[12px] uppercase text-ea-black leading-snug pt-0.5">
                Criticar, investigar, documentar y difundir. Generar espacios de discusión donde las ideas puedan confrontarse, cuestionarse y evolucionar.
              </p>
            </article>

            {/* Card 4 Mob */}
            <article
              className="manifesto-mob-card manifesto-mob-4 bg-white border-2 border-ea-black rounded-[14px] p-2.5 sm:p-3 shadow-[2.5px_2.5px_0px_#000000] relative will-change-transform"
            >
              <TapeStrip className="-top-2 left-4 rotate-4 w-8 h-2.5" />
              <div className="flex items-center justify-between mb-1">
                <SketchedBadge variant={4} className="scale-90 origin-left">PROPÓSITO</SketchedBadge>
                <span className="font-anton text-[9px] text-ea-black/40 uppercase">VISION</span>
              </div>
              <p className="font-okcok text-[11px] sm:text-[12px] uppercase text-ea-black leading-snug pt-0.5">
                Contribuir a una cultura arquitectónica más crítica, consciente y participativa, capaz de impulsar el pensamiento y la producción arquitectónica ecuatoriana.
              </p>
            </article>

            {/* Card 5 Mob */}
            <article
              className="manifesto-mob-card manifesto-mob-5 bg-[#0E0E0E] text-white border-2 border-ea-black rounded-[14px] p-2.5 sm:p-3 shadow-[2.5px_2.5px_0px_#000000] relative will-change-transform"
            >
              <TapeStrip className="-top-2 right-4 -rotate-2 w-8 h-2.5" />
              <div className="flex items-center justify-between mb-1">
                <SketchedBadge variant={5} className="scale-90 origin-left">PRINCIPIO</SketchedBadge>
                <span className="font-anton text-[9px] text-white/50 uppercase">AXIOMA</span>
              </div>
              <p className="font-okcok text-[11.5px] sm:text-[12.5px] uppercase text-white leading-snug pt-0.5">
                “La crítica no debilita aquello que cuestiona. Lo pone en movimiento.”
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECCIÓN: "APORTAR AL ESPACIO" (MAZO DE TARJETAS DINÁMICO CON BARAJADO)  */}
      {/* Tarjetas físicas apiladas que con scroll se barajan una detrás de otra    */}
      {/* ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-24 border-t border-ea-black/10 select-none">
        {/* Encabezado Curatorial */}
        <div className="w-full max-w-[1080px] mx-auto px-6 sm:px-10 text-center mb-10">
          <h2 className="font-okcok text-3xl sm:text-4xl md:text-5xl text-ea-black uppercase tracking-wide mb-4">
            APORTAR AL ESPACIO
          </h2>

          <p className="font-okcok text-xs sm:text-sm md:text-base uppercase leading-relaxed text-ea-black/85 max-w-[820px] mx-auto">
            TRABAJAMOS CON UN PROCESO METODOLÓGICO CURATORIAL: LOS PROYECTOS RECIBIDOS SON SOMETIDOS A PREGUNTAS RELACIONADAS CON 3 FUNDAMENTOS: CONTEXTOS, RECURSIVIDAD Y RESPONSABILIDAD. A PARTIR DE ESO, SE ENTIENDE QUE LOS PROYECTOS RECIBIDOS TIENEN COMPLETA APERTURA AL EJERCICIO CRÍTICO DE LA COMUNIDAD O REDACTORES INTERESADOS EN ESCRIBIR UNA CRÍTICA.
          </p>

          <span className="inline-block mt-3 font-anton text-[10px] sm:text-xs tracking-widest text-ea-black/40 uppercase">
            ↓ DESPLAZA EL SCROLL PARA BARAJAR EL MAZO DE POSTULACIÓN ↓
          </span>
        </div>

        {/* Pinned Card Deck Section (Shuffle Effect) */}
        <div
          ref={shufflePinSectionRef}
          className="relative w-full min-h-[600px] sm:min-h-[660px] md:h-screen flex flex-col items-center justify-center px-3 sm:px-6 pt-10 pb-8 overflow-hidden"
        >
          <div className="relative w-full max-w-[min(420px,calc(100vw-2.5rem))] sm:max-w-[470px] md:max-w-[520px] h-[530px] sm:h-[560px] flex items-center justify-center">
            {/* ----------------------------------------------------------------- */}
            {/* CARTA 3 (AL FONDO INICIALMENTE, z-index 10)                       */}
            {/* ----------------------------------------------------------------- */}
            <article
              ref={card2Ref}
              className="absolute inset-0 w-full h-full bg-[#FAF9F6] border-2 border-ea-black rounded-[20px] sm:rounded-[26px] shadow-[5px_5px_0px_#000000] sm:shadow-[8px_8px_0px_#000000] p-5 sm:p-7 md:p-8 flex flex-col justify-between will-change-transform"
            >
              {/* Folder tab at top right */}
              <div className="absolute -top-7 right-6 px-3 sm:px-4 py-1 bg-[#FAF9F6] border-t-2 border-x-2 border-ea-black rounded-t-md font-anton text-[10px] sm:text-[11px] tracking-widest uppercase text-ea-black/80 flex items-center gap-1.5 shadow-2xs">
                <span>03</span>
                <span>/</span>
                <span>INVESTIGACIÓN</span>
              </div>

              <TapeStrip className="-top-3 left-8 -rotate-6" />

              <div>
                <div className="flex items-center justify-between border-b border-ea-black/20 pb-2.5 mb-4">
                  <span className="font-anton text-[11px] tracking-widest text-ea-black/50 uppercase">
                    POSTULACIÓN 03
                  </span>
                  <span className="font-mono text-[10.5px] text-ea-black/70 bg-ea-black/5 px-2 py-0.5 rounded-sm">
                    INVESTIGACIÓN & ACADEMIA
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-ea-black bg-white flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-ea-black" />
                  </div>
                  <div>
                    <h3 className="font-okcok text-xl sm:text-2xl uppercase leading-none text-ea-black">
                      QUE INVESTIGACIONES PUBLICAMOS?
                    </h3>
                    <span className="font-creato text-[11px] sm:text-xs text-ea-black/60">
                      Tesis de grado, posgrado y proyectos científicos del territorio
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-ea-black/85 font-okcok uppercase leading-relaxed mb-4">
                  Espacio consagrado a investigaciones de facultades ecuatorianas y extranjeras que aborden problemáticas habitacionales, riesgo sísmico, arquitectura vernácula y biomateriales locales.
                </p>

                <div className="space-y-2 border-t border-ea-black/15 pt-3">
                  <span className="font-anton text-[10.5px] tracking-wider uppercase text-ea-black/60 block">
                    REQUISITOS DE POSTULACIÓN:
                  </span>
                  <div className="flex items-start gap-2 text-xs text-ea-black/80 font-creato">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ea-black mt-0.5 shrink-0" />
                    <span>Tesis aprobada con rigor metodológico y bibliografía verificable.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-ea-black/80 font-creato">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ea-black mt-0.5 shrink-0" />
                    <span>Estudio de hábitat vernáculo, tecnología local o riesgo sísmico.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-ea-black/80 font-creato">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ea-black mt-0.5 shrink-0" />
                    <span>Resumen ejecutivo y láminas de síntesis técnica.</span>
                  </div>
                </div>
              </div>

              {/* Botón hand-drawn de Figma */}
              <div className="pt-3 border-t border-ea-black/20 flex flex-col items-center justify-center">
                <div
                  className="relative inline-block cursor-pointer group"
                  onClick={handleOpenSubmission}
                >
                  <img
                    src={acercaBtnVectorUrl}
                    alt=""
                    className="w-44 sm:w-48 h-auto object-contain pointer-events-none"
                  />
                  <button
                    type="button"
                    className="absolute inset-0 w-full h-full flex items-center justify-center font-anton text-xs sm:text-[13px] tracking-wider uppercase text-ea-black group-hover:scale-105 transition-transform cursor-pointer"
                    data-cursor
                  >
                    ENVIA TU TESIS
                  </button>
                </div>
              </div>
            </article>

            {/* ----------------------------------------------------------------- */}
            {/* CARTA 2 (EN EL MEDIO INICIALMENTE, z-index 20)                    */}
            {/* ----------------------------------------------------------------- */}
            <article
              ref={card1Ref}
              className="absolute inset-0 w-full h-full bg-[#FAF9F6] border-2 border-ea-black rounded-[20px] sm:rounded-[26px] shadow-[5px_5px_0px_#000000] sm:shadow-[8px_8px_0px_#000000] p-5 sm:p-7 md:p-8 flex flex-col justify-between will-change-transform"
            >
              {/* Folder tab at top center */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 bg-[#FAF9F6] border-t-2 border-x-2 border-ea-black rounded-t-md font-anton text-[10px] sm:text-[11px] tracking-widest uppercase text-ea-black/80 flex items-center gap-1.5 shadow-2xs">
                <span>02</span>
                <span>/</span>
                <span>ARTÍCULOS</span>
              </div>

              <TapeStrip className="-top-3 right-8 rotate-6" />

              <div>
                <div className="flex items-center justify-between border-b border-ea-black/20 pb-2.5 mb-4">
                  <span className="font-anton text-[11px] tracking-widest text-ea-black/50 uppercase">
                    POSTULACIÓN 02
                  </span>
                  <span className="font-mono text-[10.5px] text-ea-black/70 bg-ea-black/5 px-2 py-0.5 rounded-sm">
                    CRÍTICA & OPINIÓN
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-ea-black bg-white flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5 text-ea-black" />
                  </div>
                  <div>
                    <h3 className="font-okcok text-xl sm:text-2xl uppercase leading-none text-ea-black">
                      QUE ARTICULOS PUBLICAMOS?
                    </h3>
                    <span className="font-creato text-[11px] sm:text-xs text-ea-black/60">
                      Ensayos críticos, columnas de debate y postura editorial
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-ea-black/85 font-okcok uppercase leading-relaxed mb-4">
                  Recibimos artículos de opinión y reflexiones profundas en torno al territorio, el urbanismo y la arquitectura ecuatoriana, fomentando un pensamiento libre y desprovisto de condescendencia gremial.
                </p>

                <div className="space-y-2 border-t border-ea-black/15 pt-3">
                  <span className="font-anton text-[10.5px] tracking-wider uppercase text-ea-black/60 block">
                    REQUISITOS DE POSTULACIÓN:
                  </span>
                  <div className="flex items-start gap-2 text-xs text-ea-black/80 font-creato">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ea-black mt-0.5 shrink-0" />
                    <span>Texto crítico argumentado de 800 a 1,500 palabras.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-ea-black/80 font-creato">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ea-black mt-0.5 shrink-0" />
                    <span>Bibliografía verificable y fuentes documentadas del contexto local.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-ea-black/80 font-creato">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ea-black mt-0.5 shrink-0" />
                    <span>Fotografía documental o ensayo visual de respaldo si aplica.</span>
                  </div>
                </div>
              </div>

              {/* Botón hand-drawn de Figma */}
              <div className="pt-3 border-t border-ea-black/20 flex flex-col items-center justify-center">
                <div
                  className="relative inline-block cursor-pointer group"
                  onClick={handleOpenSubmission}
                >
                  <img
                    src={acercaBtnVectorUrl}
                    alt=""
                    className="w-44 sm:w-48 h-auto object-contain pointer-events-none"
                  />
                  <button
                    type="button"
                    className="absolute inset-0 w-full h-full flex items-center justify-center font-anton text-xs sm:text-[13px] tracking-wider uppercase text-ea-black group-hover:scale-105 transition-transform cursor-pointer"
                    data-cursor
                  >
                    ENVIA TU ARTÍCULO
                  </button>
                </div>
              </div>
            </article>

            {/* ----------------------------------------------------------------- */}
            {/* CARTA 1 (AL FRENTE INICIALMENTE, z-index 30)                      */}
            {/* ----------------------------------------------------------------- */}
            <article
              ref={card0Ref}
              className="absolute inset-0 w-full h-full bg-white border-2 border-ea-black rounded-[20px] sm:rounded-[26px] shadow-[6px_6px_0px_#000000] sm:shadow-[10px_10px_0px_#000000] p-5 sm:p-7 md:p-8 flex flex-col justify-between will-change-transform"
            >
              {/* Folder tab at top left */}
              <div className="absolute -top-7 left-6 px-3 sm:px-4 py-1 bg-white border-t-2 border-x-2 border-ea-black rounded-t-md font-anton text-[10px] sm:text-[11px] tracking-widest uppercase text-ea-black flex items-center gap-1.5 shadow-2xs">
                <span>01</span>
                <span>/</span>
                <span>OBRAS CONSTRUIDAS</span>
              </div>

              <TapeStrip className="-top-3 right-8 -rotate-3" />

              <div>
                <div className="flex items-center justify-between border-b border-ea-black/20 pb-2.5 mb-4">
                  <span className="font-anton text-[11px] tracking-widest text-ea-black/50 uppercase">
                    POSTULACIÓN 01
                  </span>
                  <span className="font-mono text-[10.5px] text-ea-black/70 bg-ea-black/5 px-2 py-0.5 rounded-sm">
                    OBRA CONSTRUIDA
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3.5">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-ea-black bg-white flex items-center justify-center shrink-0">
                    <Building className="w-5 h-5 text-ea-black" />
                  </div>
                  <div>
                    <h3 className="font-okcok text-xl sm:text-2xl uppercase leading-none text-ea-black">
                      QUE PROYECTOS PUBLICAMOS?
                    </h3>
                    <span className="font-creato text-[11px] sm:text-xs text-ea-black/60">
                      Obras terminadas con rigor técnico, constructivo y social
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-ea-black/85 font-okcok uppercase leading-relaxed mb-4">
                  Casas, equipamientos colectivos, edificios y rehabilitaciones patrimoniales que destaquen por su respuesta al contexto, economía de medios y responsabilidad ética con el territorio ecuatoriano.
                </p>

                <div className="space-y-2 border-t border-ea-black/15 pt-3">
                  <span className="font-anton text-[10.5px] tracking-wider uppercase text-ea-black/60 block">
                    REQUISITOS DE POSTULACIÓN:
                  </span>
                  <div className="flex items-start gap-2 text-xs text-ea-black/80 font-creato">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ea-black mt-0.5 shrink-0" />
                    <span>Planimetría técnica completa a escala con norte gráfico y cotas legibles.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-ea-black/80 font-creato">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ea-black mt-0.5 shrink-0" />
                    <span>Corte bioclimático o axonométrica constructiva del detalle tectónico.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-ea-black/80 font-creato">
                    <CheckCircle2 className="w-3.5 h-3.5 text-ea-black mt-0.5 shrink-0" />
                    <span>Fotografías de autor en alta resolución sin filtros distorsionantes.</span>
                  </div>
                </div>
              </div>

              {/* Botón hand-drawn de Figma idéntico a #131:1895 */}
              <div className="pt-3 border-t border-ea-black/20 flex flex-col items-center justify-center">
                <div
                  className="relative inline-block cursor-pointer group"
                  onClick={handleOpenSubmission}
                >
                  <img
                    src={acercaBtnVectorUrl}
                    alt=""
                    className="w-48 sm:w-52 h-auto object-contain pointer-events-none"
                  />
                  <button
                    type="button"
                    className="absolute inset-0 w-full h-full flex items-center justify-center font-anton text-xs sm:text-[13.5px] tracking-wider uppercase text-ea-black group-hover:scale-105 transition-transform cursor-pointer"
                    data-cursor
                  >
                    ENVIA TU PROYECTO
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECCIÓN: "COMO NOS FINANCIAMOS?" (EXACTO A LA CAPTURA DE FIGMA)        */}
      {/* Dos notas post-it rasgadas con cinta negra arriba una al lado de la otra: */}
      {/* Izquierda: "PUBLICIDAD" + botón "PAUTA CON NOSOTROS"                      */}
      {/* Derecha:   "DONACIONES" + botón "DONA AQUÍ"                              */}
      {/* ========================================================================= */}
      <section
        ref={financingSectionRef}
        className="w-full bg-white py-14 sm:py-20 border-t border-ea-black/10 select-none"
      >
        {/* Título de sección idéntico a Figma */}
        <h2 className="font-okcok text-3xl sm:text-4xl md:text-5xl text-ea-black uppercase text-center mb-12 sm:mb-16 tracking-tight">
          COMO NOS FINANCIAMOS?
        </h2>

        {/* Las dos notas rasgadas lado a lado idénticas a Figma */}
        <div className="w-full max-w-[680px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-10">
          {/* ------------------------------------------------------------------- */}
          {/* NOTA 1: PUBLICIDAD                                                  */}
          {/* ------------------------------------------------------------------- */}
          <div
            ref={postitPublicidadRef}
            className="relative w-[230px] sm:w-[250px] aspect-[280/340] will-change-transform flex items-center justify-center"
          >
            {/* SVG del contorno rasgado con cinta negra */}
            <img
              src={acercaPostitTornUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            />

            {/* Contenido interior idéntico a Figma */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 pt-4 pb-6 text-center">
              <h3 className="font-okcok text-2xl sm:text-3xl uppercase text-ea-black mb-6 tracking-wide">
                PUBLICIDAD
              </h3>

              {/* Botón "PAUTA CON NOSOTROS" con trazo vectorial a mano */}
              <div
                className="relative inline-block cursor-pointer group"
                onClick={handleOpenPublicidad}
              >
                <img
                  src={acercaBtnVectorUrl}
                  alt=""
                  className="w-40 sm:w-44 h-auto object-contain pointer-events-none"
                />
                <button
                  type="button"
                  className="absolute inset-0 w-full h-full flex items-center justify-center font-anton text-[11px] sm:text-xs tracking-wider uppercase text-ea-black group-hover:scale-105 transition-transform cursor-pointer"
                  data-cursor
                >
                  PAUTA CON NOSOTROS
                </button>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* NOTA 2: DONACIONES                                                  */}
          {/* ------------------------------------------------------------------- */}
          <div
            ref={postitDonacionesRef}
            className="relative w-[230px] sm:w-[250px] aspect-[280/340] will-change-transform flex items-center justify-center"
          >
            {/* SVG del contorno rasgado con cinta negra */}
            <img
              src={acercaPostitTornUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            />

            {/* Contenido interior idéntico a Figma */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 pt-4 pb-6 text-center">
              <h3 className="font-okcok text-2xl sm:text-3xl uppercase text-ea-black mb-6 tracking-wide">
                DONACIONES
              </h3>

              {/* Botón "DONA AQUÍ" con trazo vectorial a mano */}
              <div
                className="relative inline-block cursor-pointer group"
                onClick={() => setDonationDrawerOpen(true)}
              >
                <img
                  src={acercaBtnVectorUrl}
                  alt=""
                  className="w-40 sm:w-44 h-auto object-contain pointer-events-none"
                />
                <button
                  type="button"
                  className="absolute inset-0 w-full h-full flex items-center justify-center font-anton text-xs sm:text-sm tracking-wider uppercase text-ea-black group-hover:scale-105 transition-transform cursor-pointer"
                  data-cursor
                >
                  DONA AQUÍ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Donación Minimalista si el usuario hace clic en "DONA AQUÍ" */}
        {donationDrawerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="relative w-full max-w-[420px] bg-white border-2 border-ea-black shadow-[8px_8px_0px_#000000] p-6 sm:p-8 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b-2 border-ea-black pb-3 mb-4">
                <span className="font-okcok text-xl uppercase text-ea-black">
                  DONACIONES EDITORIALES
                </span>
                <button
                  onClick={() => {
                    setDonationDrawerOpen(false);
                    setDonationSuccess(false);
                  }}
                  className="font-anton text-xs uppercase px-2 py-1 border border-ea-black hover:bg-ea-black hover:text-white transition-colors cursor-pointer"
                >
                  CERRAR
                </button>
              </div>

              <p className="font-creato text-xs text-ea-black/80 leading-relaxed mb-4">
                Tu aporte nos permite mantener independiente este archivo arquitectónico y remunerar dignamente a redactores e investigadores.
              </p>

              {/* Tiers */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[5, 15, 50].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => {
                      setSelectedDonationTier(tier);
                      setDonationSuccess(false);
                    }}
                    className={`py-2 px-1 border-2 font-anton text-sm uppercase transition-all cursor-pointer ${
                      selectedDonationTier === tier
                        ? 'border-ea-black bg-ea-black text-white'
                        : 'border-ea-black bg-white text-ea-black hover:bg-neutral-100'
                    }`}
                  >
                    ${tier} USD
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedDonationTier('custom')}
                  className={`px-3 py-1.5 border text-xs font-anton uppercase cursor-pointer ${
                    selectedDonationTier === 'custom'
                      ? 'border-ea-black bg-ea-black text-white'
                      : 'border-ea-black/40 text-ea-black'
                  }`}
                >
                  OTRO MONTO
                </button>
                {selectedDonationTier === 'custom' && (
                  <div className="flex-1 flex items-center border border-ea-black px-2 py-1">
                    <span className="font-mono text-xs text-ea-black/60 mr-1">$</span>
                    <input
                      type="number"
                      min="1"
                      value={customDonationAmount}
                      onChange={(e) => setCustomDonationAmount(e.target.value)}
                      className="w-full text-xs font-mono text-ea-black outline-none bg-transparent"
                    />
                    <span className="font-mono text-[10px] text-ea-black/40">USD</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setDonationSuccess(true)}
                className="w-full py-2.5 border-2 border-ea-black bg-ea-black text-white font-anton text-xs tracking-wider uppercase hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                APORTAR $
                {selectedDonationTier === 'custom'
                  ? customDonationAmount || '0'
                  : selectedDonationTier}{' '}
                USD
              </button>

              {donationSuccess && (
                <div className="mt-3 p-2 bg-neutral-100 border border-ea-black text-center font-creato text-xs text-ea-black">
                  ¡Muchas gracias por respaldar la arquitectura libre en Ecuador!
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Modal para Envío de Proyectos y Publicidad */}
      <FooterModal
        isOpen={modalOpen}
        initialTab={modalTab}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default AcercaDeEA;
