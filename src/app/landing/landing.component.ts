import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html'
})
export class LandingComponent {
  public currentYear = new Date().getFullYear();
  public contactPhone = '306934874068';

  public isLeadModalOpen = signal<boolean>(false);
  public selectedPackage = signal<string>('Starter POS (€29/mo)');
  public isSubmitting = signal<boolean>(false);
  public submitSuccess = signal<boolean>(false);

  // Legal Modal Signal ('gdpr' | 'disclaimer' | null)
  public activeLegalModal = signal<'gdpr' | 'disclaimer' | null>(null);

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

  // Legal Modal Helpers
  public openGdpr(): void {
    this.activeLegalModal.set('gdpr');
  }

  public openDisclaimer(): void {
    this.activeLegalModal.set('disclaimer');
  }

  public closeLegalModal(): void {
    this.activeLegalModal.set(null);
  }

  public get whatsAppUrl(): string {
    const text = encodeURIComponent('Γεια σας! Ενδιαφέρομαι για το Maranth POS.');
    return `https://wa.me/${this.contactPhone}?text=${text}`;
  }

  public get viberUrl(): string {
    return `viber://chat?number=%2B${this.contactPhone}`;
  }

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
        console.error('Web3Forms Error response:', result);
      }
    } catch (error) {
      console.error('Web3Forms Error:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}