import { Component, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  imports: [
    RouterModule,
    RouterOutlet
  ]
})
export class AdminDashboardComponent {
  navLinks = [
    { path: '/admin/spaces', label: 'Espacios' },
    { path: '/admin/reservations', label: 'Reservas' },
    { path: '/admin/calendar', label: 'Calendario' }
  ];
  
  constructor(private router: Router) {}
}
