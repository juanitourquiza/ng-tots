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
    
    this.route.paramMap.subscribe(params => {
      // Obtenemos el ID del espacio del parámetro de la ruta
      const id = params.get('spaceId');
      console.log('Parámetro recibido:', id);
      
      if (id) {
        this.spaceId = +id;
        console.log('Space ID configurado:', this.spaceId);
        this.loadSpaceDetails();
        
        // Automáticamente configuramos la reserva con valores predeterminados
        setTimeout(() => {
          this.setupQuickReservation();
        }, 1000); // Damos tiempo para que se carguen los datos del espacio
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
    if (!this.spaceId) return;
    
    this.loading = true;
    this.spaceService.getSpaceById(this.spaceId).subscribe({
      next: (space) => {
        this.space = space;
        this.maxAttendees = space.capacity;
        this.reservationForm.patchValue({
          spaceId: space.id
        });
        this.reservationForm.get('attendees')?.setValidators([Validators.required, Validators.min(1), Validators.max(space.capacity)]);
        this.loading = false;
      },
      error: (error) => {
        this.snackBar.open(error?.message || 'Error al cargar los detalles del espacio', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
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
        this.availabilityChecked = true;
        this.isAvailable = response.available;
        if (!response.available) {
          this.snackBar.open(response.message || 'El espacio no está disponible en el horario seleccionado', 'Cerrar', { duration: 5000 });
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
    if (this.reservationForm.invalid || !this.availabilityChecked || !this.isAvailable) {
      if (!this.availabilityChecked) {
        this.snackBar.open('Primero debe verificar la disponibilidad', 'Cerrar', { duration: 5000 });
        return;
      }
      if (!this.isAvailable) {
        this.snackBar.open('El espacio no está disponible en el horario seleccionado', 'Cerrar', { duration: 5000 });
        return;
      }
      this.reservationForm.markAllAsTouched();
      return;
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
    this.reservationService.createReservation(reservationRequest).subscribe({
      next: (reservation) => {
        this.snackBar.open('Reserva creada correctamente', 'Cerrar', { duration: 5000 });
        this.router.navigate(['/reservations']);
      },
      error: (error) => {
        this.snackBar.open(error?.message || 'Error al crear la reserva', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
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
