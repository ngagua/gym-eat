import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  host: { class: 'flex min-h-dvh flex-col' },
  template: `
    <header
      class="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8 md:py-6"
    >
      <a routerLink="/today" class="font-display text-3xl font-black">Gym+Eat</a>
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
    </header>
    <main class="mx-auto w-full max-w-6xl flex-1 px-5 pb-28 md:px-8 md:pb-16">
      <router-outlet />
    </main>
  `,
})
export class App {
  protected readonly tabs = [
    { path: '/today', label: 'Today' },
    { path: '/week', label: 'Week' },
  ];
}
