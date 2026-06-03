import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Student, StudentRequest } from '../models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/student`;

  private readonly studentsSignal = signal<Student[]>([]);
  readonly students = this.studentsSignal.asReadonly();

  loadStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl).pipe(
      tap((students) => this.studentsSignal.set(students))
    );
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  createStudent(data: StudentRequest): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, data).pipe(
      tap((student) => {
        this.studentsSignal.update((list) =>
          [...list, student].sort((a, b) => a.name.localeCompare(b.name))
        );
      })
    );
  }
}
