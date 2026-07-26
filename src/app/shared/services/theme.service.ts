import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal to hold the current theme
  public activeTheme = signal<string>('light');

  public availableThemes = [
    { id: 'light', name: 'Light Mode', icon: '☀️' },
    { id: 'dark', name: 'Dark Mode', icon: '🌙' },
    { id: 'coffee', name: 'Coffee Shop', icon: '☕' }
  ];

  constructor() {
    // 1. Load the theme from storage if it exists (client-side only)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('pos_theme');
      if (savedTheme) {
        this.activeTheme.set(savedTheme);
      }
    }

    // 2. Automatically update the DOM tag whenever the signal changes
    effect(() => {
      const currentTheme = this.activeTheme();
      if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('pos_theme', currentTheme);
      }
    });
  }

  public setTheme(themeId: string) {
    this.activeTheme.set(themeId);
  }
}