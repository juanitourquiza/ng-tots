import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

import { ReservationService } from '../../../core/services/reservation.service';
import { SpaceService } from '../../../core/services/space.service';
import { Space } from '../../../core/models/space.model';
import { ReservationRequest } from '../../../core/models/reservation.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    MatCardModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.scss'
})
export class ReservationFormComponent implements OnInit {
  reservationForm!: FormGroup;
  spaceId: number | null = null;
  space: Space | null = null;
  loading = false;
  availabilityChecked = false;
  isAvailable = false;
  minDate = new Date();
  minEndTime: string = '';
  maxAttendees = 1;
  isEditMode = false;
  reservationId: number | null = null;
  
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService,
    private spaceService: SpaceService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.createForm();
    
    // Determinar si estamos en modo edición o creación basado en la URL
    const url = this.router.url;
    this.isEditMode = url.includes('/edit/');
    console.log('Modo de edición:', this.isEditMode);
    
    this.route.paramMap.subscribe(params => {
      if (this.isEditMode) {
        // Estamos editando una reserva existente
        const reservationId = params.get('id');
        console.log('ID de reserva recibido:', reservationId);
        
        if (reservationId && reservationId !== 'null' && reservationId !== 'undefined') {
          this.reservationId = +reservationId;
          console.log('Intentando cargar reserva con ID:', this.reservationId);
          // Primero intentamos cargar desde el backend
          this.loadReservation(this.reservationId);
        } else {
          console.log('No se recibió ID válido, intentando con sessionStorage');
          // Intentar recuperar datos de sessionStorage (para resolver el problema de ID faltante)
          this.tryLoadFromSessionStorage();
        }
      } else {
        // Estamos creando una nueva reserva
        const id = params.get('spaceId');
        console.log('ID de espacio recibido:', id);
        
        if (id) {
          this.spaceId = +id;
          console.log('Space ID configurado:', this.spaceId);
          this.loadSpaceDetails();
          
          // Automáticamente configuramos la reserva con valores predeterminados
          setTimeout(() => {
            this.setupQuickReservation();
          }, 1000); // Damos tiempo para que se carguen los datos del espacio
        }
      }
    });
  }
  
  // Método para configurar rápidamente una reserva con valores predeterminados
  setupQuickReservation(): void {
    // Establecer fecha de hoy
    const today = new Date();
    
    // Redondear al próximo horario en punto o media hora
    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();
    let startHour = currentHours;
    let startMinute = 0;
    
    // Si estamos pasados de la mitad de la hora, pasamos a la siguiente
    if (currentMinutes >= 30) {
      startMinute = 0;
      startHour = (currentHours + 1) % 24;
    } else {
      startMinute = 30;
    }
    
    // Formato de la hora (agregando ceros iniciales si es necesario)
    const startTimeStr = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
    
    // La hora de fin es una hora después
    let endHour = (startHour + 1) % 24;
    const endTimeStr = `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
    
    // Actualizar el formulario
    this.reservationForm.patchValue({
      date: today,
      startTime: startTimeStr,
      endTime: endTimeStr,
      attendees: 1
    });
    
    // Calculamos automáticamente la disponibilidad después de un breve retraso
    // para asegurar que los campos del formulario se actualicen correctamente
    setTimeout(() => {
      this.checkAvailability();
    }, 500);
  }
  
  createForm(): void {
    this.reservationForm = this.formBuilder.group({
      spaceId: [this.spaceId, Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      attendees: [1, [Validators.required, Validators.min(1)]],
      notes: [''],
    });
  }
  
  loadSpaceDetails(): void {
    this.loading = true;
    this.spaceService.getSpaceById(this.spaceId!).subscribe({
      next: (space) => {
        this.space = space;
        this.maxAttendees = space.capacity;
        this.reservationForm.patchValue({
          spaceId: space.id
        });
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open('Error al cargar los detalles del espacio', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }
  
  loadReservation(reservationId: number): void {
    this.loading = true;
    console.log('Cargando reserva con ID:', reservationId);
    // Usamos getReservationById para obtener la reserva del backend
    this.reservationService.getReservationById(reservationId).subscribe({
      next: (reservation: any) => {
        console.log('Reserva cargada:', reservation);
        
        // Guardar el ID del espacio para cargar sus detalles
        this.spaceId = reservation.space?.id;
        if (this.spaceId) {
          console.log('Cargando detalles del espacio ID:', this.spaceId);
          this.loadSpaceDetails();
        } else {
          console.warn('La reserva no tiene un espacio asociado con ID válido');
        }
        
        // Extraer fecha y horas de las fechas ISO
        const startDate = new Date(reservation.startTime);
        const endDate = new Date(reservation.endTime);
        
        // Formatear la hora en formato HH:MM
        const startHour = this.formatTime(startDate.getHours(), startDate.getMinutes());
        const endHour = this.formatTime(endDate.getHours(), endDate.getMinutes());
        
        console.log('Fechas extraídas - Inicio:', startDate, 'Fin:', endDate);
        console.log('Horas formateadas - Inicio:', startHour, 'Fin:', endHour);
        
        // Activar el modo de edición
        this.availabilityChecked = true;
        this.isAvailable = true;
        
        // Actualizar el formulario con los datos de la reserva
        this.reservationForm.patchValue({
          date: startDate,
          startTime: startHour,
          endTime: endHour,
          attendees: reservation.attendees || 1,
          notes: reservation.notes || '',
          spaceId: this.spaceId
        });
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar la reserva:', error);
        this.snackBar.open('Error al cargar la reserva', 'Cerrar', { duration: 5000 });
        this.loading = false;
        
        // Si falla la carga, intentar recuperar de sessionStorage
        this.tryLoadFromSessionStorage();
      }
    });
  }
  
  tryLoadFromSessionStorage(): void {
    const reservationData = sessionStorage.getItem('editReservationData');
    console.log('Intentando cargar datos desde sessionStorage');
    
    if (reservationData) {
      try {
        const reservation = JSON.parse(reservationData);
        console.log('Datos de reserva recuperados de sessionStorage:', reservation);
        
        // Mostrar mensaje informativo al usuario
        this.snackBar.open('Cargando datos de reserva en modo temporal', 'Entendido', { duration: 5000 });
        
        // Guardar el ID del espacio para cargar sus detalles
        this.spaceId = reservation.space?.id;
        if (this.spaceId) {
          console.log('Cargando detalles del espacio ID:', this.spaceId);
          this.loadSpaceDetails();
        } else {
          console.warn('No se encontró ID de espacio válido en los datos temporales');
          this.loading = false;
          return;
        }
        
        // Extraer fecha y horas de las fechas ISO
        const startDate = new Date(reservation.startTime);
        const endDate = new Date(reservation.endTime);
        
        // Formatear la hora en formato HH:MM
        const startHour = this.formatTime(startDate.getHours(), startDate.getMinutes());
        const endHour = this.formatTime(endDate.getHours(), endDate.getMinutes());
        
        console.log('Datos recuperados - Inicio:', startDate, startHour, 'Fin:', endDate, endHour);
        
        // Activar el modo de edición
        this.availabilityChecked = true;
        this.isAvailable = true;
        
        // Actualizar el formulario con los datos de la reserva
        this.reservationForm.patchValue({
          date: startDate,
          startTime: startHour,
          endTime: endHour,
          attendees: reservation.attendees || 1,
          notes: reservation.notes || '',
          spaceId: this.spaceId
        });
        
        // Limpiar sessionStorage después de usarlo
        sessionStorage.removeItem('editReservationData');
      } catch (e) {
        console.error('Error al procesar datos de sessionStorage:', e);
      }
    } else {
      console.log('No se encontraron datos de reserva en sessionStorage');
      this.router.navigate(['/reservations']);
      this.snackBar.open('No se pudo cargar la información de la reserva', 'Cerrar', { duration: 5000 });
    }
  }
  
  formatTime(hours: number, minutes: number): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  checkAvailability(): void {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      return;
    }
    
    const date = this.reservationForm.get('date')?.value;
    const startTime = this.reservationForm.get('startTime')?.value;
    const endTime = this.reservationForm.get('endTime')?.value;
    
    if (!date || !startTime || !endTime || !this.spaceId) {
      this.snackBar.open('Por favor, complete todos los campos requeridos', 'Cerrar', { duration: 5000 });
      return;
    }
    
    // Crear objetos de fecha con hora
    const startDate = new Date(date);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    startDate.setHours(startHour, startMinute, 0);
    
    const endDate = new Date(date);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    endDate.setHours(endHour, endMinute, 0);
    
    // Validar que la hora de fin sea posterior a la de inicio
    if (endDate <= startDate) {
      this.snackBar.open('La hora de finalización debe ser posterior a la hora de inicio', 'Cerrar', { duration: 5000 });
      return;
    }
    
    this.loading = true;
    this.spaceService.getAvailability(this.spaceId, startDate, endDate).subscribe({
      next: (response) => {
        console.log('Respuesta de disponibilidad:', response);
        this.availabilityChecked = true;
        // Corregido para usar isAvailable en lugar de available
        this.isAvailable = response.isAvailable;
        if (!response.isAvailable) {
          this.snackBar.open('❌ El espacio no está disponible para el horario seleccionado', 'Cerrar', { duration: 5000 });
        } else {
          this.snackBar.open('✅ Espacio disponible! Puedes confirmar la reserva.', 'Cerrar', { duration: 5000 });
        }
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(error?.message || 'Error al verificar la disponibilidad', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }
  
  onDateChange(): void {
    // Reset availability when date changes
    this.availabilityChecked = false;
    this.isAvailable = false;
  }
  
  onTimeChange(): void {
    // Reset availability when time changes
    this.availabilityChecked = false;
    this.isAvailable = false;
    
    // Update min end time
    const startTime = this.reservationForm.get('startTime')?.value;
    if (startTime) {
      this.minEndTime = startTime;
    }
  }
  
  onSubmit(): void {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 5000 });
      return;
    }
    
    // Si no estamos en modo edición, verificar disponibilidad
    if (!this.isEditMode && (!this.availabilityChecked || !this.isAvailable)) {
      if (!this.availabilityChecked) {
        this.snackBar.open('Primero debe verificar la disponibilidad', 'Cerrar', { duration: 5000 });
        return;
      }
      if (!this.isAvailable) {
        this.snackBar.open('El espacio no está disponible en el horario seleccionado', 'Cerrar', { duration: 5000 });
        return;
      }
    }
    
    const formValue = this.reservationForm.value;
    const date = formValue.date;
    
    // Crear objetos de fecha con hora
    const startDate = new Date(date);
    const [startHour, startMinute] = formValue.startTime.split(':').map(Number);
    startDate.setHours(startHour, startMinute, 0);
    
    const endDate = new Date(date);
    const [endHour, endMinute] = formValue.endTime.split(':').map(Number);
    endDate.setHours(endHour, endMinute, 0);
    
    const reservationRequest: ReservationRequest = {
      spaceId: formValue.spaceId,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      attendees: formValue.attendees,
      notes: formValue.notes
    };
    
    this.loading = true;
    
    if (this.isEditMode && this.reservationId) {
      // Actualizar una reserva existente
      this.reservationService.updateReservation(this.reservationId, reservationRequest).subscribe({
      next: (reservation) => {
        this.snackBar.open('Reserva actualizada correctamente', 'Cerrar', { duration: 5000 });
        this.router.navigate(['/reservations']);
      },
      error: (error) => {
        console.error('Error al actualizar la reserva:', error);
        this.snackBar.open(error?.message || 'Error al actualizar la reserva', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
    } else {
      // Crear una nueva reserva
      this.reservationService.createReservation(reservationRequest).subscribe({
        next: (reservation) => {
          console.log('Reserva creada con éxito:', reservation);
          
          if (reservation && reservation.id) {
            console.log('ID asignado por el backend:', reservation.id);
            
            // Limpiar cualquier dato temporal en sessionStorage
            sessionStorage.removeItem('editReservationData');
            
            // Guardar la reserva completa con su ID en sessionStorage para referencia
            // Esto ayuda a manejar el flujo de navegación y garantizar que siempre tengamos el ID
            sessionStorage.setItem('lastCreatedReservation', JSON.stringify(reservation));
            
            // Guardar una bandera para forzar la recarga de reservas al llegar a la lista
            sessionStorage.setItem('forceReloadReservations', 'true');
            
            this.snackBar.open('Reserva creada correctamente con ID: ' + reservation.id, 'Cerrar', { duration: 5000 });
          } else {
            console.warn('La reserva fue creada pero sin ID asignado por el backend');
            this.snackBar.open('Reserva creada, pero podría haber problemas para editarla o cancelarla.', 'Cerrar', { duration: 5000 });
          }
          
          // Redirigir a la lista de reservas y forzar una recarga completa
          this.router.navigate(['/reservations'], { skipLocationChange: false }).then(() => {
            console.log('Navegación completada, se debería recargar la lista de reservas');
          });
        },
        error: (error) => {
          console.error('Error al crear la reserva:', error);
          this.snackBar.open(error?.error?.message || error?.message || 'Error al crear la reserva', 'Cerrar', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }
  
  get totalPrice(): number {
    if (!this.space) return 0;
    
    const startTime = this.reservationForm.get('startTime')?.value;
    const endTime = this.reservationForm.get('endTime')?.value;
    
    if (!startTime || !endTime) return 0;
    
    // Calcular la duración en horas
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationHours = (endMinutes - startMinutes) / 60;
    
    if (durationHours <= 0) return 0;
    
    return this.space.price * durationHours;
  }
}
