import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Employee {
  id: number;
  name: string;
  role: 'Admin' | 'Manager' | 'Cashier';
  status: 'Active' | 'Off-duty';
  initials: string;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team.component.html'
})
export class TeamComponent {
  
  // Our staff database
  public team = signal<Employee[]>([
    { id: 1, name: 'Alex Johnson', role: 'Admin', status: 'Active', initials: 'AJ' },
    { id: 2, name: 'Maria Garcia', role: 'Manager', status: 'Off-duty', initials: 'MG' },
    { id: 3, name: 'David Smith', role: 'Cashier', status: 'Active', initials: 'DS' },
    { id: 4, name: 'Emma Wilson', role: 'Cashier', status: 'Off-duty', initials: 'EW' }
  ]);

  public removeMember(id: number) {
    this.team.update(members => members.filter(m => m.id !== id));
  }
}