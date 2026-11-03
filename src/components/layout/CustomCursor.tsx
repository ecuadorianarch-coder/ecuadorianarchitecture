import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    const setCursorX = gsap.quickSetter(cursor, 'x', 'px');
    const setCursorY = gsap.quickSetter(cursor, 'y', 'px');
    const setFollowerX = gsap.quickSetter(follower, 'x', 'px');
    const setFollowerY = gsap.quickSetter(follower, 'y', 'px');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setCursorX(mouseX);
      setCursorY(mouseY);
    };

    window.addEventListener('mousemove', onMouseMove);

    const ticker = () => {
      // Smooth interpolation for the trailing follower
      followerX += (mouseX - followerX) * 0.18;
      followerY += (mouseY - followerY) * 0.18;
      setFollowerX(followerX);
      setFollowerY(followerY);
    };

    gsap.ticker.add(ticker);

    // Interactive target expansion on hoverable elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a, button, input, [data-cursor]');
      if (target) {
        gsap.to(follower, {
          scale: 2.2,
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          borderColor: 'rgba(0, 0, 0, 0.4)',
          duration: 0.3,
        });
        gsap.to(cursor, { scale: 0.5, duration: 0.2 });
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a, button, input, [data-cursor]');
      if (target) {
        gsap.to(follower, {
          scale: 1,
          backgroundColor: 'transparent',
          borderColor: 'rgba(0, 0, 0, 0.25)',
          duration: 0.3,
        });
        gsap.to(cursor, { scale: 1, duration: 0.2 });
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      gsap.ticker.remove(ticker);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-ea-black rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 hidden md:block"
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-ea-black/30 rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 transition-transform hidden md:block"
      />
    </>
  );
};
