import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Modelos y servicios
import { ReservationService } from '../../../core/services/reservation.service';

// Módulo centralizado de Material y componentes compartidos
import { MaterialModule } from '../../../shared/material.module';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface CalendarReservation {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color: string;
  textColor: string;
  user: string;
  attendees: number;
  status: string;
}

@Component({
  selector: 'app-calendar-admin',
  templateUrl: './calendar-admin.component.html',
  styleUrls: ['./calendar-admin.component.scss'],
  standalone: true,
  imports: [
    // Angular Core
    CommonModule,
    
    // Material y Forms
    MaterialModule,
    
    // Componentes compartidos
    LoadingSpinnerComponent
  ]
})
export class CalendarAdminComponent implements OnInit {
  loading = false;
  reservations: CalendarReservation[] = [];
  calendarEvents: any[] = [];
  
  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  
  constructor(
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    // Establecer fechas por defecto: desde hoy hasta 30 días después
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    this.dateRange.setValue({
      start: today,
      end: thirtyDaysLater
    });
    
    this.loadCalendarData();
  }
  
  loadCalendarData(): void {
    const startDate = this.dateRange.value.start;
    const endDate = this.dateRange.value.end;
    
    if (!startDate || !endDate) {
      this.snackBar.open('Por favor, seleccione un rango de fechas válido', 'Cerrar', { duration: 5000 });
      return;
    }
    
    this.loading = true;
    // Corregido el nombre del método a getCalendar
    this.reservationService.getCalendar(startDate, endDate).subscribe({
      next: (data: any) => {
        this.reservations = data.map((reservation: any) => this.mapReservationToCalendarEvent(reservation));
        this.loading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Error al cargar los datos del calendario', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }
  
  mapReservationToCalendarEvent(reservation: any): CalendarReservation {
    // Determinar color según estado de la reserva
    let color = '#4caf50'; // Verde para confirmadas
    let textColor = '#ffffff';
    
    switch (reservation.status) {
      case 'pending': 
        color = '#ff9800'; // Naranja para pendientes
        break;
      case 'cancelled': 
        color = '#f44336'; // Rojo para canceladas
        textColor = '#ffffff';
        break;
      case 'completed': 
        color = '#2196f3'; // Azul para completadas
        break;
    }
    
    return {
      id: reservation.id,
      title: `${reservation.space.name} - ${reservation.user.firstName} ${reservation.user.lastName}`,
      start: new Date(reservation.startTime),
      end: new Date(reservation.endTime),
      color: color,
      textColor: textColor,
      user: `${reservation.user.firstName} ${reservation.user.lastName}`,
      attendees: reservation.attendees,
      status: reservation.status
    };
  }
  
  onDateRangeChange(): void {
    this.loadCalendarData();
  }
}
