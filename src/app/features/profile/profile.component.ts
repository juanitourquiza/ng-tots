import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

// Modelos y servicios
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

// Módulo centralizado de Material y componentes compartidos
import { MaterialModule } from '../../shared/material.module';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    // Angular Core
    CommonModule,
    NgIf,
    
    // Material y Forms
    MaterialModule,
    
    // Componentes compartidos
    LoadingSpinnerComponent
  ]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user: User | null = null;
  loading = false;
  changePassword = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.createForm();
    this.loadUserData();
  }
  
  createForm(): void {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
  }
  
  loadUserData(): void {
    this.loading = true;
    this.authService.getUserProfile().subscribe({
      next: (user: User) => {
        this.user = user;
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        });
        this.profileForm.get('email')?.disable(); // Email no modificable
        this.loading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Error al cargar los datos del perfil', 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }
  
  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    
    const formValues = this.profileForm.value;
    
    // Validación de contraseña
    if (this.changePassword) {
      if (!formValues.currentPassword) {
        this.profileForm.get('currentPassword')?.setErrors({ required: true });
        return;
      }
      
      if (!formValues.newPassword) {
        this.profileForm.get('newPassword')?.setErrors({ required: true });
        return;
      }
      
      if (formValues.newPassword !== formValues.confirmPassword) {
        this.profileForm.get('confirmPassword')?.setErrors({ mismatch: true });
        return;
      }
    }
    
    // Preparar datos para actualizar
    const updateData = {
      firstName: formValues.firstName,
      lastName: formValues.lastName
    };
    
    const passwordData = this.changePassword ? {
      currentPassword: formValues.currentPassword,
      newPassword: formValues.newPassword
    } : null;
    
    this.loading = true;
    this.authService.updateUserProfile(updateData, passwordData).subscribe({
      next: () => {
        this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', { duration: 5000 });
        if (this.changePassword) {
          this.profileForm.patchValue({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          this.changePassword = false;
        }
        this.loading = false;
      },
      error: (error: any) => {
        let errorMessage = 'Error al actualizar el perfil';
        if (error.status === 400 && error.error?.message) {
          errorMessage = error.error.message;
        }
        this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
        this.loading = false;
      }
    });
  }
  
  toggleChangePassword(): void {
    this.changePassword = !this.changePassword;
    if (!this.changePassword) {
      this.profileForm.patchValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }
}
