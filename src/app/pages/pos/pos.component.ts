import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InventoryService, Product } from '../../shared/services/inventory.service';

interface CartItem { product: Product; quantity: number; }

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos.component.html'
})
export class PosComponent {
  private router = inject(Router);

  public navigateTo(path: string) {
    this.router.navigate([path]);
  }

  // Legal Modal States
  public isDisclaimerModalOpen = signal<boolean>(false);
  public isGdprModalOpen = signal<boolean>(false);

  public openDisclaimer() { this.isDisclaimerModalOpen.set(true); }
  public closeDisclaimer() { this.isDisclaimerModalOpen.set(false); }

  public openGdpr() { this.isGdprModalOpen.set(true); }
  public closeGdpr() { this.isGdprModalOpen.set(false); }
  
  // 1. Inject the shared service
  private inventoryService = inject(InventoryService);


  // 2. Read the products directly from the service
  public products = this.inventoryService.products;

  // 3. State Management (Cleaned up duplicates, keeping the Greek!)
  public cart = signal<CartItem[]>([]);
  public activeCategory = signal<string>('Όλα'); 
  public categories = ['Όλα', 'Καφέδες', 'Σνακ', 'Ροφήματα'];
  // 1. Add this near your other signals at the top
  public suspendedOrders = signal<{ id: string, items: CartItem[], total: number }[]>([]);

  // 4. Update the filter to respect your 'pinnedToPos' flag
  public filteredProducts = computed(() => {
    const posItems = this.products().filter(p => p.pinnedToPos);
    
    if (this.activeCategory() === 'Όλα') return posItems;
    return posItems.filter(p => p.category === this.activeCategory());
  });

  public subtotal = computed(() => this.cart().reduce((sum, item) => sum + (item.product.price * item.quantity), 0));
  public tax = computed(() => this.subtotal() * 0.24);
  public total = computed(() => this.subtotal() + this.tax());

  // 5. Scanner Logic
  public handleScan(inputElement: HTMLInputElement) {
    const scannedCode = inputElement.value.trim();
    if (!scannedCode) return;

    const foundProduct = this.products().find(p => p.barcode === scannedCode);

    if (foundProduct) {
      this.addToCart(foundProduct); 
    } else {
      alert(`Product not found: ${scannedCode}`); 
    }

    inputElement.value = '';
  }

  // 6. Cart Actions (Updated productId to string to match your service)
  public setCategory(category: string) {
    this.activeCategory.set(category);
  }

  public addToCart(product: Product) {
    this.playSound('beep'); 
    this.cart.update(items => {
      const existingItem = items.find(i => i.product.id === product.id);
      
      if (existingItem) {
        // Remove the item from its old position
        const otherItems = items.filter(i => i.product.id !== product.id);
        // Put it at the VERY TOP with the updated quantity
        return [{ ...existingItem, quantity: existingItem.quantity + 1 }, ...otherItems];
      }
      
      // Brand new item? Put it at the VERY TOP
      return [{ product, quantity: 1 }, ...items];
    });
  }

  public decreaseQuantity(productId: string) {
    this.cart.update(items => {
      const existingItem = items.find(i => i.product.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return items.map(i => i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return items.filter(i => i.product.id !== productId);
    });
  }

  public removeFromCart(productId: string) {
    this.cart.update(items => items.filter(i => i.product.id !== productId));
  }

 public checkout(paymentMethod: 'cash' | 'card' | 'debt') {

  this.cart().forEach(cartItem => {
  this.inventoryService.products.update(prods => 
    prods.map(p => p.id === cartItem.product.id ? { ...p, stock: p.stock - cartItem.quantity } : p)
  );
});

    if (this.cart().length === 0) return;
       
    this.playSound('chaching'); 
    
    // NOTE: Make sure your transaction saving logic accepts the paymentMethod
    // so your Z-Report can separate Cash vs Card correctly!
    // Example: this.salesService.addTransaction(this.cart(), paymentMethod);
    
    const methodNames = {
      cash: 'Μετρητά',
      card: 'Κάρτα',
      debt: 'Χρέος'
    };

    alert(`Payment of €${this.total().toFixed(2)} via ${methodNames[paymentMethod]} successful!`);
    
    this.cart.set([]); // Clear the cart for the next customer
  }

  

  private playSound(type: 'beep' | 'chaching') {
    const audio = new Audio();
    audio.src = type === 'beep' ? '/assets/beep.mp3' : '/assets/chaching.mp3';
    
    audio.load();
    audio.play().catch(err => {
      console.error(`Failed to play ${type} sound:`, err);
    });
  }

public clearCart() {
    if (confirm('Are you sure you want to clear the current order?')) {
      this.cart.set([]);
    }
  }

 public suspendOrder() {
    if (this.cart().length === 0) return;
    
    // 1. Create a unique ID for this suspended order
    const newSuspended = {
      id: '#' + Math.floor(1000 + Math.random() * 9000).toString(),
      items: [...this.cart()],
      total: this.total()
    };

    // 2. Save it to the suspended orders list
    this.suspendedOrders.update(orders => [...orders, newSuspended]);
    
    // 3. Clear the current cart and play a sound
    this.cart.set([]); 
    this.playSound('beep');
  }

  public triggerRefund() {
    // For a demo, toggling a visual state or showing an alert proves the capability
    alert('Refund mode activated. The next item scanned will be processed as a return.');
  }

  // 3. Add this new function to bring the order back
 public recallOrder(orderId: string) {
    try {
      console.log('1. Trying to recall order:', orderId);
      
      // Find the order
      const orderToRecall = this.suspendedOrders().find(o => o.id === orderId);
      
      if (!orderToRecall) {
        console.error('Error: Could not find the order in memory!');
        return;
      }
      
      // Check if cart is busy
      if (this.cart().length > 0) {
        if (!confirm('Clear current cart to recall the suspended order?')) {
          return; // User canceled
        }
      }
      
      console.log('2. Items found:', orderToRecall.items);
      
      // Safely clone the items back into the cart
      this.cart.set(JSON.parse(JSON.stringify(orderToRecall.items)));
      
      console.log('3. Cart updated. Removing from queue...');
      
      // Remove it from the suspended list
      this.suspendedOrders.update(orders => orders.filter(o => o.id !== orderId));
      
      // Play sound last so an audio error doesn't break the UI
      this.playSound('beep');
      console.log('4. Order recalled successfully!');
      
    } catch (error) {
      console.error('Critical error recalling order:', error);
      alert('Something went wrong restoring the order. Check the console.');
    }
  }

}