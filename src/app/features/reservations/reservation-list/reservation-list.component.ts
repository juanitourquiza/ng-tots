import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation } from '../../../core/models/reservation.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './reservation-list.component.html',
  styleUrl: './reservation-list.component.scss'
})
export class ReservationListComponent implements OnInit {
  upcomingReservations: Reservation[] = [];
  pastReservations: Reservation[] = [];
  loading = false;
  activeTabIndex = 0;
  
  constructor(
    private reservationService: ReservationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadReservations();
  }
  
  loadReservations(): void {
    this.loading = true;
    this.reservationService.getUserReservations().subscribe({
      next: (reservations) => {
        const now = new Date();
        
        // Separar reservas en próximas y pasadas
        this.upcomingReservations = reservations.filter(reservation => 
          new Date(reservation.startTime) > now || 
          (reservation.status !== 'canceled' && reservation.status !== 'rejected')
        );
        
        this.pastReservations = reservations.filter(reservation => 
          new Date(reservation.startTime) <= now && 
          (reservation.status === 'canceled' || reservation.status === 'rejected')
        );
        
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error al cargar las reservas', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }
  
  cancelReservation(reservationId: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.reservationService.cancelReservation(reservationId).subscribe({
        next: () => {
          this.snackBar.open('Reserva cancelada correctamente', 'Cerrar', { duration: 5000 });
          this.loadReservations(); // Recargar las reservas
        },
        error: (error) => {
          this.snackBar.open('Error al cancelar la reserva', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
  
  editReservation(reservationId: number): void {
    this.router.navigate(['/reservations/edit', reservationId]);
  }
  
  createReservation(): void {
    this.router.navigate(['/spaces']);
  }
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'approved': return 'approved';
      case 'pending': return 'pending';
      case 'canceled': return 'canceled';
      case 'rejected': return 'rejected';
      default: return '';
    }
  }
  
  getStatusLabel(status: string): string {
    switch(status) {
      case 'approved': return 'Aprobada';
      case 'pending': return 'Pendiente';
      case 'canceled': return 'Cancelada';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  }
  
  formatDate(date: string | Date): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleString('es-ES', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  }
  
  canCancelReservation(reservation: Reservation): boolean {
    return (
      reservation.status !== 'canceled' && 
      reservation.status !== 'rejected' &&
      new Date(reservation.startTime) > new Date()
    );
  }
}
