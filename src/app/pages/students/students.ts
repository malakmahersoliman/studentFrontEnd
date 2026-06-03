import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { DepartmentService } from '../../services/department.service';
import { StudentService } from '../../services/student.service';
import { StudentRequest } from '../../models/student.model';

@Component({
  selector: 'app-students',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly departmentService = inject(DepartmentService);
  readonly studentService = inject(StudentService);

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly departmentNames = computed(() => {
    const names = new Map<number, string>();

    for (const department of this.departmentService.departments()) {
      names.set(department.id, department.name);
    }

    return names;
  });

  studentForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    navname: ['', [Validators.required, Validators.maxLength(100)]],
    departmentId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin([
      this.departmentService.loadDepartments(),
      this.studentService.loadStudents(),
    ]).subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.errorMessage.set('Unable to load students or departments.');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    this.studentForm.markAllAsTouched();

    if (this.studentForm.invalid) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload: StudentRequest = {
      name: this.studentForm.value.name ?? '',
      navname: this.studentForm.value.navname ?? '',
      departmentId: this.studentForm.value.departmentId ?? 0,
    };

    this.studentService.createStudent(payload).subscribe({
      next: () => {
        this.successMessage.set('Student created successfully.');
        this.studentForm.reset({ name: '', navname: '', departmentId: 0 });
        this.isSaving.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to create student. Check the department selection.');
        this.isSaving.set(false);
      },
    });
  }
}
