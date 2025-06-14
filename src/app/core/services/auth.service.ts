import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Cambiamos la base URL para que coincida con lo que espera el backend
  private readonly API_URL = `${environment.apiUrl}`;
  private jwtHelper = new JwtHelperService();
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const token = localStorage.getItem('token');
    let user: User | null = null;
    
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      user = {
        id: decodedToken.userId,
        email: decodedToken.email,
        roles: decodedToken.roles,
        token
      };
    }
    
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Usamos la ruta correcta según la configuración del backend (json_login -> check_path)
    return this.http.post<AuthResponse>(`${this.API_URL}/login_check`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          
          // Crear el objeto user si viene solo el token (esto depende del formato de respuesta del backend)
          let user = response.user;
          if (!user && response.token) {
            const decodedToken = this.jwtHelper.decodeToken(response.token);
            user = {
              id: decodedToken.userId || decodedToken.id,
              email: decodedToken.username || decodedToken.email,
              roles: decodedToken.roles || [],
              token: response.token
            };
          }
          
          this.currentUserSubject.next(user);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!(token && !this.jwtHelper.isTokenExpired(token));
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.roles?.includes(role) || false;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  getUserProfile(): Observable<User> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    // La ruta correcta para el perfil de usuario
    return this.http.get<User>(`${this.API_URL}/users/profile`)
      .pipe(
        tap(user => {
          // Actualiza la información del usuario manteniendo el token
          const token = this.currentUserValue?.token || '';
          const updatedUser = { ...user, token };
          this.currentUserSubject.next(updatedUser);
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  updateUserProfile(
    profileData: { firstName: string; lastName: string },
    passwordData?: { currentPassword: string; newPassword: string } | null
  ): Observable<User> {
    if (!this.isAuthenticated()) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const data = { ...profileData };
    if (passwordData) {
      Object.assign(data, passwordData);
    }
    
    return this.http.put<User>(`${this.API_URL}/profile`, data)
      .pipe(
        tap(user => {
          // Actualiza la información del usuario manteniendo el token y roles
          const token = this.currentUserValue?.token || '';
          const roles = this.currentUserValue?.roles || [];
          const updatedUser = { ...user, token, roles };
          this.currentUserSubject.next(updatedUser);
        }),
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
}
