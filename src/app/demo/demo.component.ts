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
  // Modal & Package Selection Signals
  public isLeadModalOpen = signal<boolean>(false);
  public selectedPackage = signal<string>('Starter POS (€29/mo)');
  public isSubmitting = signal<boolean>(false);
  public submitSuccess = signal<boolean>(false);
  public currentYear = new Date().getFullYear();

  // Form Model
  public leadData = {
    shopName: '',
    phone: '',
    email: '',
    notes: ''
  };

  // Open modal with pre-selected plan
  public openLeadModal(packageName: string): void {
    this.selectedPackage.set(packageName);
    this.submitSuccess.set(false);
    this.isLeadModalOpen.set(true);
  }

  public closeLeadModal(): void {
    this.isLeadModalOpen.set(false);
  }

  // Handle Form Submission (Using Formspree AJAX)
  public async handleLeadSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.isSubmitting.set(true);

    // 💡 Replace 'YOUR_FORMSPREE_ID' with your real endpoint from formspree.io
    const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORMSPREE_ID';

    const payload = {
      package: this.selectedPackage(),
      shopName: this.leadData.shopName,
      phone: this.leadData.phone,
      email: this.leadData.email,
      notes: this.leadData.notes,
      sourceUrl: 'https://demo-maranth.vercel.app/demo'
    };

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        this.submitSuccess.set(true);
        this.leadData = { shopName: '', phone: '', email: '', notes: '' };
      } else {
        alert('Υπήρξε πρόβλημα κατά την αποστολή. Παρακαλώ δοκιμάστε ξανά.');
      }
    } catch (error) {
      console.error('Lead submission error:', error);
      alert('Σφάλμα σύνδεσης. Παρακαλώ ελέγξτε τη σύνδεσή σας.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Footer helpers
  public openGdpr(): void {
    alert('🔒 Η Maranth POS δεν κοινοποιεί τα στοιχεία σας σε τρίτους.');
  }

  public openDisclaimer(): void {
    alert('⚖️ Δοκιμαστική έκδοση (Demo).');
  }
}