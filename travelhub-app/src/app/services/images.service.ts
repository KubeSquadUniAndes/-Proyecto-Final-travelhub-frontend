import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RoomImage {
  id: string;
  room_id: string;
  url: string;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class ImagesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/hospedajes/api/v1/rooms`;

  listByRoom(roomId: string): Observable<RoomImage[]> {
    return this.http.get<RoomImage[]>(`${this.baseUrl}/${roomId}/images`);
  }

  upload(roomId: string, file: File): Observable<RoomImage> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<RoomImage>(`${this.baseUrl}/${roomId}/images`, formData);
  }

  delete(imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/images/${imageId}`);
  }
}
