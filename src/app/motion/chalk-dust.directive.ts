import {
  afterNextRender,
  afterRenderEffect,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { gsap } from 'gsap';
import { Plate } from '../plan/plan.model';
import { Motion } from './motion.service';

/**
 * Chalk dust drifting behind the page in a plate's color: `<canvas [appChalkDust]="plate"></canvas>`.
 * Near motes are bigger and softer and slide further when the page scrolls, which gives the dust depth.
 * Draws nothing under reduced motion, and holds still while the user has paused it (see Motion).
 */
@Directive({
  selector: 'canvas[appChalkDust]',
  host: {
    class:
      'pointer-events-none fixed inset-0 -z-10 size-full text-[color:var(--dust,var(--plate))]',
    'aria-hidden': 'true',
    '[attr.data-plate]': 'appChalkDust()',
  },
})
export class ChalkDust {
  readonly appChalkDust = input.required<Plate>();

  constructor() {
    const canvas = inject<ElementRef<HTMLCanvasElement>>(ElementRef).nativeElement;
    const motion = inject(Motion);
    const destroyRef = inject(DestroyRef);
    const sprite = document.createElement('canvas');
    // Set when the canvas needs a frame even while paused: first paint, resize, new color.
    let stale = true;

    // One soft dot, stamped once per mote. Its color is the canvas's CSS color, so it follows the
    // plate and light or dark mode.
    const paintSprite = () => {
      const g = sprite.getContext('2d');
      if (!g) return;
      sprite.width = sprite.height = 64;
      const glow = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      glow.addColorStop(0, 'rgba(0, 0, 0, 1)');
      glow.addColorStop(0.25, 'rgba(0, 0, 0, 0.7)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      g.fillStyle = glow;
      g.fillRect(0, 0, 64, 64);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = getComputedStyle(canvas).color;
      g.fillRect(0, 0, 64, 64);
      stale = true;
    };

    afterRenderEffect(() => {
      this.appChalkDust();
      if (motion.enabled()) paintSprite();
    });

    afterNextRender(() => {
      const ctx = motion.enabled() ? canvas.getContext('2d') : null;
      if (!ctx) return;
      const dpr = Math.min(devicePixelRatio, 2);
      let width = 0;
      let height = 0;
      let lastScroll = scrollY;

      const mote = () => {
        // Mostly far, small, crisp specks; a few near, big, faint ones.
        const depth = Math.random() ** 1.6;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1 + 26 * depth ** 3,
          alpha: 0.9 - 0.7 * depth,
          parallax: 0.1 + 0.6 * depth,
          vx: (Math.random() - 0.5) * 8,
          vy: -(3 + 12 * depth),
          sway: 2 + 10 * depth,
          phase: Math.random() * Math.PI * 2,
        };
      };
      let motes: ReturnType<typeof mote>[] = [];
      // Off one edge, back in at the opposite one.
      const wrap = (value: number, r: number, size: number) => {
        const span = size + 2 * r;
        return ((((value + r) % span) + span) % span) - r;
      };

      const resize = new ResizeObserver(([entry]) => {
        ({ width, height } = entry.contentRect);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.scale(dpr, dpr);
        if (!motes.length) {
          motes = Array.from({ length: Math.min(140, Math.round((width * height) / 9000)) }, mote);
        }
        stale = true;
      });
      resize.observe(canvas);

      const tick = (time: number, deltaTime: number) => {
        const scrolled = scrollY - lastScroll;
        lastScroll = scrollY;
        const paused = motion.backgroundPaused();
        if (paused && !stale) return;
        stale = false;
        const dt = Math.min(deltaTime / 1000, 0.05);
        // Calmer once the top of the page has scrolled away, so the meal list reads easily.
        const calm = 1 - Math.min(scrollY / height, 1) * 0.5;
        ctx.clearRect(0, 0, width, height);
        for (const m of motes) {
          if (!paused) {
            m.x = wrap(m.x + (m.vx + Math.sin(time * 0.6 + m.phase) * m.sway) * dt, m.r, width);
            m.y = wrap(m.y + m.vy * dt - scrolled * m.parallax, m.r, height);
          }
          ctx.globalAlpha = m.alpha * calm;
          ctx.drawImage(sprite, m.x - m.r, m.y - m.r, m.r * 2, m.r * 2);
        }
      };
      gsap.ticker.add(tick);

      const scheme = matchMedia('(prefers-color-scheme: dark)');
      scheme.addEventListener('change', paintSprite);
      destroyRef.onDestroy(() => {
        gsap.ticker.remove(tick);
        resize.disconnect();
        scheme.removeEventListener('change', paintSprite);
      });
    });
  }
}
