import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        
        if (error.error instanceof ErrorEvent) {
          // Cliente-side error
          errorMessage = `Error: ${error.error.message}`;
        } else if (error.status === 0) {
          // Problema de conectividad o CORS
          errorMessage = `No se pudo conectar con el servidor. Verifique la conexión o posible error de CORS.`;
          console.error('Error de conexión o CORS:', error);
        } else {
          // Error del servidor
          errorMessage = `Código: ${error.status}, Mensaje: ${error.message}`;
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        
        return throwError(() => error);
      })
    );
  }
}
