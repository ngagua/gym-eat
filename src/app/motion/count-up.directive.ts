import { afterRenderEffect, Directive, ElementRef, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { Motion } from './motion.service';

/**
 * Counts the element's number up from zero: `<span [appCountUp]="n">{{ n }}</span>`.
 * The interpolation stays for reduced motion; the tween only rewrites that text node.
 */
@Directive({ selector: '[appCountUp]' })
export class CountUp {
  readonly appCountUp = input.required<number>();

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const motion = inject(Motion);

    // Runs after Angular writes the final number and before the browser paints, so it never flashes.
    afterRenderEffect((onCleanup) => {
      const target = this.appCountUp();
      const node = el.firstChild;
      if (!motion.enabled() || !(node instanceof Text)) return;
      const counter = { value: 0 };
      node.data = '0';
      const tween = gsap.to(counter, {
        value: target,
        duration: 1.1,
        ease: 'expo.out',
        onUpdate: () => (node.data = String(Math.round(counter.value))),
      });
      onCleanup(() => tween.kill());
    });
  }
}
