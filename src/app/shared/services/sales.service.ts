import { Injectable, signal, effect, inject } from '@angular/core';
import { InventoryService } from './inventory.service';

export interface Transaction {
  id: string;
  timestamp: Date;
  items: any[];
  grandTotal: number;
  paymentMethod: 'Cash' | 'Card';
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private inventoryService = inject(InventoryService);
  
  // 1. The Signal: Holds our transaction history
  public transactions = signal<Transaction[]>(this.loadSavedTransactions());

  constructor() {
    // 2. Auto-save all sales to the browser
    effect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('maranth_transactions', JSON.stringify(this.transactions()));
      }
    });
  }

  // 3. Load past sales on startup
  private loadSavedTransactions(): Transaction[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('maranth_transactions');
    return saved ? JSON.parse(saved) : [];
  }

  // 4. The Master Checkout Function
  public processCheckout(cartItems: any[], total: number, method: 'Cash' | 'Card') {
    // A. Save the receipt
    const newTx: Transaction = {
      id: Date.now().toString(),
      timestamp: new Date(),
      items: cartItems,
      grandTotal: total,
      paymentMethod: method
    };
    
    this.transactions.update(txs => [...txs, newTx]);

    // B. Deduct the inventory instantly
    const currentProducts = this.inventoryService.products();
    const updatedProducts = currentProducts.map(product => {
      const purchasedItem = cartItems.find(item => item.product.id === product.id);
      if (purchasedItem) {
        return { 
          ...product, 
          stockQuantity: product.stockQuantity - purchasedItem.quantity 
        };
      }
      return product;
    });
    
    this.inventoryService.products.set(updatedProducts);
  }
}