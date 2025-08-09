import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { extractHttpError } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);

  createProject(name: string, org: string) {
    return this.http.post<{ id: string }>('/api/projects', { name, org }).pipe(
      catchError(extractHttpError)
    );
  }
}
