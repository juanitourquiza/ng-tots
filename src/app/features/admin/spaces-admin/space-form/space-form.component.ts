import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SpaceService } from '../../../../core/services/space.service';
import { Space } from '../../../../core/models/space.model';
import { MaterialModule } from '../../../../shared/material.module';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-space-form',
  templateUrl: './space-form.component.html',
  styleUrls: ['./space-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    LoadingSpinnerComponent
  ]
})
export class SpaceFormComponent implements OnInit {
  spaceForm!: FormGroup;
  isEditMode = false;
  loading = false;
  spaceId: number | null = null;
  
  constructor(
    private fb: FormBuilder,
    private spaceService: SpaceService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    
    // Verificar si estamos en modo edición
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.isEditMode = true;
        this.spaceId = +id;
        this.loadSpaceData(+id);
      }
    });
  }
  
  private initForm(): void {
    this.spaceForm = this.fb.group({
      name: ['', [Validators.required]],
      capacity: ['', [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required, Validators.min(0)]],
      location: ['', [Validators.required]],
      imageUrl: [''],
      isActive: [true]
    });
  }
  
  private loadSpaceData(id: number): void {
    this.loading = true;
    this.spaceService.getSpaceById(id).subscribe({
      next: (space) => {
        this.spaceForm.patchValue({
          name: space.name,
          capacity: space.capacity,
          price: space.price,
          location: space.location,
          imageUrl: space.imageUrl || '',
          isActive: space.isActive !== undefined ? space.isActive : true
        });
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar los datos del espacio', 'Cerrar', { duration: 5000 });
        this.loading = false;
        this.router.navigate(['/admin/spaces']);
      }
    });
  }
  
  onSubmit(): void {
    if (this.spaceForm.invalid) {
      this.markFormGroupTouched(this.spaceForm);
      return;
    }
    
    const spaceData: Space = this.spaceForm.value;
    
    // Si es un nuevo espacio, garantizar que se cree como activo
    if (!this.isEditMode) {
      spaceData.isActive = true;
    }
    this.loading = true;
    
    if (this.isEditMode && this.spaceId) {
      // Actualizar espacio existente
      this.spaceService.updateSpace(this.spaceId, spaceData).subscribe({
        next: () => {
          this.snackBar.open('Espacio actualizado correctamente', 'Cerrar', { duration: 5000 });
          this.loading = false;
          this.router.navigate(['/admin/spaces']);
        },
        error: (error) => {
          let errorMessage = 'Error al actualizar el espacio';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
          this.loading = false;
        }
      });
    } else {
      // Crear nuevo espacio
      this.spaceService.createSpace(spaceData).subscribe({
        next: () => {
          this.snackBar.open('Espacio creado correctamente', 'Cerrar', { duration: 5000 });
          this.loading = false;
          this.router.navigate(['/admin/spaces']);
        },
        error: (error) => {
          let errorMessage = 'Error al crear el espacio';
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
          this.loading = false;
        }
      });
    }
  }
  
  // Función auxiliar para marcar todos los campos como touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/admin/spaces']);
  }
}
