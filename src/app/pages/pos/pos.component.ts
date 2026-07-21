import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, Product } from '../../shared/services/inventory.service';
import { SalesService } from '../../shared/services/sales.service';

// Interface for what goes in the cart
export interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos.component.html'
})
export class PosComponent {
  private inventoryService = inject(InventoryService);
  public selectedCategory = signal<string>('Όλα');
  public salesService = inject(SalesService);

  // 2. Extract unique categories from pinned products automatically
  public categories = computed(() => {
    const allPinned = this.inventoryService.products().filter(p => p.pinnedToPos);
    // Use Set to get unique categories, default to 'Άλλο' if missing
    const uniqueCats = [...new Set(allPinned.map(p => p.category || 'Άλλο'))];
    return ['Όλα', ...uniqueCats]; // 'Όλα' is our "All" tab
  });

  // 3. Filter products based on the selected tab
  public filteredProducts = computed(() => {
    const allPinned = this.inventoryService.products().filter(p => p.pinnedToPos);
    const currentCat = this.selectedCategory();
    
    if (currentCat === 'Όλα') return allPinned;
    return allPinned.filter(p => (p.category || 'Άλλο') === currentCat);
  });

  // 1. Grab only the items meant for the POS screen
  public pinnedProducts = computed(() => {
    return this.inventoryService.products().filter(p => p.pinnedToPos);
  });

  // 2. Cart State
  public cart = signal<CartItem[]>([]);

  // 3. Auto-calculating Total
  public cartTotal = computed(() => {
    return this.cart().reduce((total, item) => total + (item.product.price * item.quantity), 0);
  });

  // 4. Cart Actions
  public addToCart(product: Product) {
    this.cart.update(currentCart => {
      const existingItem = currentCart.find(item => item.product.id === product.id);
      if (existingItem) {
        // If it exists, just bump the quantity
        return currentCart.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // If it's new, add it to the array
      return [...currentCart, { product, quantity: 1 }];
    });
  }

  public increaseQty(productId: string) {
    this.cart.update(current => 
      current.map(item => item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item)
    );
  }

  public decreaseQty(productId: string) {
    this.cart.update(current => {
      return current.map(item => item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item)
             .filter(item => item.quantity > 0); // Auto-remove if quantity hits 0
    });
  }

  public clearCart() {
    this.cart.set([]);
  }

public checkout(method: 'Cash' | 'Card' = 'Cash') {
    if (this.cart().length === 0) return;
    
    // Process the sale (saves receipt + deducts stock)
    this.salesService.processCheckout(this.cart(), this.cartTotal(), method);
    
    // Show success & clear cart
    alert(`✅ Πληρωμή Επιτυχής! (€${this.cartTotal().toFixed(2)})`);
    this.clearCart();
  }
}