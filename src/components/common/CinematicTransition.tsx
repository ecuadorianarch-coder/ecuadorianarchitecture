import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface CinematicTransitionProps {
  isActive: boolean;
  projectTitle?: string;
  onTransitionMiddle?: () => void;
  onTransitionEnd?: () => void;
}

export const CinematicTransition: React.FC<CinematicTransitionProps> = ({
  isActive,
  projectTitle,
  onTransitionMiddle,
  onTransitionEnd,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const apertureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !overlayRef.current) return;

    const overlay = overlayRef.current;
    const text = textRef.current;
    const aperture = apertureRef.current;

    const tl = gsap.timeline({
      onComplete: () => {
        if (onTransitionEnd) onTransitionEnd();
      },
    });

    // 1. Reset and make visible
    gsap.set(overlay, { autoAlpha: 1, pointerEvents: 'auto' });
    gsap.set(aperture, { scaleY: 0, transformOrigin: 'center center' });
    gsap.set(text, { opacity: 0, y: 20 });

    // 2. Black architectural aperture closes smoothly over screen
    tl.to(aperture, {
      scaleY: 1,
      duration: 0.38,
      ease: 'power3.inOut',
    });

    // 3. Show title and trigger page swap in the middle
    tl.to(text, {
      opacity: 1,
      y: 0,
      duration: 0.25,
      ease: 'power2.out',
      onComplete: () => {
        if (onTransitionMiddle) onTransitionMiddle();
      },
    });

    // 4. Brief architectural pause
    tl.to({}, { duration: 0.2 });

    // 5. Fade out text and open aperture upwards like an architectural curtain
    tl.to(text, {
      opacity: 0,
      y: -15,
      duration: 0.2,
      ease: 'power2.in',
    });

    tl.to(aperture, {
      yPercent: -100,
      duration: 0.45,
      ease: 'power3.inOut',
    });

    tl.set(overlay, { autoAlpha: 0, pointerEvents: 'none', yPercent: 0 });

    return () => {
      tl.kill();
    };
  }, [isActive]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] pointer-events-none opacity-0 select-none overflow-hidden"
      style={{ visibility: 'hidden' }}
    >
      {/* Black full-screen architectural aperture */}
      <div
        ref={apertureRef}
        className="absolute inset-0 w-full h-full bg-ea-black flex flex-col items-center justify-center px-6"
      >
        <div ref={textRef} className="text-center text-white">
          <span className="font-anton text-xs md:text-sm tracking-[0.3em] uppercase text-white/50 block mb-2">
            ENTRANDO A LA OBRA
          </span>
          <h2 className="font-okcok text-3xl sm:text-5xl md:text-6xl uppercase tracking-wider text-white">
            {projectTitle || 'ECUADORIAN ARCHITECTURE'}
          </h2>
          <div className="w-12 h-[1.5px] bg-white/40 mx-auto mt-4" />
        </div>
      </div>
    </div>
  );
};

export default CinematicTransition;
