import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-container">
      <mat-card>
        <mat-card-header>
          <mat-icon color="warn" class="header-icon">security</mat-icon>
          <mat-card-title>Acceso no autorizado</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>No tienes permisos suficientes para acceder a esta sección.</p>
          <p>Si consideras que deberías tener acceso, contacta con el administrador del sistema.</p>
        </mat-card-content>
        <mat-card-actions align="end">
          <button mat-raised-button color="primary" (click)="navigateToHome()">Volver al inicio</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }
    
    mat-card {
      max-width: 500px;
      width: 100%;
    }
    
    mat-card-header {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
    }
    
    .header-icon {
      font-size: 40px;
      height: 40px;
      width: 40px;
      margin-right: 16px;
    }
    
    mat-card-content {
      margin-bottom: 20px;
      font-size: 16px;
      line-height: 1.5;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}
  
  navigateToHome() {
    this.router.navigate(['/spaces']);
  }
}
