import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { DetailedProject, EnvironmentLookup } from '@models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private http = inject(HttpClient);

  toggleEnvironment(project: string, env: string) {
    return this.http.put<EnvironmentLookup>(`${environment.apiBase}/projects/${project}/environments/toggle/${env}`, {})
  }

  createProject(name: string) {
    return this.http.post(`${environment.apiBase}/projects`, { name }, { observe: 'response' });
  }

  findProjectById(id: string) {
    return this.http.get<DetailedProject>(`${environment.apiBase}/projects/${id}`);
  }
}
