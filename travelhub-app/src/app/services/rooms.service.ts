import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Room {
  id: string;
  hotel_id?: string;
  name: string;
  room_type: string;
  price: string;
  capacity: number;
  beds: string;
  size: number;
  amenities: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoomStats {
  total: number;
  available: number;
  occupied: number;
}

@Injectable({ providedIn: 'root' })
export class RoomsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/hospedajes/api/v1/rooms`;

  list(): Observable<Room[]> {
    return this.http.get<Room[]>(this.baseUrl);
  }

  getById(id: string): Observable<Room> {
    return this.http.get<Room>(`${this.baseUrl}/${id}`);
  }

  create(room: Partial<Room>): Observable<Room> {
    return this.http.post<Room>(this.baseUrl, room);
  }

  update(id: string, data: Partial<Room>): Observable<Room> {
    return this.http.put<Room>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  stats(): Observable<RoomStats> {
    return this.http.get<RoomStats>(`${this.baseUrl}/stats`);
  }
}
