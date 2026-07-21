import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  public salesService = inject(SalesService);
  public inventoryService = inject(InventoryService); // Added to check stock levels

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
    const alerts: { type: string, msg: string }[] = [];
    const prods = this.inventoryService.products() || [];
    
    prods.forEach(p => {
      if (!p) return;
      const stock = this.safeParseLocal(p.stockQuantity);
      if (stock <= this.safeParseLocal(p.minStockWarning || 5)) {
        alerts.push({ type: 'warning', msg: `Low Stock: ${p.name} (${stock} left)` });
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

        // Calculate profit for this transaction
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
      // For the demo, we just clear the cash logs so the drawer resets to 0.
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