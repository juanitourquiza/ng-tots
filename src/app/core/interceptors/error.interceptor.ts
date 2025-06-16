import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Ignorar los errores para las rutas públicas (espacios) a menos que sean errores críticos
    const isSpacesRequest = request.url.includes('/spaces') && request.method === 'GET';
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        let showSnackbar = true;
        
        if (error.error instanceof ErrorEvent) {
          // Cliente-side error
          errorMessage = `Error: ${error.error.message}`;
        } else if (error.status === 0) {
          // Problema de conectividad o CORS
          errorMessage = `No se pudo conectar con el servidor. Verifique la conexión o posible error de CORS.`;
          console.error('Error de conexión o CORS:', error);
        } else if (error.status === 401) {
          // Manejo específico para errores de autenticación
          // Verificar si es un token expirado
          if (error.error?.message === 'Expired JWT Token') {
            localStorage.removeItem('token'); // Limpiar el token expirado
            
            // Si es una solicitud de espacios, no mostrar mensaje de error
            if (!isSpacesRequest) {
              errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
              this.router.navigate(['/auth/login']);
            } else {
              // Para solicitudes de espacios públicos, simplemente no mostrar error
              showSnackbar = false;
            }
          } else {
            errorMessage = 'No estás autorizado para acceder a este recurso. Por favor inicia sesión.';
          }
        } else {
          // Error del servidor
          errorMessage = `Código: ${error.status}, Mensaje: ${error.error?.message || error.message}`;
        }
        
        // Solo mostrar el mensaje si decidimos mostrar el snackbar
        if (showSnackbar && errorMessage) {
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
        
        return throwError(() => error);
      })
    );
  }
}
