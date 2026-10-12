import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Backdrop } from '../motion/backdrop.component';
import { Reveal } from '../motion/reveal.directive';
import { total, weekdayOf } from './plan.model';
import { Plan } from './plan.service';
import { Plate } from './plate.component';

@Component({
  imports: [Backdrop, Plate, Reveal, RouterLink, TitleCasePipe],
  template: `
    <app-backdrop [plates]="['yellow', 'blue', 'red', 'green']" />
    <h1 class="pt-2 font-display text-[5.75rem] leading-[0.85] font-black uppercase sm:text-8xl">
      Week
    </h1>
    <p class="mt-2.5 text-muted">{{ gymDays() }} gym days · {{ restDays() }} recovery days</p>
    <ol class="mt-5 grid gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
      @for (d of days(); track d.day; let i = $index) {
        <li [appReveal]="i">
          <a
            class="flex h-full min-h-[70px] items-center gap-3.5 rounded-[22px] border-2 border-transparent bg-surface py-2.5 pr-4 pl-3 transition hover:translate-x-1 hover:border-(--plate) aria-[current=date]:border-ink"
            [routerLink]="['/week', d.day]"
            [attr.aria-current]="d.day === today ? 'date' : null"
            [attr.data-plate]="d.plate"
          >
            <app-plate class="size-12 shrink-0" [meals]="d.meals" [delay]="i * 0.07" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h2 class="font-display text-2xl leading-none font-extrabold">
                  {{ d.day | titlecase }}
                </h2>
                @if (d.day === today) {
                  <span class="rounded-full bg-ink px-2 py-0.5 text-xs font-bold text-bg"
                    >Today</span
                  >
                }
              </div>
              <p class="mt-1 truncate text-[13px] font-semibold">{{ d.focus }}</p>
            </div>
            <div class="shrink-0 text-right">
              <p class="font-display text-[22px] leading-none font-extrabold">
                {{ d.kcal }}
                <span
                  class="font-sans text-[11px] font-semibold tracking-widest text-muted uppercase"
                  >kcal</span
                >
              </p>
              <p class="mt-1 text-xs text-muted">{{ d.protein }} g protein</p>
            </div>
          </a>
        </li>
      }
    </ol>
  `,
})
export class Week {
  private readonly plan = inject(Plan);

  protected readonly today = weekdayOf(new Date());
  protected readonly days = computed(() =>
    this.plan.week().map((d) => ({
      day: d.day,
      focus: d.focus,
      plate: d.plate,
      meals: d.meals,
      kcal: total(d.meals, 'kcal'),
      protein: total(d.meals, 'protein'),
    })),
  );
  protected readonly gymDays = computed(() => this.plan.week().filter((d) => d.workout).length);
  protected readonly restDays = computed(() => this.plan.week().length - this.gymDays());
}
