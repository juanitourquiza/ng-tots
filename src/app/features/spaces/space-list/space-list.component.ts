import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { SpaceService } from '../../../core/services/space.service';
import { AuthService } from '../../../core/services/auth.service';
import { Space } from '../../../core/models/space.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-space-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatChipsModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './space-list.component.html',
  styleUrl: './space-list.component.scss'
})
export class SpaceListComponent implements OnInit {
  spaces: Space[] = [];
  loading = false;
  error = '';
  
  constructor(
    private spaceService: SpaceService,
    private snackBar: MatSnackBar,
    public authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadSpaces();
  }
  
  loadSpaces(): void {
    this.loading = true;
    this.spaceService.getSpaces().subscribe({
      next: (spaces) => {
        console.log('Datos de espacios recibidos:', spaces);
        if (spaces && spaces.length > 0) {
          console.log('Primer espacio:', spaces[0]);
          console.log('Tipo de ID del primer espacio:', typeof spaces[0].id);
        }
        this.spaces = spaces;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar espacios:', error);
        this.error = error?.message || 'Error al cargar los espacios';
        this.loading = false;
        this.snackBar.open(this.error, 'Cerrar', {
          duration: 5000
        });
      }
    });
  }
  
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  
  viewDetails(space: Space): void {
    console.log('Intentando ver detalles del espacio:', space);
    console.log('ID del espacio:', space?.id);
    console.log('Tipo de dato del ID:', typeof space?.id);
    
    if (space && space.id !== undefined && space.id !== null) {
      console.log(`Navegando a detalles del espacio: ${space.id}`);
      this.router.navigate(['/spaces', space.id.toString()]);
    } else {
      console.error('No se encontró el ID del espacio o es inválido');
      this.snackBar.open('No se pudo navegar a los detalles del espacio', 'Cerrar', {
        duration: 3000
      });
    }
  }
  
  reserve(space: Space): void {
    console.log('Espacio a reservar:', space);
    console.log('Tipo de ID:', typeof space?.id, 'Valor:', space?.id);
    
    try {
      if (space && space.id !== undefined && space.id !== null) {
        const spaceId = space.id.toString();
        console.log(`Navegando a reserva del espacio: ${spaceId}`);
        this.router.navigateByUrl(`/reservations/new/${spaceId}`);
      } else {
        throw new Error('ID de espacio no válido');
      }
    } catch (err) {
      console.error('Error al navegar a reserva:', err);
      this.snackBar.open('No se pudo crear la reserva', 'Cerrar', {
        duration: 3000
      });
    }
  }
  
  editSpace(space: Space): void {
    console.log('Espacio a editar:', space);
    console.log('Tipo de ID:', typeof space?.id, 'Valor:', space?.id);
    
    try {
      if (space && space.id !== undefined && space.id !== null) {
        const spaceId = space.id.toString();
        console.log(`Navegando a edición del espacio: ${spaceId}`);
        this.router.navigateByUrl(`/spaces/edit/${spaceId}`);
      } else {
        throw new Error('ID de espacio no válido');
      }
    } catch (err) {
      console.error('Error al navegar a edición:', err);
      this.snackBar.open('No se pudo editar el espacio', 'Cerrar', {
        duration: 3000
      });
    }
  }
}
