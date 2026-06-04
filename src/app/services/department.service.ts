import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Department, DepartmentRequest } from '../models/department.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/department`;

  private readonly departmentsSignal = signal<Department[]>([]);
  readonly departments = this.departmentsSignal.asReadonly();

  loadDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl).pipe(
      tap((departments) => this.departmentsSignal.set(departments))
    );
  }

  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  createDepartment(data: DepartmentRequest): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, data).pipe(
      tap((department) => {
        this.departmentsSignal.update((list) =>
          [...list, department].sort((a, b) => a.name.localeCompare(b.name))
        );
      })
    );
  }

  updateDepartment(id: number, data: DepartmentRequest): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, data).pipe(
      tap((department) => {
        this.departmentsSignal.update((list) =>
          list
            .map((item) => (item.id === department.id ? department : item))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      })
    );
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.departmentsSignal.update((list) => list.filter((item) => item.id !== id));
      })
    );
  }
}
