import { Injectable, signal, effect } from '@angular/core';

export interface Product {
  id: string;
  name: string;
  category: string;           // Greek titles for UI
  price: number;          // Retail price (with VAT)
  costPrice: number;      // Wholesale cost (with VAT)
  stockQuantity: number;  
  minStockWarning: number;
  pinnedToPos: boolean;   // ⭐ Tells the system to show this on the POS quick-tap screen
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  
  // 1. The Signal: Holds our products and loads saved data instantly
  public products = signal<Product[]>(this.loadSavedProducts());

  constructor() {
    // 2. The Auto-Save Effect: Any time products change, save to browser
    effect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('maranth_products', JSON.stringify(this.products()));
      }
    });
  }

private loadSavedProducts(): Product[] {
    if (typeof window === 'undefined') return [];
    
    const saved = localStorage.getItem('maranth_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 🛡️ The Anti-Robbery Shield: If the saved array is empty, force the mock data to load anyway
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse products', e);
      }
    }

    // Default Demo Data 
   return [
      { id: '1', name: 'Νερό 500ml', category: 'Ροφήματα', price: 0.50, costPrice: 0.15, stockQuantity: 120, minStockWarning: 20, pinnedToPos: true },
      { id: '2', name: 'Freddo Espresso', category: 'Καφέδες', price: 2.20, costPrice: 0.60, stockQuantity: 50, minStockWarning: 5, pinnedToPos: true },
      { id: '3', name: 'Τυρόπιτα', category: 'Σνακ', price: 1.80, costPrice: 0.80, stockQuantity: 15, minStockWarning: 5, pinnedToPos: true },
      { id: '4', name: 'Coca Cola 330ml', category: 'Ροφήματα', price: 1.50, costPrice: 0.55, stockQuantity: 45, minStockWarning: 12, pinnedToPos: true },
      { id: '5', name: 'Κρουασάν Σοκολάτα', category: 'Σνακ', price: 1.70, costPrice: 0.75, stockQuantity: 8, minStockWarning: 10, pinnedToPos: false }
    ];
  }

  // 4. Core Actions for the UI to use later
  public addProduct(product: Product): void {
    this.products.update(current => [...current, product]);
  }

  public updateProduct(updatedProduct: Product): void {
    this.products.update(current => 
      current.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
  }

  public deleteProduct(id: string): void {
    this.products.update(current => current.filter(p => p.id !== id));
  }
}