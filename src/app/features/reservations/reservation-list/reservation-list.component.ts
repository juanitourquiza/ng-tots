import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { delay } from 'rxjs/operators';

// Material imports
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

// App imports
import { ReservationService } from '../../../core/services/reservation.service';
import { Reservation } from '../../../core/models/reservation.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

// Interfaz para los datos del diálogo de confirmación
export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
}

// Componente de diálogo de confirmación (definido en el mismo archivo)
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions],
  template: `
    <h2 matDialogTitle>{{data.title}}</h2>
    <div matDialogContent>
      <p>{{data.message}}</p>
    </div>
    <div matDialogActions align="end">
      <button mat-button (click)="dialogRef.close(false)">{{data.cancelButtonText || 'Cancelar'}}</button>
      <button mat-button color="warn" (click)="dialogRef.close(true)" cdkFocusInitial>
        {{data.confirmButtonText || 'Confirmar'}}
      </button>
    </div>
  `,
  styles: [`
    [matDialogContent] { padding: 16px 0; }
    [matDialogActions] { margin-bottom: 8px; }
  `]
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}
}

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
    MatDialogModule,
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
  // Mapa para rastrear los IDs de las URL de las reservas
  private reservationUrlMap: Map<string, number> = new Map();
  
  constructor(
    private reservationService: ReservationService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    // Verificar si necesitamos forzar una recarga de reservaciones
    const forceReload = sessionStorage.getItem('forceReloadReservations');
    
    if (forceReload === 'true') {
      console.log('Se detectó señal de forzar recarga de reservaciones');
      // Limpiar la bandera para evitar recargas innecesarias en el futuro
      sessionStorage.removeItem('forceReloadReservations');
      
      // Forzar una recarga directa desde el backend sin usar la caché
      this.loadReservationsFromBackend();
    } else {
      // Carga normal
      this.loadReservations();
    }
  }
  
  /**
   * Fuerza una recarga directa de reservaciones desde el backend sin usar caché
   */
  loadReservationsFromBackend(): void {
    this.loading = true;
    console.log('FORZANDO recarga directa de reservaciones del backend...');
    
    // Agregar un timestamp al final para evitar caché
    const timestamp = new Date().getTime();
    this.reservationService.getUserReservations().pipe(
      // Esperar un momento para asegurar que el backend tenga tiempo de procesar
      delay(300)
    ).subscribe({
      next: (reservations) => {
        console.log(`Reservas recibidas en recarga forzada (${timestamp}):`, reservations);
        this.processReservations(reservations);
      },
      error: (error) => {
        console.error('Error al forzar recarga de reservas:', error);
        this.snackBar.open('Error al recargar las reservas', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }
  
  /**
   * Procesa las reservaciones recibidas del backend, filtrando y organizándolas
   * @param reservations Lista de reservaciones del backend
   */
  processReservations(reservations: Reservation[]): void {
    console.log('Procesando reservas recibidas:', reservations);
    
    // Filtrar reservas sin ID real del backend (pueden ser temporales o inválidas)
    const validReservations = reservations.filter(res => !!res.id);
    
    if (validReservations.length < reservations.length) {
      console.warn(`Se ignoraron ${reservations.length - validReservations.length} reservas sin ID válido`);
    }

    // Verificar si tenemos una reserva nueva en sessionStorage
    const newReservationJson = sessionStorage.getItem('newReservation');
    
    if (newReservationJson) {
      try {
        const newReservation = JSON.parse(newReservationJson);
        
        // Verificar si la nueva reserva ya existe en la lista recibida del backend
        const exists = validReservations.some(res => 
          res.id === newReservation.id || 
          this.generateReservationKey(res) === this.generateReservationKey(newReservation)
        );
        
        if (!exists && newReservation.id) {
          console.log('Agregando nueva reserva desde sessionStorage:', newReservation);
          validReservations.push(newReservation);
        } else {
          console.log('La nueva reserva ya existe en la lista o no tiene ID válido');
        }
        
        // Limpiar el storage después de usarlo
        sessionStorage.removeItem('newReservation');
      } catch (e) {
        console.error('Error al parsear la nueva reserva de sessionStorage:', e);
      }
    }
    
    const now = new Date();
    
    // Separar en pasadas y próximas
    this.upcomingReservations = validReservations
      .filter(r => new Date(r.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    this.pastReservations = validReservations
      .filter(r => new Date(r.startTime) <= now)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    
    console.log(`Reservas procesadas: ${this.upcomingReservations.length} próximas, ${this.pastReservations.length} pasadas`);
    this.loading = false;
  }
  
  loadReservations(): void {
    this.loading = true;
    console.log('Cargando reservaciones del usuario...');
    this.reservationService.getUserReservations().subscribe({
      next: (reservations) => {
        console.log('Reservas recibidas:', reservations);
        this.processReservations(reservations);
      },
      error: (error) => {
        console.error('Error al cargar reservas:', error);
        this.snackBar.open('Error al cargar las reservas', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }
  
  /**
   * Genera una clave única para una reserva basada en su espacio y fechas
   */
  private generateReservationKey(reservation: Reservation): string {
    const spaceId = reservation.space?.id || 'unknown';
    const start = new Date(reservation.startTime).getTime();
    const end = new Date(reservation.endTime).getTime();
    return `space_${spaceId}_${start}_${end}`;
  }
  
  /**
   * Obtiene un ID válido para la reserva (ID original o clientId generado)
   */
  getReservationId(reservation: Reservation): number {
    return reservation.id || (reservation as any).clientId;
  }

  cancelReservation(id: number): void {
    console.log('Intentando cancelar reserva con ID:', id);
    
    // Buscar la reserva en nuestra lista local usando el ID proporcionado
    const allReservations = [...this.upcomingReservations, ...this.pastReservations];
    const reservationToCancel = allReservations.find(r => this.getReservationId(r) === id);
    
    if (!reservationToCancel) {
      this.snackBar.open('No se encontró la reserva para cancelar', 'Cerrar', { duration: 3000 });
      return;
    }
    
    // Verificar si es un ID real o un clientId generado
    if (!reservationToCancel.id && (reservationToCancel as any).clientId) {
      this.snackBar.open('No se pueden cancelar reservas temporales sin ID de backend', 'Cerrar', { duration: 5000 });
      return;
    }
    
    // Verificar que tengamos un ID real para la solicitud al backend
    const realId = reservationToCancel.id;
    if (!realId) {
      this.snackBar.open('Esta reserva no tiene un ID válido en el backend', 'Cerrar', { duration: 3000 });
      return;
    }

    // Abrir diálogo de confirmación en lugar de alerta nativa
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        title: 'Cancelar Reserva',
        message: '¿Estás seguro de que deseas cancelar esta reserva?',
        confirmButtonText: 'Sí, Cancelar',
        cancelButtonText: 'No'
      }
    });
    
    // Suscribirse al resultado del diálogo
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        console.log('Enviando solicitud de cancelación para ID real:', realId);
        this.reservationService.cancelReservation(realId).subscribe({
          next: () => {
            this.snackBar.open('Reserva cancelada correctamente', 'Cerrar', { duration: 3000 });
            this.loadReservations(); // Recargar la lista de reservas
          },
          error: (err) => {
            console.error('Error al cancelar la reserva:', err);
            this.snackBar.open(`Error al cancelar la reserva: ${err.error?.message || err.message}`, 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }
  
  debugReservation(reservation: Reservation): void {
    console.log('Depurando reserva:', reservation);
    console.log('ID:', reservation.id);
    console.log('ClientID:', (reservation as any).clientId);
    console.log('Tipo de ID:', typeof reservation.id);
    console.log('¿Tiene ID?', !!reservation.id);
    console.log('¿Tiene ClientID?', !!(reservation as any).clientId);
    console.log('Todas las propiedades:', Object.keys(reservation));
  }

  editReservation(reservation: Reservation): void {
    // Intentar obtener un ID para la navegación
    const reservationId = reservation.id || (reservation as any).clientId;
    
    // Si tenemos algún ID (original o generado), navegar
    if (reservation && reservationId) {
      console.log(`Navegando a edición con ID: ${reservationId}`);
      
      // Si es un id generado, tendremos que usar otra información para identificar la reserva
      // en el componente de edición
      if (!reservation.id && (reservation as any).clientId) {
        // Guardamos la información de la reserva en sessionStorage para recuperarla en el formulario de edición
        const reservationData = {
          space: reservation.space,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          attendees: reservation.attendees,
          notes: reservation.notes,
          totalPrice: reservation.totalPrice,
          status: reservation.status
        };
        sessionStorage.setItem('editReservationData', JSON.stringify(reservationData));
      }
      
      this.router.navigate(['/reservations/edit', reservationId]);
    } else {
      this.snackBar.open('No se puede editar esta reserva: ID no disponible', 'Cerrar', { duration: 5000 });
      console.error('Error: Intentando editar una reserva sin ID', reservation);
    }
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
