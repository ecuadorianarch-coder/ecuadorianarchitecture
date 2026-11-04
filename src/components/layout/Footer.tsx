import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import logoExtendidoUrl from '../../assets/logos/logo_extendido.svg';
import mediaPartnersUrl from '../../assets/logos/media_partners.svg';
import { FooterModal, FooterModalTab } from '../footer/FooterModal';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const Footer: React.FC = () => {
  const footerRef = useRef<HTMLElement>(null);
  const [modalTab, setModalTab] = useState<FooterModalTab>('feedback');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (tab: FooterModalTab) => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      gsap.fromTo(
        '.footer-logo',
        { y: 35, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            end: 'bottom 92%',
            scrub: 0.5,
          },
        }
      );

      gsap.fromTo(
        '.footer-cities',
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 82%',
            end: 'bottom 95%',
            scrub: 0.5,
          },
        }
      );
    },
    { scope: footerRef }
  );

  return (
    <>
      <footer
        ref={footerRef}
        className="w-full bg-white border-t border-ea-black flex flex-col items-center justify-center select-none overflow-hidden"
      >
        {/* ========================================================================= */}
        {/* 1. LOGO MONUMENTAL EDITORIAL Y CIUDADES                                    */}
        {/* ========================================================================= */}
        <div className="w-full max-w-[1440px] flex flex-col items-center justify-center gap-5 pt-12 sm:pt-16 pb-8 px-6">
          {/* Figma Exact: LOGO_EXTENDIDO box: 594x146 px inside Rectangle 11 */}
          <div className="footer-logo w-full max-w-[560px] h-[110px] sm:h-[135px] flex items-center justify-center">
            <img
              src={logoExtendidoUrl}
              alt="ECUADORIAN ARCHITECTURE"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="footer-cities flex items-center gap-4 sm:gap-6 text-xs font-anton tracking-widest text-ea-black/45 uppercase">
            <span>QUITO</span>
            <span>•</span>
            <span>GUAYAQUIL</span>
            <span>•</span>
            <span>CUENCA</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. FRANJA INSTITUCIONAL: MEDIA PARTNERS (ESTILO REFERENCIA ARCHDAILY)      */}
        {/* Centrada, con opacidad delicada y texto en fuente OKCOK                    */}
        {/* ========================================================================= */}
        <div className="w-full border-t border-ea-black/10 bg-[#FAFAFA]/80 py-6 sm:py-8 px-4 sm:px-8">
          <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center justify-center gap-3">
            {/* Texto en fuente OKCOK en negro con opacidad */}
            <span className="font-okcok text-xs sm:text-sm tracking-[0.22em] text-ea-black uppercase opacity-75 hover:opacity-100 transition-opacity">
              MEDIA PARTNERS
            </span>

            {/* SVG Institucional de Media Partners (CAE-P & BAQ) */}
            <div className="py-1">
              <img
                src={mediaPartnersUrl}
                alt="Media Partners: CAE-P (Colegio de Arquitectos del Ecuador) y BAQ (Bienal Panamericana de Arquitectura de Quito)"
                className="h-8 sm:h-9 md:h-10 w-auto object-contain opacity-65 hover:opacity-100 transition-opacity duration-300 filter grayscale hover:grayscale-0"
                title="CAE-P (Colegio de Arquitectos del Ecuador Pichincha) & BAQ (Bienal Panamericana de Arquitectura de Quito)"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. LÍNEA DE ENLACES DE TEXTO (SIN TARJETAS, CON COLOR EN HOVER)           */}
        {/* Textos que cuando el usuario pasa el clic por encima se ponen de color     */}
        {/* ========================================================================= */}
        <div className="w-full border-t border-ea-black/10 py-5 sm:py-6 px-6 sm:px-10 bg-white">
          <div className="w-full max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left select-text">
            {/* Enlaces de texto puro con hover dinámico a color y touch target >= 44px */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 sm:gap-x-8 gap-y-1 font-inter text-xs sm:text-[13px] text-ea-black/60">
              <button
                type="button"
                onClick={() => handleOpenModal('feedback')}
                className="hover:text-blue-600 transition-colors duration-200 cursor-pointer font-medium hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ea-black/70 focus-visible:outline-hidden min-h-[44px] py-2 px-1.5 inline-flex items-center active:scale-95"
                title="Abrir buzón de feedback y sugerencias"
                data-cursor
              >
                Danos tu feedback
              </button>

              <button
                type="button"
                onClick={() => handleOpenModal('publicidad')}
                className="hover:text-blue-600 transition-colors duration-200 cursor-pointer font-medium hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ea-black/70 focus-visible:outline-hidden min-h-[44px] py-2 px-1.5 inline-flex items-center active:scale-95"
                title="Espacios publicitarios y alianzas editoriales"
                data-cursor
              >
                Publicita con nosotros
              </button>

              <button
                type="button"
                onClick={() => handleOpenModal('proyectos')}
                className="hover:text-blue-600 transition-colors duration-200 cursor-pointer font-medium hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ea-black/70 focus-visible:outline-hidden min-h-[44px] py-2 px-1.5 inline-flex items-center active:scale-95"
                title="Postulación de obras construidas, investigaciones o tesis"
                data-cursor
              >
                Envía tus proyectos
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#acerca-de-ea';
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }}
                className="hover:text-blue-600 transition-colors duration-200 cursor-pointer font-medium hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ea-black/70 focus-visible:outline-hidden min-h-[44px] py-2 px-1.5 inline-flex items-center active:scale-95"
                title="Leer el Manifiesto Editorial y Acerca de EA"
                data-cursor
              >
                Acerca de EA
              </button>

              <a
                href="#destacados"
                onClick={(e) => {
                  if (window.location.hash === '#destacados' || window.location.hash === '' || window.location.hash === '#home') {
                    const el = document.getElementById('destacados');
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="hover:text-blue-600 transition-colors duration-200 cursor-pointer font-medium hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ea-black/70 focus-visible:outline-hidden min-h-[44px] py-2 px-1.5 inline-flex items-center active:scale-95"
                title="Ver el mazo físico de obras destacadas"
                data-cursor
              >
                Archivo Editorial
              </a>
            </div>

            {/* Iconos de Redes Sociales con 44x44px touch targets */}
            <div className="flex items-center gap-1 sm:gap-2 text-ea-black/45">
              <a
                href="https://www.instagram.com/ecuadorianarchitecture/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram oficial de Ecuadorian Architecture (@ecuadorianarchitecture)"
                className="w-11 h-11 flex items-center justify-center hover:text-blue-600 transition-all cursor-pointer active:scale-90"
                title="Instagram: @ecuadorianarchitecture"
                data-cursor
              >
                <Instagram className="w-4.5 h-4.5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=100071072018091"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook oficial de Ecuadorian Architecture"
                className="w-11 h-11 flex items-center justify-center hover:text-blue-600 transition-all cursor-pointer active:scale-90"
                title="Facebook: Ecuadorian Architecture"
                data-cursor
              >
                <Facebook className="w-4.5 h-4.5" />
              </a>
              <a
                href="https://www.youtube.com/@ecuadorianarch437"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube oficial de Ecuadorian Architecture (@ecuadorianarch437)"
                className="w-11 h-11 flex items-center justify-center hover:text-blue-600 transition-all cursor-pointer active:scale-90"
                title="YouTube: @ecuadorianarch437"
                data-cursor
              >
                <Youtube className="w-4.5 h-4.5" />
              </a>
              <a
                href="https://www.linkedin.com/company/ecuadorian-architecture"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn oficial de Ecuadorian Architecture"
                className="w-11 h-11 flex items-center justify-center hover:text-blue-600 transition-all cursor-pointer active:scale-90"
                title="LinkedIn: Ecuadorian Architecture"
                data-cursor
              >
                <Linkedin className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Pequeña línea de copyright final */}
          <div className="w-full max-w-[1280px] mx-auto mt-4 pt-3 border-t border-ea-black/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-inter text-ea-black/40 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Ecuadorian Architecture. Todos los derechos reservados.</span>
            <span className="mt-1 sm:mt-0">Un espacio de crítica y archivo de arquitectura ecuatoriana.</span>
          </div>
        </div>
      </footer>

      {/* Modal interactivo de Feedback / Publicidad / Envío de proyectos */}
      <FooterModal
        isOpen={isModalOpen}
        initialTab={modalTab}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default Footer;
