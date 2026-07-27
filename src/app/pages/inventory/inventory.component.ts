import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService, Product } from '../../shared/services/inventory.service';
import { SalesService } from '../../shared/services/sales.service';

export interface Supplier {
  id: string;
  name: string;
  afm: string;
  phone: string;
  email: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  productCount: number;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html'
})
export class InventoryComponent {
  public salesService = inject(SalesService);
  private inventoryService = inject(InventoryService);

  public selectedProduct = signal<any | null>(null);
  public isEditModalOpen = signal<boolean>(false);

  // Active Tab State
  public activeTab = signal<'products' | 'categories' | 'suppliers' | 'expirations'>('products');

  // Products from service
  public products = this.inventoryService.products;

  // Signals for Category Modal
  public isCategoryModalOpen = signal<boolean>(false);
  public editingCategory = signal<Partial<CategoryItem> | null>(null);

  // Search filter
  public searchQuery = signal<string>('');

  // Sample Categories State
  public categories = signal<CategoryItem[]>([
    { id: '1', name: 'Καφέδες', productCount: 12 },
    { id: '2', name: 'Σνακ', productCount: 8 },
    { id: '3', name: 'Ροφήματα', productCount: 15 },
    { id: '4', name: 'Αναψυκτικά', productCount: 20 }
  ]);

  // Sample Suppliers State
  public suppliers = signal<Supplier[]>([
    { id: '1', name: 'Café Direct A.E.', afm: '094821039', phone: '2101234567', email: 'orders@cafedirect.gr' },
    { id: '2', name: 'Hellenic Bakery Ltd', afm: '998120391', phone: '2109876543', email: 'info@hbakery.gr' },
    { id: '3', name: 'Delta Dairy', afm: '091238471', phone: '2105551234', email: 'sales@delta.gr' }
  ]);

  // Modal Control States
  public isProductModalOpen = signal<boolean>(false);
  public isSupplierModalOpen = signal<boolean>(false);
  public editingProduct = signal<Partial<Product> | null>(null);
  public editingSupplier = signal<Partial<Supplier> | null>(null);

  // Filtered Products
  public filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.products();
    return this.products().filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.barcode && p.barcode.includes(query)) ||
      p.category.toLowerCase().includes(query)
    );
  });

  // Expiring Products (< 30 days)
  public expiringProducts = computed(() => {
    return this.products().filter(p => p.expirationDate !== undefined);
  });

  

  // Tab Switcher
  public setTab(tab: 'products' | 'categories' | 'suppliers' | 'expirations') {
    this.activeTab.set(tab);
  }

  // 4. Click handlers
  public editProduct(product: any): void {
    this.selectedProduct.set(product);
    this.isEditModalOpen.set(true);
  }

  // --- Modal Logic ---
  public openProductModal(product?: Product) {
    if (product) {
      this.editingProduct.set({ ...product });
    } else {
      this.editingProduct.set({
        id: 'p_' + Date.now(),
        name: '',
        price: 0,
        costPrice: 0,
        category: 'Καφέδες',
        barcode: '',
        icon: '☕',
        pinnedToPos: true,
        stock: 0
      });
    }
    this.isProductModalOpen.set(true);
  }

  public closeProductModal() {
    this.isProductModalOpen.set(false);
    this.editingProduct.set(null);
  }

  public saveProduct() {
    const prod = this.editingProduct();
    if (!prod || !prod.name) return;

    // Save/Update logic
    const currentProds = this.products();
    const index = currentProds.findIndex(p => p.id === prod.id);

    if (index > -1) {
      currentProds[index] = prod as Product;
      this.inventoryService.products.set([...currentProds]);
    } else {
      this.inventoryService.products.set([...currentProds, prod as Product]);
    }
}

// Open & Close Category Modal
public openCategoryModal(cat?: CategoryItem): void {
  if (cat) {
    this.editingCategory.set({ ...cat });
  } else {
    this.editingCategory.set({ id: 'c_' + Date.now(), name: '', productCount: 0 });
  }
  this.isCategoryModalOpen.set(true);
}

public closeCategoryModal(): void {
  this.isCategoryModalOpen.set(false);
  this.editingCategory.set(null);
}

public saveCategory(): void {
  const category = this.editingCategory();
  if (!category || !category.name) return;

  this.categories.update(list => {
    const idx = list.findIndex(c => c.id === category.id);
    if (idx > -1) {
      list[idx] = category as CategoryItem;
      return [...list];
    }
    return [...list, category as CategoryItem];
  });

  this.closeCategoryModal();
}

  public openSupplierModal(supplier?: Supplier) {
    if (supplier) {
      this.editingSupplier.set({ ...supplier });
    } else {
      this.editingSupplier.set({ id: 's_' + Date.now(), name: '', afm: '', phone: '', email: '' });
    }
    this.isSupplierModalOpen.set(true);
  }

  public closeSupplierModal() {
    this.isSupplierModalOpen.set(false);
    this.editingSupplier.set(null);
  }

  public saveSupplier() {
    const supp = this.editingSupplier();
    if (!supp || !supp.name) return;

    this.suppliers.update(list => {
      const idx = list.findIndex(s => s.id === supp.id);
      if (idx > -1) {
        list[idx] = supp as Supplier;
        return [...list];
      }
      return [...list, supp as Supplier];
    });

    this.closeSupplierModal();
  }

  // Inside InventoryService:
public deleteProduct(productId: string): void {
  this.products.update(items => items.filter(p => p.id !== productId));
}
}