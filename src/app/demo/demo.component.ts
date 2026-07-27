import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './demo.component.html'
})
export class DemoComponent {
  public currentYear = new Date().getFullYear();

  // Modal & Package Signals
  public isLeadModalOpen = signal<boolean>(false);
  public selectedPackage = signal<string>('Starter POS (€29/mo)');
  public isSubmitting = signal<boolean>(false);
  public submitSuccess = signal<boolean>(false);

  // Form Fields
  public leadData = {
    name: '',
    phone: '',
    email: '',
    message: ''
  };

  public openLeadModal(packageName: string): void {
    this.selectedPackage.set(packageName);
    this.submitSuccess.set(false);
    this.isLeadModalOpen.set(true);
  }

  public closeLeadModal(): void {
    this.isLeadModalOpen.set(false);
  }

  // ⭐ AJAX Submit to Web3Forms
  public async handleLeadSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.isSubmitting.set(true);

    const payload = {
      access_key: '490a2786-cbe8-4be4-bc47-47ab60f097fa',
      subject: `Maranth Lead: ${this.selectedPackage()} - ${this.leadData.name}`,
      package_chosen: this.selectedPackage(),
      name: this.leadData.name,
      phone: this.leadData.phone,
      email: this.leadData.email,
      message: this.leadData.message,
      from_name: 'Maranth POS Demo'
    };

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        this.submitSuccess.set(true);
        this.leadData = { name: '', phone: '', email: '', message: '' };
      } else {
        alert('Υπήρξε πρόβλημα κατά την αποστολή. Παρακαλώ δοκιμάστε ξανά.');
      }
    } catch (error) {
      console.error('Web3Forms Error:', error);
      alert('Σφάλμα σύνδεσης. Παρακαλώ ελέγξτε τη σύνδεσή σας.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Footer Helpers
  public openGdpr(): void {
    alert('🔒 Η Maranth POS δεν κοινοποιεί τα στοιχεία σας σε τρίτους.');
  }

  public openDisclaimer(): void {
    alert('⚖️ Δοκιμαστική έκδοση (Demo).');
  }
}