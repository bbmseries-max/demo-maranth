import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../shared/services/inventory.service';
import { SalesService } from '../../shared/services/sales.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './SettingsComponent.html'
})
export class SettingsComponent {
  private inventoryService = inject(InventoryService);
  private salesService = inject(SalesService);

  // Store Configuration
  public storeName = signal<string>('Maranth Mini Market');
  public receiptMessage = signal<string>('Ευχαριστούμε για την προτίμηση!');
  public taxRate = signal<number>(24);

  public saveSettings() {
    // In a real app, this would save to a SettingsService/LocalStorage
    alert('✅ Ρυθμίσεις αποθηκεύτηκαν επιτυχώς! (Settings saved)');
  }

  // Demo Reset Function
  public factoryReset() {
    const confirmWipe = window.confirm('⚠️ ΠΡΟΣΟΧΗ: Αυτό θα διαγράψει όλα τα προϊόντα και τις πωλήσεις. (WARNING: This will wipe all data and reset the demo)');
    
    if (confirmWipe) {
      // 1. Clear the browser database
      localStorage.removeItem('maranth_products');
      localStorage.removeItem('maranth_transactions');
      localStorage.removeItem('maranth_cash_logs');
      
      // 2. Clear the live signals
      this.inventoryService.products.set([]);
      this.salesService.transactions.set([]);
      
      // 3. Reload the app to trigger the default mock data injection
      alert('🗑️ Το σύστημα καθαρίστηκε. (System wiped clean)');
      window.location.reload();
    }
  }
}