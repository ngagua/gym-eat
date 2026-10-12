import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { Motion } from './motion.service';

/** Fades and lifts an element in when it scrolls into view. Pass an index to stagger siblings: `[appReveal]="$index"`. */
@Directive({ selector: '[appReveal]' })
export class Reveal {
  readonly appReveal = input<number | ''>(0);

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(Motion);
    let tween: gsap.core.Tween | undefined;

    afterNextRender(() => {
      if (!motion.enabled()) return;
      tween = gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'expo.out',
          delay: ((Number(this.appReveal()) || 0) % 4) * 0.07,
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        },
      );
    });
    inject(DestroyRef).onDestroy(() => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
    });
  }
}
