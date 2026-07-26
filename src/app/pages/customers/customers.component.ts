import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customers.component.html'
})
export class CustomersComponent {
  public searchQuery = signal('');
  public selectedCustomer = signal<any>(null);
  
  public mockCustomers = [
    { id: 'C001', name: 'Γιώργος Παπαδόπουλος', phone: '694-XXXX-123', tier: 'Gold', points: 2450, lastVisit: 'Σήμερα, 09:15', lifetimeValue: 840.50 },
    { id: 'C002', name: 'Ανδρέας Κωνσταντίνου', phone: '697-XXXX-456', tier: 'Silver', points: 820, lastVisit: 'Χθες', lifetimeValue: 320.00 },
    { id: 'C003', name: 'Μαρία Λεοντίου', phone: '698-XXXX-789', tier: 'Bronze', points: 150, lastVisit: 'Πριν 3 μέρες', lifetimeValue: 45.20 }
  ];

  public scanMemberCard() {
    // Simulates a barcode/QR scan that instantly pulls up the VIP customer
    this.selectedCustomer.set(this.mockCustomers[0]);
    alert('✅ Κάρτα Μέλους Αναγνωρίστηκε (Γιώργος Παπαδόπουλος)');
  }

  public selectCustomer(customer: any) {
    this.selectedCustomer.set(customer);
  }

  public getTierColor(tier: string): string {
    switch(tier) {
      case 'Gold': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Silver': return 'bg-slate-200 text-slate-700 border-slate-300';
      case 'Bronze': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}