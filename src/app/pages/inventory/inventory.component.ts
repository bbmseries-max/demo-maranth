import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, Product } from '../../shared/services/inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory.component.html'
})
export class InventoryComponent {
  public inventoryService = inject(InventoryService);
  
  // Expose the products signal to the HTML
  public products = this.inventoryService.products;

  // The "Quick Receive" Workflow for the Demo
  public receiveGoods(product: Product) {
    const qtyStr = window.prompt(`📦 Πόσα νέα τεμάχια παραλάβατε για: ${product.name}?`);
    if (!qtyStr) return;
    
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty <= 0) return;

    const newCostStr = window.prompt(`Τιμή Αγοράς (Χονδρική) ανά τεμάχιο (€):`, product.costPrice.toString());
    const newCost = newCostStr ? parseFloat(newCostStr.replace(',', '.')) : product.costPrice;

    // Instantly update the stock and the cost price
    this.inventoryService.updateProduct({
      ...product,
      stockQuantity: product.stockQuantity + qty,
      costPrice: isNaN(newCost) ? product.costPrice : newCost
    });
  }
}