import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(localStorage.getItem('ikon.theme') === 'dark');

  constructor() {
    this.aplicar();
  }

  alternar(): void {
    this.dark.update((valor) => !valor);
    localStorage.setItem('ikon.theme', this.dark() ? 'dark' : 'light');
    this.aplicar();
  }

  private aplicar(): void {
    document.body.classList.toggle('dark-theme', this.dark());
  }
}
