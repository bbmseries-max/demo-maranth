import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LogoComponent } from './shared/logo/logo.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  // Tracks the state of the mobile hamburger menu
  public isMobileMenuOpen = signal(false);

  public toggleMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  public closeMenu() {
    this.isMobileMenuOpen.set(false);
  }
}