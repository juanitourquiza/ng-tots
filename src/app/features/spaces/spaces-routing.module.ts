import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpaceListComponent } from './space-list/space-list.component';
import { SpaceDetailComponent } from './space-detail/space-detail.component';
import { SpaceAdminComponent } from './space-admin/space-admin.component';

const routes: Routes = [
  { path: '', component: SpaceListComponent },
  { path: 'admin', component: SpaceAdminComponent },
  // Agregamos una ruta específica para view para asegurarnos que funciona
  { path: 'view/:id', component: SpaceDetailComponent },
  // Mantenemos la ruta dinámica para compatibilidad
  { path: ':id', component: SpaceDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpacesRoutingModule { }
