import { DatePipe, DecimalPipe, formatDate } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  LOCALE_ID,
  signal,
} from '@angular/core';
import {
  ActivePoint,
  CHART,
  ChartPoint,
  DAY_MS,
  DateTick,
  kgAxis,
  KgTick,
  TIP,
  WeightEntry,
} from './weight.model';

/**
 * Weigh-ins as a line over real dates, so a skipped day shows as a longer segment, with the target
 * as a dashed line. Hover or tap reads a day; the Weight page's list is the text version.
 */
@Component({
  selector: 'app-weight-chart',
  imports: [DatePipe, DecimalPipe],
  host: { class: 'block' },
  template: `
    <svg
      class="block w-full touch-pan-y select-none"
      [attr.viewBox]="'0 0 ' + width() + ' ' + chart.height"
      [attr.height]="chart.height"
      role="img"
      [attr.aria-label]="summary()"
      (pointermove)="point($event)"
      (pointerdown)="point($event)"
      (pointerleave)="activeDate.set(null)"
    >
      @for (tick of kgTicks(); track tick.kg) {
        <line
          [attr.x1]="chart.left"
          [attr.x2]="right()"
          [attr.y1]="tick.y"
          [attr.y2]="tick.y"
          class="stroke-line"
        />
        <text
          [attr.x]="chart.left - 8"
          [attr.y]="tick.y + 4"
          text-anchor="end"
          class="fill-muted text-xs tabular-nums"
        >
          {{ tick.kg }}
        </text>
      }
      @for (tick of dateTicks(); track tick.ms) {
        <text
          [attr.x]="tick.x"
          [attr.y]="chart.height - 6"
          [attr.text-anchor]="tick.anchor"
          class="fill-muted text-xs"
        >
          {{ tick.ms | date: 'd MMM' : 'UTC' }}
        </text>
      }

      @if (targetY(); as y) {
        <line
          [attr.x1]="chart.left"
          [attr.x2]="right()"
          [attr.y1]="y"
          [attr.y2]="y"
          stroke-width="1.5"
          stroke-dasharray="6 5"
          stroke-opacity="0.7"
          class="stroke-ink"
        />
        <text [attr.x]="chart.left + 6" [attr.y]="y - 7" class="fill-ink text-xs font-semibold">
          Target {{ target() | number: '1.1-1' }} kg
        </text>
      }

      <polyline
        [attr.points]="line()"
        fill="none"
        stroke-width="2.5"
        stroke-linejoin="round"
        stroke-linecap="round"
        class="stroke-(--plate)"
      />
      @if (last(); as p) {
        <circle
          [attr.cx]="p.x"
          [attr.cy]="p.y"
          r="5"
          stroke-width="2"
          class="fill-(--plate) stroke-surface"
        />
        <!-- The surface-colored stroke paints under the fill, so the label stays legible over the line. -->
        <text
          [attr.x]="p.x"
          [attr.y]="p.y < chart.top + 24 ? p.y + 24 : p.y - 12"
          text-anchor="end"
          paint-order="stroke"
          stroke-width="4"
          stroke-linejoin="round"
          class="fill-ink stroke-surface text-sm font-bold tabular-nums"
        >
          {{ p.kg | number: '1.1-1' }} kg
        </text>
      }

      @if (active(); as p) {
        <line
          [attr.x1]="p.x"
          [attr.x2]="p.x"
          [attr.y1]="chart.top"
          [attr.y2]="chart.bottom"
          class="stroke-muted"
        />
        <circle
          [attr.cx]="p.x"
          [attr.cy]="p.y"
          r="5"
          stroke-width="2"
          class="fill-(--plate) stroke-surface"
        />
        <g [attr.transform]="'translate(' + p.tipX + ' ' + p.tipY + ')'">
          <rect [attr.width]="tip.width" [attr.height]="tip.height" rx="8" class="fill-ink" />
          <text
            [attr.x]="tip.width / 2"
            y="18.5"
            text-anchor="middle"
            class="fill-bg text-xs font-semibold tabular-nums"
          >
            {{ p.date | date: 'EEE d MMM' }} · {{ p.kg | number: '1.1-1' }} kg
          </text>
        </g>
      }
    </svg>
  `,
})
export class WeightChart {
  private readonly locale = inject(LOCALE_ID);

