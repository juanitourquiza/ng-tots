import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

// Modelos y servicios
import { Space } from '../../../core/models/space.model';
import { SpaceService } from '../../../core/services/space.service';

// Módulo centralizado de Material e importaciones compartidas
import { MaterialModule } from '../../../shared/material.module';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-spaces-admin',
  templateUrl: './spaces-admin.component.html',
  styleUrls: ['./spaces-admin.component.scss'],
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
export class SpacesAdminComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'capacity', 'price', 'location', 'isActive', 'actions'];
  dataSource!: MatTableDataSource<Space>;
  loading = false;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  constructor(
    private spaceService: SpaceService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}
  
  ngOnInit(): void {
    this.loadSpaces();
  }
  
  loadSpaces(): void {
    this.loading = true;
    this.spaceService.getSpaces().subscribe({
      next: (spaces: Space[]) => {
        this.dataSource = new MatTableDataSource(spaces);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
      },
      error: (error: any) => {
        this.snackBar.open('Error al cargar los espacios', 'Cerrar', { duration: 5000 });
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
  
  createSpace(): void {
    this.router.navigate(['/admin/spaces/new']);
  }
  
  editSpace(spaceId: number): void {
    this.router.navigate(['/admin/spaces/edit', spaceId]);
  }
  
  toggleSpaceStatus(space: Space): void {
    const updatedSpace = { ...space, isActive: !space.isActive };
    
    this.spaceService.updateSpace(space.id, updatedSpace).subscribe({
      next: () => {
        this.snackBar.open(`Espacio ${updatedSpace.isActive ? 'activado' : 'desactivado'} correctamente`, 'Cerrar', { duration: 5000 });
        this.loadSpaces(); // Recargar la lista
      },
      error: (error: any) => {
        this.snackBar.open('Error al actualizar el estado del espacio', 'Cerrar', { duration: 5000 });
      }
    });
  }
  
  deleteSpace(spaceId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmar eliminación',
        message: '¿Estás seguro de que deseas eliminar este espacio? Esta acción no se puede deshacer.',
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.spaceService.deleteSpace(spaceId).subscribe({
          next: () => {
            this.snackBar.open('Espacio eliminado correctamente', 'Cerrar', { duration: 5000 });
            this.loadSpaces(); // Recargar la lista
          },
          error: (error: any) => {
            let errorMessage = 'Error al eliminar el espacio';
            if (error.status === 400 && error.error?.message) {
              errorMessage = error.error.message;
            }
            this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }
}
