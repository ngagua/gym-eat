import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [DatePipe, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  // Clips the turning plate behind the day's ring where it runs past the screen edge.
  host: { class: 'flex min-h-dvh flex-col overflow-x-clip' },
  template: `
    <header
      class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-6"
    >
      <a routerLink="/today" class="font-display text-3xl font-black md:text-4xl">Gym+Eat</a>
      <div class="flex items-center gap-3">
        <span
          class="rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] font-semibold md:px-4 md:py-2.5 md:text-sm"
          >{{ now | date: 'EEE d MMM' }}</span
        >
        <!-- A floating tab bar at the thumb on phones, inline in the header from tablets up. -->
        <nav
          aria-label="Main"
          class="fixed inset-x-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-10 grid grid-cols-2 gap-1.5 rounded-full border border-line bg-surface p-1.5 md:static md:flex"
        >
          @for (tab of tabs; track tab.path) {
            <a
              [routerLink]="tab.path"
              routerLinkActive
              ariaCurrentWhenActive="page"
              class="flex h-12 items-center justify-center gap-2 rounded-full px-5 font-semibold text-muted transition-colors hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:font-bold aria-[current=page]:text-bg md:h-11"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
                class="size-[18px] shrink-0"
              >
                @if (tab.path === '/today') {
                  <circle cx="12" cy="12" r="8.5" />
                  <circle cx="12" cy="12" r="2.5" />
                } @else {
                  <rect x="3.5" y="5" width="17" height="15" rx="3" />
                  <path d="M3.5 10h17M8 3v4M16 3v4" />
                }
              </svg>
              {{ tab.label }}
            </a>
          }
        </nav>
      </div>
    </header>
    <main class="mx-auto w-full max-w-6xl flex-1 px-5 pb-32 md:px-8 md:pb-16">
      <router-outlet />
    </main>
    <!-- Fades the page out where it scrolls under the floating tab bar. -->
    <div
      aria-hidden="true"
      class="pointer-events-none fixed inset-x-0 bottom-0 z-5 h-28 bg-linear-to-b from-transparent to-bg md:hidden"
    ></div>
  `,
})
export class App {
  protected readonly now = new Date();
  protected readonly tabs = [
    { path: '/today', label: 'Today' },
    { path: '/week', label: 'Week' },
  ];
}
