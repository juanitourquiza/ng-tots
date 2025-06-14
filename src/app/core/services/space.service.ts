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
        let spaces = Array.isArray(data) ? data : (data?.items || data?.spaces || data?.['hydra:member'] || []);
        
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
            isActive: rawSpace.isActive !== false, // Por defecto true
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
    return this.http.post<Space>(this.API_URL, space);
  }

  updateSpace(id: number, space: Space): Observable<Space> {
    return this.http.put<Space>(`${this.API_URL}/${id}`, space);
  }

  deleteSpace(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getAvailability(spaceId: number, startDate: Date, endDate: Date): Observable<SpaceAvailability> {
    let params = new HttpParams()
      .set('startTime', startDate.toISOString())
      .set('endTime', endDate.toISOString());
      
    return this.http.get<SpaceAvailability>(`${this.API_URL}/${spaceId}/availability`, { params });
  }
}
