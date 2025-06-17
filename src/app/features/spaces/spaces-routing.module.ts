import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpaceListComponent } from './space-list/space-list.component';
import { SpaceDetailComponent } from './space-detail/space-detail.component';
import { SpaceAdminComponent } from './space-admin/space-admin.component';

const routes: Routes = [
  { path: '', component: SpaceListComponent },
  // Mantenemos solo las rutas para ver detalles
  { path: 'view/:id', component: SpaceDetailComponent },
  { path: ':id', component: SpaceDetailComponent }
  // Las rutas de edición y creación se manejan en el módulo admin
  // La ruta /admin/spaces se encarga de la gestión completa
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpacesRoutingModule { }
