import { Injectable, signal, effect } from '@angular/core';

export interface Sale {
  id: string;
  timestamp: number;
  totalAmount: number;
  totalItems: number;
}

export interface Product {
 id: string;
  name: string;
  price: number;
  costPrice: number;
  category: string;
  barcode: string;
  icon: string;
  pinnedToPos: boolean;
  stock: number;
  expirationDate?: Date;
  stockQuantity?: number;
}


@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  // 1. Initial mock fallback data
  private mockProducts: Product[] = [
    { id: 'p1', name: 'Espresso Freddo', price: 2.20, costPrice: 0.45, category: 'Καφέδες', barcode: '52010010001', icon: '🥤', pinnedToPos: true, stock: 450 },
    { id: 'p2', name: 'Cappuccino Freddo', price: 2.40, costPrice: 0.55, category: 'Καφέδες', barcode: '52010010002', icon: '🥤', pinnedToPos: true, stock: 380 },
    { id: 'p3', name: 'Φραπέ (Frappe)', price: 1.80, costPrice: 0.25, category: 'Καφέδες', barcode: '52010010003', icon: '☕', pinnedToPos: true, stock: 600 },
    { id: 'p4', name: 'Ελληνικός Διπλός', price: 1.90, costPrice: 0.30, category: 'Καφέδες', barcode: '52010010004', icon: '☕', pinnedToPos: true, stock: 520 },
    { id: 'p5', name: 'Americano Hot', price: 2.00, costPrice: 0.35, category: 'Καφέδες', barcode: '52010010005', icon: '☕', pinnedToPos: false, stock: 300 },
    { id: 'p6', name: 'Τυρόπιτα Κουρού', price: 2.10, costPrice: 0.70, category: 'Σνακ', barcode: '52020020001', icon: '🥐', pinnedToPos: true, stock: 24, expirationDate: new Date('2026-07-28') },
    { id: 'p7', name: 'Σπανόπιτα Ταψιού', price: 2.30, costPrice: 0.80, category: 'Σνακ', barcode: '52020020002', icon: '🥐', pinnedToPos: true, stock: 18, expirationDate: new Date('2026-07-27') },
    { id: 'p8', name: 'Sandwich Γαλοπούλα', price: 3.50, costPrice: 1.20, category: 'Σνακ', barcode: '52020020003', icon: '🥪', pinnedToPos: true, stock: 12, expirationDate: new Date('2026-07-29') },
    { id: 'p9', name: 'Κρουασάν Σοκολάτα', price: 1.90, costPrice: 0.60, category: 'Σνακ', barcode: '52020020004', icon: '🥐', pinnedToPos: false, stock: 30, expirationDate: new Date('2026-08-05') },
    { id: 'p10', name: 'Φρέσκος Χυμός Πορτοκάλι', price: 3.20, costPrice: 0.90, category: 'Ροφήματα', barcode: '52030030001', icon: '🍊', pinnedToPos: true, stock: 85 },
    { id: 'p11', name: 'Σοκολάτα Ζεστή / Κρύα', price: 2.80, costPrice: 0.75, category: 'Ροφήματα', barcode: '52030030002', icon: '🍫', pinnedToPos: true, stock: 140 },
    { id: 'p12', name: 'Τσάι Πράσινο', price: 2.20, costPrice: 0.30, category: 'Ροφήματα', barcode: '52030030003', icon: '🍵', pinnedToPos: false, stock: 200 },
    { id: 'p13', name: 'Coca-Cola 330ml', price: 1.80, costPrice: 0.70, category: 'Αναψυκτικά', barcode: '5449000000996', icon: '🥤', pinnedToPos: true, stock: 120 },
    { id: 'p14', name: 'Νερό 500ml', price: 0.50, costPrice: 0.12, category: 'Αναψυκτικά', barcode: '52010040001', icon: '💧', pinnedToPos: true, stock: 800 }
  ];



  
  // 1. The Signal: Holds our products and loads saved data instantly
  public products = signal<Product[]>(this.loadSavedProducts());
  public sales = signal<Sale[]>(this.loadSavedSales());

  private loadSavedSales(): Sale[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('maranth_sales');
    return saved ? JSON.parse(saved) : [];
  }

  constructor() {
    // 2. The Auto-Save Effect: Any time products change, save to browser
    effect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('maranth_products', JSON.stringify(this.products()));
      }
    });

    effect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('maranth_products', JSON.stringify(this.products()));
      }
    });

    // 3. Add a second auto-save effect for sales!
    effect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('maranth_sales', JSON.stringify(this.sales()));
      }
    });
  }

  private loadSavedProducts(): Product[] {
    const saved = localStorage.getItem('maranth_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error reading localStorage', e);
      }
    }
    // If empty or null, return mock products!
    return this.mockProducts;
  }

 // Force-reset function
  public resetToMockData() {
    localStorage.removeItem('maranth_products');
    this.products.set(this.mockProducts);
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

  

 public processCheckout(cartItems: { product: Product; quantity: number }[]): void {
    // Deduct stock
    this.products.update(current => 
      current.map(p => {
        const soldItem = cartItems.find(item => item.product.id === p.id);
        if (soldItem) {
          return { ...p, stockQuantity: p.stock - soldItem.quantity };
        }
        return p;
      })
    );
  
    // Calculate totals for the report
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalAmount = subtotal + (subtotal * 0.24); // Adding 24% VAT
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Record the sale
    const newSale: Sale = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      totalAmount: totalAmount,
      totalItems: totalItems
    };

    this.sales.update(current => [newSale, ...current]);
  }
}