import { createTimeline } from 'animejs';
import { useEffect } from 'react';

export const useTitleAnimation = () => {
  useEffect(() => {
    const tl = createTimeline({
      defaults: {
        ease: 'easeOutExpo',
        duration: 1000,
      },
    });

    tl.add('#title-mhfd', {
      opacity: { from: 0 },
      translateY: { from: 20 },
    }, 0)
    .add('#title-divider', {
      opacity: { from: 0 },
      width: { from: '0%' },
    }, 500)
    .add('#title-main', {
      opacity: { from: 0 },
      translateY: { from: 20 },
    }, 1000)
    .add('#instructions', {
      opacity: { from: 0 },
      translateY: { from: 20 },
    }, 1500)
    .add('#start-button', {
      opacity: { from: 0 },
      translateY: { from: 10 },
    }, 2000);
  }, []);
};
