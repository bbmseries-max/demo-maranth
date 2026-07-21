import { Routes } from '@angular/router';
import { PosComponent } from './pages/pos/pos.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SettingsComponent } from './pages/settings/SettingsComponent';

export const routes: Routes = [
  { path: '', redirectTo: 'pos', pathMatch: 'full' },
  { path: 'pos', component: PosComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent }
];