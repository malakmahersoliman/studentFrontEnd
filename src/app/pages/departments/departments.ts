import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Department } from '../../models/department.model';
import { DepartmentService } from '../../services/department.service';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-departments',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './departments.html',
  styleUrl: './departments.css',
})
export class Departments implements OnInit {
  readonly departmentService = inject(DepartmentService);
  private readonly studentService = inject(StudentService);

  readonly departmentName = signal('');
  readonly editingDepartmentId = signal<number | null>(null);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly isEditing = computed(() => this.editingDepartmentId() !== null);

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.departmentService.loadDepartments().subscribe({
      next: () => this.isLoading.set(false),
      error: () => {
        this.errorMessage.set('Unable to load departments. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    const name = this.departmentName().trim();

    if (!name) {
      this.errorMessage.set('Department name is required.');
      return;
    }

    const editingId = this.editingDepartmentId();

    if (editingId !== null) {
      this.updateDepartment(editingId, name);
      return;
    }

    this.createDepartment(name);
  }

  startEdit(department: Department): void {
    this.editingDepartmentId.set(department.id);
    this.departmentName.set(department.name);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  cancelEdit(): void {
    this.resetForm();
  }

  onDelete(department: Department): void {
    const confirmed = confirm(`Delete department "${department.name}"?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.departmentService.deleteDepartment(department.id).subscribe({
      next: () => {
        this.successMessage.set('Department deleted successfully.');

        if (this.editingDepartmentId() === department.id) {
          this.resetForm(false);
        }

        this.studentService.loadStudents().subscribe();
      },
      error: () => {
        this.errorMessage.set('Unable to delete department. Please try again.');
      },
    });
  }

  private createDepartment(name: string): void {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.departmentService.createDepartment({ name }).subscribe({
      next: () => {
        this.successMessage.set('Department created successfully.');
        this.resetForm(false);
      },
      error: () => {
        this.errorMessage.set('Unable to create department. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  private updateDepartment(id: number, name: string): void {
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.departmentService.updateDepartment(id, { name }).subscribe({
      next: () => {
        this.successMessage.set('Department updated successfully.');
        this.resetForm(false);
      },
      error: () => {
        this.errorMessage.set('Unable to update department. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  private resetForm(clearMessages = true): void {
    this.editingDepartmentId.set(null);
    this.departmentName.set('');
    this.isSaving.set(false);

    if (clearMessages) {
      this.errorMessage.set('');
      this.successMessage.set('');
    }
  }
}
