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

 public isDisclaimerModalOpen = signal<boolean>(false);
  public isGdprModalOpen = signal<boolean>(false);

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
}