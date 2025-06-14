import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Solo aplicamos reintentos a peticiones GET, ya que son idempotentes
    if (request.method === 'GET') {
      return next.handle(request).pipe(
        retry({ count: 2, delay: 1000 }), // Reintenta hasta 2 veces con 1 segundo entre intentos
        catchError((error: HttpErrorResponse) => {
          console.error('Error después de reintentos:', error);
          return throwError(() => error);
        })
      );
    }
    
    // Para otras peticiones no aplicamos reintentos
    return next.handle(request);
  }
}
