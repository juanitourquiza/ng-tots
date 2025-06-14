import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Modelos y servicios
import { Reservation } from '../../../core/models/reservation.model';
import { ReservationService } from '../../../core/services/reservation.service';

// Módulo centralizado de Material y componentes compartidos
import { MaterialModule } from '../../../shared/material.module';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reservations-admin',
  templateUrl: './reservations-admin.component.html',
  styleUrls: ['./reservations-admin.component.scss'],
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
export class ReservationsAdminComponent implements OnInit {
  displayedColumns: string[] = ['id', 'space', 'user', 'startTime', 'endTime', 'attendees', 'status', 'actions'];
  dataSource!: MatTableDataSource<Reservation>;
  loading = false;
  statusFilter = new FormControl('');
  
  statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'completed', label: 'Completada' }
  ];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadReservations();
    
    // Aplicar filtro cuando cambia el estado seleccionado
    this.statusFilter.valueChanges.subscribe(value => {
      this.applyStatusFilter(value || '');
    });
  }
  
  loadReservations(): void {
    this.loading = true;
    this.reservationService.getReservations().subscribe({
      next: (reservations: Reservation[]) => {
        this.dataSource = new MatTableDataSource(reservations);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        
        // Personalizar la función de filtrado
        this.dataSource.filterPredicate = (data: Reservation, filter: string) => {
          const searchFilter = filter.toLowerCase();
          
          // Función de ayuda para búsqueda segura
          const safeSearch = (value: string | undefined | null): boolean => {
            return value ? value.toLowerCase().includes(searchFilter) : false;
          };
          
          // Comprobación explícita para evitar errores de TypeScript
          return safeSearch(data.user?.firstName) || 
                 safeSearch(data.user?.lastName) || 
                 safeSearch(data.user?.email) || 
                 safeSearch(data.space?.name) || 
                 safeSearch(data.space?.location) || 
                 false; // Fallback si alguna propiedad es undefined
        };
        
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error al cargar las reservas', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }
  
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  applyStatusFilter(status: string): void {
    if (!this.dataSource) return;
    
    // Si no hay filtro de estado, quitar el filtrado
    if (!status) {
      this.dataSource.data = this.dataSource.data;
      return;
    }
    
    // Aplicar filtro de estado
    this.dataSource.data = this.dataSource.data.filter(reservation => reservation.status === status);
  }
  
  cancelReservation(reservationId: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.reservationService.cancelReservation(reservationId).subscribe({
        next: () => {
          this.snackBar.open('Reserva cancelada correctamente', 'Cerrar', { duration: 5000 });
          this.loadReservations(); // Recargar la lista
        },
        error: (error: any) => {
          let errorMessage = 'Error al cancelar la reserva';
          if (error.status === 400 && error.error?.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        }
      });
    }
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'confirmed';
      case 'pending': return 'pending';
      case 'cancelled': return 'cancelled';
      case 'completed': return 'completed';
      default: return '';
    }
  }
  
  getStatusLabel(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return status;
    }
  }
}
