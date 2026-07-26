import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../shared/services/sales.service';
import { InventoryService } from '../../shared/services/inventory.service';

export interface CashLog {
  id: string;
  type: 'IN' | 'OUT';
  amount: number;
  reason: string;
  timestamp: Date;
}

export interface DailySummary {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  cashRevenue: number;
  cardRevenue: number;
  debtRevenue: number;
}

export interface HourlySales {
  hour: string;
  sales: number;
}

export interface TopProduct {
  name: string;
  quantitySold: number;
  revenue: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './dashboard.component.html'
})


export class DashboardComponent {

  // 1. Today's Key Metrics
  public summary = signal<DailySummary>({
    totalRevenue: 842.50,
    totalOrders: 215,
    averageTicket: 3.92,
    cashRevenue: 380.00,
    cardRevenue: 430.00,
    debtRevenue: 32.50
  });

  // 2. Hourly Sales Curve (Morning Rush Peak)
  public hourlyData = signal<HourlySales[]>([
    { hour: '07:00', sales: 35.00 },
    { hour: '08:00', sales: 120.50 },
    { hour: '09:00', sales: 185.00 },
    { hour: '10:00', sales: 142.00 },
    { hour: '11:00', sales: 95.00 },
    { hour: '12:00', sales: 78.00 },
    { hour: '13:00', sales: 62.00 },
    { hour: '14:00', sales: 55.00 },
    { hour: '15:00', sales: 40.00 },
    { hour: '16:00', sales: 30.00 }
  ]);

  // 3. Top Products Sold Today
  public topProducts = signal<TopProduct[]>([
    { name: 'Espresso Freddo', quantitySold: 92, revenue: 202.40 },
    { name: 'Cappuccino Freddo', quantitySold: 74, revenue: 177.60 },
    { name: 'Τυρόπιτα Κουρού', quantitySold: 28, revenue: 58.80 },
    { name: 'Sandwich Γαλοπούλα', quantitySold: 19, revenue: 66.50 },
    { name: 'Coca-Cola 330ml', quantitySold: 35, revenue: 63.00 }
  ]);

  public salesService = inject(SalesService);
  public inventoryService = inject(InventoryService);

  public activeTab = signal<string>('live');
  public selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  public cashLogs = signal<CashLog[]>(this.loadSavedLogs());
  public salesTarget = 1000;

  constructor() {
    effect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('maranth_cash_logs', JSON.stringify(this.cashLogs()));
      }
    });
  }

  private loadSavedLogs(): CashLog[] {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('maranth_cash_logs');
    return saved ? JSON.parse(saved) : [];
  }

  private safeParseLocal(key: any): number {
    const parsed = Number(key);
    return isNaN(parsed) ? 0 : parsed;
  }

  // --- LIVE DASHBOARD WIDGETS ---
  public todayProfit = computed(() => {
    const todayStr = new Date().toDateString();
    let totalEarnings = 0;
    const txs = this.salesService.transactions() || [];
    
    txs.forEach(tx => {
      if (tx && tx.timestamp && new Date(tx.timestamp).toDateString() === todayStr) {
        const pastOrder: any = tx;
        const itemsArray = pastOrder.basket || pastOrder.items || [];
        
        if (Array.isArray(itemsArray)) {
          itemsArray.forEach((item: any) => {
            const product = item.product || item; 
            const retailPrice = this.safeParseLocal(product.price);
            const wholesaleCost = this.safeParseLocal(product.costPrice || 0);
            const quantity = this.safeParseLocal(item.quantity || 1);
            totalEarnings += (retailPrice - wholesaleCost) * quantity;
          });
        }
      }
    });
    return isNaN(totalEarnings) ? 0 : totalEarnings;
  });

  public liveCashInDrawer = computed(() => {
    const today = new Date().toDateString();
    let todaysCashSales = 0;
    
    const txs = this.salesService.transactions() || [];
    txs.forEach(tx => {
      if (tx && tx.timestamp && tx.paymentMethod) {
        const isToday = new Date(tx.timestamp).toDateString() === today;
        const isCash = String(tx.paymentMethod).toLowerCase() === 'cash';
        if (isToday && isCash) todaysCashSales += (Number(tx.grandTotal) || 0);
      }
    });

    let manualCashIn = 0;
    let manualCashOut = 0;
    this.cashLogs().forEach(log => {
      if (log.type === 'IN') manualCashIn += log.amount;
      if (log.type === 'OUT') manualCashOut += log.amount;
    });

    return manualCashIn + todaysCashSales - manualCashOut;
  });

