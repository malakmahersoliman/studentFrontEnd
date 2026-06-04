import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Student, StudentRequest } from '../../models/student.model';
import { DepartmentService } from '../../services/department.service';
import { StudentService } from '../../services/student.service';

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

  readonly editingStudentId = signal<number | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly isEditing = computed(() => this.editingStudentId() !== null);

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

    const payload = this.buildRequest();
    const editingId = this.editingStudentId();

    if (editingId !== null) {
      this.updateStudent(editingId, payload);
      return;
    }

    this.createStudent(payload);
  }

  startEdit(student: Student): void {
    this.editingStudentId.set(student.id);
    this.studentForm.patchValue({
      name: student.name,
      navname: student.navname,
      departmentId: student.departmentId,
    });
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  cancelEdit(): void {
    this.resetForm();
  }

  onDelete(student: Student): void {
    const confirmed = confirm(`Delete student "${student.name}"?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.studentService.deleteStudent(student.id).subscribe({
      next: () => {
        this.successMessage.set('Student deleted successfully.');

        if (this.editingStudentId() === student.id) {
          this.resetForm(false);
        }
      },
      error: () => {
        this.errorMessage.set('Unable to delete student. Please try again.');
      },
    });
  }

  private createStudent(payload: StudentRequest): void {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.studentService.createStudent(payload).subscribe({
      next: () => {
        this.successMessage.set('Student created successfully.');
        this.resetForm(false);
      },
      error: () => {
        this.errorMessage.set('Unable to create student. Check the department selection.');
        this.isSaving.set(false);
      },
    });
  }

  private updateStudent(id: number, payload: StudentRequest): void {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.studentService.updateStudent(id, payload).subscribe({
      next: () => {
        this.successMessage.set('Student updated successfully.');
        this.resetForm(false);
      },
      error: () => {
        this.errorMessage.set('Unable to update student. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  private buildRequest(): StudentRequest {
    return {
      name: this.studentForm.value.name ?? '',
      navname: this.studentForm.value.navname ?? '',
      departmentId: this.studentForm.value.departmentId ?? 0,
    };
  }

  private resetForm(clearMessages = true): void {
    this.editingStudentId.set(null);
    this.studentForm.reset({ name: '', navname: '', departmentId: 0 });
    this.isSaving.set(false);

    if (clearMessages) {
      this.errorMessage.set('');
      this.successMessage.set('');
    }
  }
}
