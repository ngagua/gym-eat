import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Motion } from './motion/motion.service';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    <header
      class="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8 md:py-6"
    >
      <a routerLink="/today" class="font-display text-3xl font-black">Gym+Eat</a>
      <div class="flex items-center gap-2">
        <!-- A tab bar at the thumb on phones, inline in the header from tablets up. -->
        <nav
          aria-label="Main"
          class="fixed inset-x-0 bottom-0 z-10 grid grid-cols-2 gap-2 border-t border-line bg-surface px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:static md:flex md:border-0 md:bg-transparent md:p-0"
        >
          @for (tab of tabs; track tab.path) {
            <a
              [routerLink]="tab.path"
              routerLinkActive
              ariaCurrentWhenActive="page"
              class="rounded-full px-5 py-2.5 text-center font-semibold text-muted transition-colors hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-bg"
              >{{ tab.label }}</a
            >
          }
        </nav>
        <!-- The chalk dust moves on its own, so WCAG 2.2.2 asks for a way to stop it. -->
        @if (motion.enabled()) {
          <button
            type="button"
            class="grid size-10 place-items-center rounded-full text-muted transition-colors hover:text-ink"
            [attr.aria-label]="
              motion.backgroundPaused() ? 'Play background animation' : 'Pause background animation'
            "
            (click)="motion.toggleBackground()"
          >
            @if (motion.backgroundPaused()) {
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5">
                <path
                  d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z"
                />
              </svg>
            } @else {
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="size-5">
                <path
                  d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z"
                />
              </svg>
            }
          </button>
        }
      </div>
    </header>
    <main class="mx-auto w-full max-w-6xl flex-1 px-5 pb-28 md:px-8 md:pb-16">
      <router-outlet />
    </main>
  `,
})
export class App {
  protected readonly motion = inject(Motion);
  protected readonly tabs = [
    { path: '/today', label: 'Today' },
    { path: '/week', label: 'Week' },
  ];
}