public systemAlerts = computed(() => {
    const alerts: { type: 'danger' | 'warning' | 'info', msg: string }[] = [];
    const prods = this.inventoryService.products() || [];

    prods.forEach(p => {
      if (!p) return;
      const currentStock = this.safeParseLocal(p.stock);
      // Optional minStock property per product, or default threshold of 5
      const minThreshold = this.safeParseLocal((p as any).minStock ?? 5);

      if (currentStock === 0) {
        alerts.push({ 
          type: 'danger', 
          msg: `Εξαντλήθηκε: ${p.name} (0 τεμ.)` 
        });
      } else if (currentStock <= minThreshold) {
        alerts.push({ 
          type: 'warning', 
          msg: `Χαμηλό Απόθεμα: ${p.name} (Απομένουν ${currentStock} τεμ.)` 
        });
      }
    });

    return alerts;
  });

  public targetProgress = computed(() => {
    const today = new Date().toDateString();
    let todayRev = 0;
    const txs = this.salesService.transactions() || [];
    txs.forEach(tx => {
      if (tx && tx.timestamp && new Date(tx.timestamp).toDateString() === today) {
        todayRev += this.safeParseLocal(tx.grandTotal);
      }
    });
    const percent = Math.min(100, (todayRev / this.salesTarget) * 100);
    return { rev: todayRev, percent: isNaN(percent) ? 0 : percent };
  });

  // --- NEW ANALYTICS REPORTS ---

  // 1. Top Sellers (Most items sold today)
  public topSellers = computed(() => {
    const todayStr = new Date().toDateString();
    const productSales = new Map<string, { name: string, qty: number, total: number }>();
    const txs = this.salesService.transactions() || [];

    txs.forEach(tx => {
      if (tx && tx.timestamp && new Date(tx.timestamp).toDateString() === todayStr) {
        const itemsArray = (tx as any).items || (tx as any).basket || [];
        itemsArray.forEach((item: any) => {
          const product = item.product || item;
          const id = product.id;
          const qty = this.safeParseLocal(item.quantity || 1);
          const price = this.safeParseLocal(product.price);

          if (productSales.has(id)) {
            const current = productSales.get(id)!;
            current.qty += qty;
            current.total += (price * qty);
          } else {
            productSales.set(id, { name: product.name, qty: qty, total: (price * qty) });
          }
        });
      }
    });

    // Convert map to array, sort by quantity sold, and take top 5
    return Array.from(productSales.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  });

  // 2. Revenue by Category (Where is the money coming from?)
  public categoryRevenue = computed(() => {
    const todayStr = new Date().toDateString();
    const categoryTotals = new Map<string, number>();
    const txs = this.salesService.transactions() || [];

    txs.forEach(tx => {
      if (tx && tx.timestamp && new Date(tx.timestamp).toDateString() === todayStr) {
        const itemsArray = (tx as any).items || (tx as any).basket || [];
        itemsArray.forEach((item: any) => {
          const product = item.product || item;
          const category = product.category || 'Άλλο'; // Default category
          const qty = this.safeParseLocal(item.quantity || 1);
          const price = this.safeParseLocal(product.price);
          
          categoryTotals.set(category, (categoryTotals.get(category) || 0) + (price * qty));
        });
      }
    });

    // Convert map to array and sort by highest revenue
    return Array.from(categoryTotals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);

    });

  // --- Z-REPORT LOGIC ---
  public zReportSummary = computed(() => {
    const today = new Date().toDateString();
    let totalRevenue = 0;
    let totalProfit = 0;
    let cashSales = 0;
    let cardSales = 0;
    let txCount = 0;

    const txs = this.salesService.transactions() || [];
    txs.forEach(tx => {
      if (tx && tx.timestamp && new Date(tx.timestamp).toDateString() === today) {
        txCount++;
        const grandTotal = this.safeParseLocal(tx.grandTotal);
        totalRevenue += grandTotal;
        
        if (String(tx.paymentMethod).toLowerCase() === 'cash') cashSales += grandTotal;
        if (String(tx.paymentMethod).toLowerCase() === 'card') cardSales += grandTotal;

        const itemsArray = (tx as any).items || [];
        itemsArray.forEach((item: any) => {
          const product = item.product || item;
          const retail = this.safeParseLocal(product.price);
          const cost = this.safeParseLocal(product.costPrice || 0);
          const qty = this.safeParseLocal(item.quantity || 1);
          totalProfit += (retail - cost) * qty;
        });
      }
    });

    return { totalRevenue, totalProfit, cashSales, cardSales, txCount };
  });

  public closeRegister() {
    const confirmClose = window.confirm('⚠️ Είστε σίγουροι; Αυτό θα εκτυπώσει το Ζ και θα μηδενίσει το ταμείο για αύριο. (Close Register?)');
    if (confirmClose) {
      alert(`🖨️ Εκτύπωση Z-Report... \nΣυνολικός Τζίρος: €${this.zReportSummary().totalRevenue.toFixed(2)}`);
      this.cashLogs.set([]);
      this.activeTab.set('live');
    }
  }

  // --- DRAWER ACTIONS ---
  public addManualCash(): void {
    const amountStr = window.prompt('ADD CASH\nEnter the amount (€):');
    if (!amountStr) return;
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    const reason = window.prompt('Enter the reason:');
    if (!reason) return;

    this.cashLogs.update(logs => [...logs, { id: Date.now().toString(), type: 'IN', amount, reason, timestamp: new Date() }]);
  }

  public removeManualCash(): void {
    const amountStr = window.prompt('PAYOUT / REMOVE CASH\nEnter the amount (€):');
    if (!amountStr) return;
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    const reason = window.prompt('Enter the reason:');
    if (!reason) return;

    this.cashLogs.update(logs => [...logs, { id: Date.now().toString(), type: 'OUT', amount, reason, timestamp: new Date() }]);
  }
}