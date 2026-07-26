import { Routes } from '@angular/router';
import { PosComponent } from './pages/pos/pos.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TeamComponent } from './pages/team/team.component';
import {  CustomersComponent} from './pages/customers/customers.component'
import { DemoComponent }from './demo/demo.component'

export const routes: Routes = [
  { path: '', redirectTo: 'pos', pathMatch: 'full' },
  { path: 'demo', component: DemoComponent },
  { path: 'pos', component: PosComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'team', component: TeamComponent },
  { path: 'costumers', component: CustomersComponent }
];