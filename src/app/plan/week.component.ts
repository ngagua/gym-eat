import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { total, weekdayOf } from './plan.model';
import { Plan } from './plan.service';
import { Plate } from './plate.component';

@Component({
  imports: [Plate, RouterLink, TitleCasePipe],
  template: `
    <h1 class="pt-2 font-display text-7xl leading-[0.85] font-black sm:text-8xl">Week</h1>
    <ol class="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      @for (d of days(); track d.day; let i = $index) {
        <li>
          <a
            class="flex h-full items-center gap-4 rounded-3xl border-2 border-transparent bg-surface p-4 transition-colors hover:border-(--plate) aria-[current=date]:border-ink xl:flex-col xl:items-start"
            [routerLink]="['/week', d.day]"
            [attr.aria-current]="d.day === today ? 'date' : null"
            [attr.data-plate]="d.plate"
          >
            <app-plate class="size-16 shrink-0 xl:size-24" [meals]="d.meals" [delay]="i * 0.07" />
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h2 class="font-display text-3xl leading-none font-black xl:text-2xl">
                  {{ d.day | titlecase }}
                </h2>
                @if (d.day === today) {
                  <span class="rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-bg"
                    >Today</span
                  >
                }
              </div>
              <p class="mt-1.5 font-semibold">{{ d.focus }}</p>
              <p class="mt-1 text-sm text-muted">{{ d.kcal }} kcal, {{ d.protein }} g protein</p>
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
}