  /** Oldest first. Needs at least one weigh-in; the Weight page shows an empty state instead. */
  readonly entries = input.required<WeightEntry[]>();
  readonly target = input<number | null>(null);

  protected readonly chart = CHART;
  protected readonly tip = TIP;
  /** The chart's width in px, kept equal to its container so labels stay at their real size. */
  protected readonly width = signal(600);
  protected readonly right = computed(() => this.width() - CHART.rightPad);
  protected readonly activeDate = signal<string | null>(null);

  private readonly axis = computed(() => {
    const target = this.target();
    return kgAxis([...this.entries().map((e) => e.kg), ...(target === null ? [] : [target])]);
  });
  private readonly firstMs = computed(() => Date.parse(this.entries()[0].date));
  private readonly spanMs = computed(
    () => Date.parse(this.entries()[this.entries().length - 1].date) - this.firstMs(),
  );

  protected readonly points = computed<ChartPoint[]>(() =>
    this.entries().map((e) => ({ ...e, x: this.x(Date.parse(e.date)), y: this.y(e.kg) })),
  );
  protected readonly line = computed(() =>
    this.points()
      .map((p) => `${p.x},${p.y}`)
      .join(' '),
  );
  protected readonly last = computed(() => this.points()[this.points().length - 1]);
  protected readonly kgTicks = computed<KgTick[]>(() =>
    this.axis().ticks.map((kg) => ({ kg, y: this.y(kg) })),
  );
  protected readonly targetY = computed(() => {
    const target = this.target();
    return target === null ? null : this.y(target);
  });

  /** First and last day, plus the middle one once the dates span a few days. */
  protected readonly dateTicks = computed<DateTick[]>(() => {
    const first = this.firstMs();
    const span = this.spanMs();
    if (!span) return [{ ms: first, x: this.x(first), anchor: 'middle' }];
    const ticks: DateTick[] = [
      { ms: first, x: this.x(first), anchor: 'start' },
      { ms: first + span, x: this.x(first + span), anchor: 'end' },
    ];
    if (span >= 4 * DAY_MS) {
      const middle = Math.round((first + span / 2) / DAY_MS) * DAY_MS;
      ticks.splice(1, 0, { ms: middle, x: this.x(middle), anchor: 'middle' });
    }
    return ticks;
  });

  protected readonly active = computed<ActivePoint | undefined>(() => {
    const p = this.points().find((point) => point.date === this.activeDate());
    if (!p) return undefined;
    const tipX = Math.min(Math.max(p.x - TIP.width / 2, CHART.left), this.right() - TIP.width);
    const above = p.y - TIP.height - 12;
    return { ...p, tipX, tipY: above < 0 ? p.y + 12 : above };
  });

  protected readonly summary = computed(() => {
    const entries = this.entries();
    const first = entries[0];
    const last = entries[entries.length - 1];
    const target = this.target();
    const day = (date: string) => formatDate(date, 'd MMM', this.locale);
    return (
      `Weight chart: ${first.kg} kg on ${day(first.date)}` +
      (last === first ? '' : ` to ${last.kg} kg on ${day(last.date)}`) +
      (target === null ? '.' : `. Target ${target} kg.`)
    );
  });

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => this.width.set(Math.max(host.clientWidth, 240)));
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  /** Marks the weigh-in nearest the pointer. */
  protected point(event: PointerEvent): void {
    if (!(event.currentTarget instanceof Element)) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * this.width();
    const nearest = this.points().reduce((a, b) => (Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a));
    this.activeDate.set(nearest.date);
  }

  private x(ms: number): number {
    const span = this.spanMs();
    const plot = this.right() - CHART.left;
    return span ? CHART.left + ((ms - this.firstMs()) / span) * plot : CHART.left + plot / 2;
  }

  private y(kg: number): number {
    const { min, max } = this.axis();
    return CHART.top + ((max - kg) / (max - min)) * (CHART.bottom - CHART.top);
  }
}
