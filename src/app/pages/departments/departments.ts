import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { DepartmentService } from '../../services/department.service';

@Component({
  selector: 'app-departments',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './departments.html',
  styleUrl: './departments.css',
})
export class Departments implements OnInit {
  readonly departmentService = inject(DepartmentService);

  readonly searchTerm = signal('');
  readonly departmentName = signal('');
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly filteredDepartments = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const departments = this.departmentService.departments();

    if (!term) {
      return departments;
    }

    return departments.filter((department) =>
      department.name.toLowerCase().includes(term)
    );
  });

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

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.departmentService.createDepartment({ name }).subscribe({
      next: () => {
        this.successMessage.set('Department created successfully.');
        this.departmentName.set('');
        this.isSaving.set(false);
      },
      error: () => {
        this.errorMessage.set('Unable to create department. Please try again.');
        this.isSaving.set(false);
      },
    });
  }
}
