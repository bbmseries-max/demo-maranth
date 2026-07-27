import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from '../shared/services/inventory.service';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [],
  templateUrl: './demo.component.html'
})
export class DemoComponent {
  private router = inject(Router);
  private inventoryService = inject(InventoryService);

  // Modal State for Plan Selection / Lead Contact
  public isContactModalOpen = signal<boolean>(false);
  public selectedPlan = signal<string>('Starter');

  public launchDemoSession() {
    this.inventoryService.resetToMockData();
    this.router.navigate(['/pos']);
  }

  public scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  public openPlanContact(planName: string) {
    this.selectedPlan.set(planName);
    this.isContactModalOpen.set(true);
  }

  public closeContactModal() {
    this.isContactModalOpen.set(false);
  }
// ⭐ GDPR & Disclaimer Handlers
  public openGdpr(): void {
    alert(
      '🔒 Πολιτική Προστασίας Δεδομένων (GDPR)\n\n' +
      'Η Maranth POS δεν συλλέγει προσωπικά δεδομένα κατά τη διάρκεια της δοκιμής (Demo). ' +
      'Όλα τα στοιχεία που εισάγονται στη φόρμα επικοινωνίας χρησιμοποιούνται αποκλειστικά για την επικοινωνία μαζί σας.'
    );
  }

  public openDisclaimer(): void {
    alert(
      '⚖️ Όροι Χρήσης & Αποποίηση Ευθύνης\n\n' +
      'Η παρούσα εφαρμογή αποτελεί δοκιμαστική έκδοση (Demo). ' +
      'Τα δεδομένα πωλήσεων και προϊόντων στο demo περιβάλλον είναι εικονικά και δεν αντικατοπτρίζουν πραγματικές φορολογικές συναλλαγές.'
    );
  }

}