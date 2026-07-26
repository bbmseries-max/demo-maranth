import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html'
})
export class SettingsComponent {
public themeService = inject(ThemeService);



  // Mock states for the demo UI
  public printerConnected = signal(true);
  public scannerEnabled = signal(true);
  public taxRate = signal('24');
  
  public togglePrinter() {
    this.printerConnected.set(!this.printerConnected());
  }

  public toggleScanner() {
    this.scannerEnabled.set(!this.scannerEnabled());
  }

  public factoryReset() {
    const confirm = window.confirm('WARNING: This will wipe all local data. Continue?');
    if (confirm) {
      localStorage.clear();
      window.location.reload();
    }
  }
}