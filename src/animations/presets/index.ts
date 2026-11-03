import gsap from 'gsap';

export interface MotionConfig {
  preset?: 'fadeUp' | 'dropLetters' | 'characterReveal' | 'wordReveal' | 'clipReveal' | 'none';
  speed?: number; // 0.5 to 2.5
  stagger?: number; // 0.01 to 0.2
  delay?: number;
  easing?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  scrub?: boolean | number;
}

export const executeMotionPreset = (
  elements: Element[] | Element | null,
  config: MotionConfig = {}
) => {
  if (!elements) return;
  const {
    preset = 'fadeUp',
    speed = 1.0,
    stagger = 0.08,
    delay = 0,
    easing = 'power3.out',
    direction = 'up',
  } = config;

  if (preset === 'none') {
    gsap.set(elements, { opacity: 1, y: 0, x: 0 });
    return;
  }

  const duration = (preset === 'dropLetters' ? 0.9 : 0.7) / speed;
  const yOffset = direction === 'down' ? -40 : direction === 'up' ? 40 : 0;
  const xOffset = direction === 'left' ? 40 : direction === 'right' ? -40 : 0;

  switch (preset) {
    case 'dropLetters':
      gsap.fromTo(
        elements,
        { y: -60, opacity: 0, rotationZ: 3 },
        {
          y: 0,
          opacity: 1,
          rotationZ: 0,
          duration,
          stagger,
          delay,
          ease: 'back.out(1.4)',
        }
      );
      break;

    case 'characterReveal':
    case 'wordReveal':
      gsap.fromTo(
        elements,
        { y: yOffset, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          stagger: stagger * 0.5,
          delay,
          ease: easing,
        }
      );
      break;

    case 'clipReveal':
      gsap.fromTo(
        elements,
        { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          duration: duration * 1.2,
          delay,
          ease: 'power4.inOut',
        }
      );
      break;

    case 'fadeUp':
    default:
      gsap.fromTo(
        elements,
        { y: yOffset, x: xOffset, opacity: 0 },
        {
          y: 0,
          x: 0,
          opacity: 1,
          duration,
          stagger,
          delay,
          ease: easing,
        }
      );
      break;
  }
};
