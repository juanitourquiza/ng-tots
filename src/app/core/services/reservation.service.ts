import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Reservation, ReservationRequest } from '../models/reservation.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private readonly API_URL = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) { }

  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.API_URL);
  }

  getUserReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.API_URL);
  }
  
  getUpcomingReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.API_URL}/upcoming`);
  }

  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.API_URL}/${id}`);
  }

  createReservation(reservation: ReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(this.API_URL, reservation);
  }

  updateReservation(id: number, reservation: Reservation): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.API_URL}/${id}`, reservation);
  }

  cancelReservation(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/cancel`, {});
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getSpaceReservations(spaceId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${environment.apiUrl}/spaces/${spaceId}/reservations`);
  }

  checkAvailability(spaceId: number, startDate: Date, endDate: Date): Observable<any> {
    const params = new HttpParams()
      .set('startTime', startDate.toISOString())
      .set('endTime', endDate.toISOString());
    return this.http.get<any>(`${environment.apiUrl}/spaces/${spaceId}/availability`, { params });
  }
  
  getCalendar(startDate: Date, endDate: Date): Observable<Reservation[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    return this.http.get<Reservation[]>(`${this.API_URL}/calendar`, { params });
  }
}
