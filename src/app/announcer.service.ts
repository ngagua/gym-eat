import { Service, signal } from '@angular/core';

/**
 * Status messages for screen readers ("Saved 85.9 kg…", "Removed Lat pulldown."). The app shell
 * renders the one live region, so it exists before any message arrives and is always read out.
 */
@Service()
export class Announcer {
  readonly message = signal('');

  say(message: string): void {
    this.message.set(message);
  }
}
