import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SpacesAdminComponent } from './spaces-admin/spaces-admin.component';
import { SpaceFormComponent } from './spaces-admin/space-form/space-form.component';
import { ReservationsAdminComponent } from './reservations-admin/reservations-admin.component';
import { CalendarAdminComponent } from './calendar-admin/calendar-admin.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      { path: '', redirectTo: 'spaces', pathMatch: 'full' },
      { path: 'spaces', component: SpacesAdminComponent },
      { path: 'spaces/new', component: SpaceFormComponent },
      { path: 'spaces/edit/:id', component: SpaceFormComponent },
      { path: 'reservations', component: ReservationsAdminComponent },
      { path: 'calendar', component: CalendarAdminComponent },
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSlideToggleModule,
    AdminDashboardComponent,
    SpacesAdminComponent,
    SpaceFormComponent,
    ReservationsAdminComponent,
    CalendarAdminComponent,
    ConfirmDialogComponent,
    RouterModule.forChild(routes)
  ]
})
export class AdminModule { }
