import { Routes } from '@angular/router';
import { SpacesAdminComponent } from './spaces-admin/spaces-admin.component';
import { SpaceFormComponent } from './spaces-admin/space-form/space-form.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'spaces',
    component: SpacesAdminComponent
  },
  {
    path: 'spaces/new',
    component: SpaceFormComponent
  },
  {
    path: 'spaces/edit/:id',
    component: SpaceFormComponent
  }
];
