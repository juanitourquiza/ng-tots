import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SpaceService } from '../../../core/services/space.service';
import { AuthService } from '../../../core/services/auth.service';
import { Space } from '../../../core/models/space.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-space-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './space-detail.component.html',
  styleUrl: './space-detail.component.scss'
})
export class SpaceDetailComponent implements OnInit {
  space: Space | null = null;
  loading = false;
  error = '';
  spaceId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spaceService: SpaceService,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Parámetro ID recibido:', id);
      
      // Validar que el ID es un número válido
      if (id && !isNaN(Number(id))) {
        this.spaceId = Number(id);
        console.log('ID convertido a número:', this.spaceId);
        this.loadSpaceDetails();
      } else {
        console.error('ID inválido recibido:', id);
        this.error = 'ID de espacio inválido';
        this.snackBar.open('ID de espacio inválido', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/spaces']);
      }
    });
  }

  loadSpaceDetails(): void {
    this.loading = true;
    this.error = '';
    
    this.spaceService.getSpaceById(this.spaceId).subscribe({
      next: (space) => {
        if (space) {
          this.space = space;
          this.loading = false;
          console.log('Espacio cargado correctamente:', space);
        } else {
          this.error = 'No se encontró el espacio';
          this.loading = false;
          this.snackBar.open(this.error, 'Cerrar', { duration: 5000 });
        }
      },
      error: (err) => {
        console.error('Error al cargar espacio:', err);
        this.error = 'No se pudo cargar los detalles del espacio';
        this.loading = false;
        this.snackBar.open(this.error, 'Cerrar', { duration: 5000 });
      }
    });
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  goBack(): void {
    this.router.navigate(['/spaces']);
  }
}
