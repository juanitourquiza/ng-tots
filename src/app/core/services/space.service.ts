import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Space, SpaceFilter, SpaceAvailability } from '../models/space.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpaceService {
  private readonly API_URL = `${environment.apiUrl}/spaces`;

  constructor(private http: HttpClient) {}

  /**
   * Método para parsear adecuadamente el valor isActive desde diferentes formatos
   * @param value El valor original del backend (puede ser boolean, number, string, etc)
   * @returns boolean - true si se considera activo, false si no
   */
  private parseIsActive(value: any): boolean {
    console.log('Parseando isActive:', value, 'tipo:', typeof value);
    
    // Si es un string, analizamos posibles valores
    if (typeof value === 'string') {
      const lowercaseValue = value.toLowerCase();
      if (lowercaseValue === 'true' || lowercaseValue === '1') return true;
      if (lowercaseValue === 'false' || lowercaseValue === '0') return false;
      // Intentar convertir a número
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        return numValue === 1;
      }
    }
    
    // Para valores booleanos y numéricos
    if (value === true || value === 1) return true;
    
    // Si no coincide con ningún caso activo, consideramos falso
    return false;
  }

  // Método específico para el panel de administración - obtiene TODOS los espacios
  getAllSpacesForAdmin(): Observable<Space[]> {
    return this.http.get(`${this.API_URL}/admin`, {
      observe: 'response'
    }).pipe(
      map(response => {
        // Depuración extendida para identificar el problema
        console.log('[ADMIN] Respuesta del API completa:', response);
        console.log('[ADMIN] Tipo de respuesta.body:', typeof response.body);
        
        // Mostrar los datos crudos
        if (Array.isArray(response.body)) {
          console.log('[ADMIN] Primer espacio (raw):', JSON.stringify(response.body[0], null, 2));
        } else if (response.body && typeof response.body === 'object') {
          const dataArray = (response.body as any)?.['hydra:member'] || (response.body as any)?.spaces || (response.body as any)?.items || [];
          if (dataArray.length > 0) {
            console.log('[ADMIN] Primer espacio (raw):', JSON.stringify(dataArray[0], null, 2));
          }
        }
        
        // Obtener los datos del body (puede ser un array o estar dentro de alguna propiedad)
        const data: any = response.body;
        let spaces = Array.isArray(data) ? data : ((data as any)?.items || (data as any)?.spaces || (data as any)?.['hydra:member'] || []);
        
        console.log('[ADMIN] Espacios antes de procesar:', spaces);
        
        // Mapear cada espacio para asegurarnos que tenga ID
        return spaces.map((rawSpace: any) => {
          // Buscar el ID en diferentes posibles propiedades
          let spaceId = rawSpace.id || rawSpace._id || rawSpace['@id'] || rawSpace.spaceId;
          
          // Si el ID es una URL, extraer el número
          if (typeof spaceId === 'string' && spaceId.includes('/')) {
            const parts = spaceId.split('/');
            spaceId = parts[parts.length - 1]; // Última parte de la URL
          }
          
          // Crear objeto Space compatible
          const space: Space = {
            id: typeof spaceId === 'string' ? parseInt(spaceId) : spaceId,
            name: rawSpace.name || rawSpace.title || '',
            description: rawSpace.description || '',
            price: rawSpace.price || 0,
            capacity: rawSpace.capacity || 0,
            location: rawSpace.location || '',
            isActive: this.parseIsActive(rawSpace.isActive), // Procesar con método robusto
            amenities: rawSpace.amenities || [],
            imageUrl: rawSpace.imageUrl || rawSpace.image || ''
          };
          
          console.log('[ADMIN] Espacio procesado:', space);
          return space;
        });
      })
    );
  }
  
  getSpaces(filter?: SpaceFilter): Observable<Space[]> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.capacity) {
        params = params.set('capacity', filter.capacity.toString());
      }
      if (filter.location) {
        params = params.set('location', filter.location);
      }
      if (filter.minPrice) {
        params = params.set('minPrice', filter.minPrice.toString());
      }
      if (filter.maxPrice) {
        params = params.set('maxPrice', filter.maxPrice.toString());
      }
      if (filter.amenities && filter.amenities.length > 0) {
        params = params.set('amenities', filter.amenities.join(','));
      }
      if (filter.fromDate) {
        params = params.set('fromDate', filter.fromDate.toISOString());
      }
      if (filter.toDate) {
        params = params.set('toDate', filter.toDate.toISOString());
      }
    }
    
    return this.http.get(this.API_URL, {
      params,
      observe: 'response'
    }).pipe(
      map(response => {
        // Depuración completa
        console.log('Respuesta del API completa:', response);
        console.log('Cabeceras:', response.headers);
        console.log('Datos recibidos (body):', response.body);
        
        // Obtener los datos del body (puede ser un array o estar dentro de alguna propiedad)
        const data: any = response.body;
        let spaces = Array.isArray(data) ? data : ((data as any)?.items || (data as any)?.spaces || (data as any)?.['hydra:member'] || []);
        
        console.log('Espacios antes de procesar:', spaces);
        
        // Mapear cada espacio para asegurarnos que tenga ID
        return spaces.map((rawSpace: any) => {
          // Buscar el ID en diferentes posibles propiedades
          let spaceId = rawSpace.id || rawSpace._id || rawSpace['@id'] || rawSpace.spaceId;
          
          // Si el ID es una URL, extraer el número
          if (typeof spaceId === 'string' && spaceId.includes('/')) {
            const parts = spaceId.split('/');
            spaceId = parts[parts.length - 1]; // Última parte de la URL
          }
          
          // Crear objeto Space compatible
          const space: Space = {
            id: typeof spaceId === 'string' ? parseInt(spaceId) : spaceId,
            name: rawSpace.name || rawSpace.title || '',
            description: rawSpace.description || '',
            price: rawSpace.price || 0,
            capacity: rawSpace.capacity || 0,
            location: rawSpace.location || '',
            isActive: this.parseIsActive(rawSpace.isActive), // Procesar con método robusto
            amenities: rawSpace.amenities || [],
            imageUrl: rawSpace.imageUrl || rawSpace.image || ''
          };
          
          console.log('Espacio procesado:', space);
          return space;
        });
      })
    );
  }

  getSpaceById(id: number): Observable<Space> {
    return this.http.get<Space>(`${this.API_URL}/${id}`);
  }

  createSpace(space: Space): Observable<Space> {
    // Obtener token manualmente para asegurarnos que se envía correctamente
    const token = localStorage.getItem('token');
    
    // Headers explícitos para esta petición crítica
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
    
    console.log('Creando espacio con headers:', headers);
    console.log('Datos del espacio a crear:', space);
    
    return this.http.post<Space>(this.API_URL, space, { headers });
  }

  updateSpace(id: number, space: Space): Observable<Space> {
    return this.http.put<Space>(`${this.API_URL}/${id}`, space);
  }

  deleteSpace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getAvailability(spaceId: number, startDate: Date, endDate: Date): Observable<SpaceAvailability> {
    // El endpoint espera un POST, no un GET
    const requestBody = {
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString()
    };
    
    console.log('Verificando disponibilidad:', requestBody);
    return this.http.post<SpaceAvailability>(`${this.API_URL}/${spaceId}/availability`, requestBody);
  }
}
