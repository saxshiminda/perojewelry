import { Injectable, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'perojewelry-theme';
  readonly theme = signal<ThemeMode>('dark');

  init(): void {
    const saved = localStorage.getItem(this.storageKey) as ThemeMode | null;
    const mode: ThemeMode = saved === 'light' || saved === 'dark' ? saved : 'dark';
    this.apply(mode);
  }

  toggle(): void {
    this.apply(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(mode: ThemeMode): void {
    this.apply(mode);
  }

  private apply(mode: ThemeMode): void {
    this.theme.set(mode);
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(this.storageKey, mode);
  }
}
