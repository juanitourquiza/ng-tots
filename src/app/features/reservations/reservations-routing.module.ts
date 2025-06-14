import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationListComponent } from './reservation-list/reservation-list.component';
import { ReservationFormComponent } from './reservation-form/reservation-form.component';
import { ReservationCalendarComponent } from './reservation-calendar/reservation-calendar.component';

const routes: Routes = [
  { path: '', component: ReservationListComponent },
  { path: 'new', component: ReservationFormComponent },
  { path: 'new/:spaceId', component: ReservationFormComponent },
  { path: ':id', component: ReservationListComponent },
  { path: 'edit/:id', component: ReservationFormComponent },
  { path: 'calendar', component: ReservationCalendarComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationsRoutingModule { }
