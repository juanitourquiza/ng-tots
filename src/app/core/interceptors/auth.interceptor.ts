import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor() {}
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Verificar si la solicitud es a nuestra API
    if (request.url.includes(environment.apiUrl)) {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Clonar la solicitud original para agregarle el token de autenticación
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
          // Quitamos withCredentials para evitar problemas de CORS
        });
        
        // Log para depuración solo si estamos en modo desarrollo
        console.log(`🔒 Autorizando solicitud a: ${request.url}`);
      } else {
        console.warn(`⚠️ Sin token para: ${request.url}`);
      }
    }
    
    return next.handle(request);
  }
}
