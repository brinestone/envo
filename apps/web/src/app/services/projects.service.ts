import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { DetailedEnvironment, DetailedProject, EnvironmentLookup, EnvironmentVersion } from '@models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  private http = inject(HttpClient);

  setActiveEnvironmentVersion(project: string, env: string, label: string) {
    return this.http.put<EnvironmentVersion[]>(`${environment.apiBase}/projects/${project}/environments/${env}/versions/activate`, { name: label });
  }

  getEnvironmentVersions(project: string, env: string) {
    return this.http.get<EnvironmentVersion[]>(`${environment.apiBase}/projects/${project}/environments/${env}/versions`);
  }

  createEnvironmentVersion(project: string, env: string, makeActive: boolean, label?: string) {
    return this.http.post<EnvironmentVersion>(`${environment.apiBase}/projects/${project}/environments/${env}/versions`, { makeActive, label });
  }

  findEnvironmentById(project: string, env: string) {
    return this.http.get<DetailedEnvironment>(`${environment.apiBase}/projects/${project}/environments/${env}`)
  }

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
