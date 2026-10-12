import { inject, Service, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/** Lenis smooth scrolling + GSAP ScrollTrigger, off when the user prefers reduced motion. */
@Service()
export class Motion {
  private lenis?: Lenis;
  /** Animations run. Stays false under reduced motion and in unit tests, which never call start(). */
  readonly enabled = signal(false);

  constructor() {
    inject(Router).events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) return;
      if (!this.lenis) {
        window.scrollTo(0, 0);
        return;
      }
      this.lenis.scrollTo(0, { immediate: true });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });
  }

  /** Scrolls an element to the top of the view: smoothly through Lenis, or at once under reduced motion. */
  scrollTo(target: HTMLElement): void {
    if (this.lenis) this.lenis.scrollTo(target, { offset: -24 });
    else target.scrollIntoView();
  }

  /** Called once at startup from an app initializer. */
  start(): void {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    this.enabled.set(true);
    this.lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    this.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => this.lenis?.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    // Late font loads and route changes resize the page without a scroll, which would leave reveal
    // triggers at stale positions (and their elements invisible). Recalculate when the body resizes.
    let frame = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    }).observe(document.body);
  }
}
