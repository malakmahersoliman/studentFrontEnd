import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Department } from '../../models/department.model';
import { DepartmentService } from '../../services/department.service';

@Component({
  selector: 'app-department-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './department-details.html',
  styleUrl: './department-details.css',
})
export class DepartmentDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly departmentService = inject(DepartmentService);

  readonly department = signal<Department | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDepartment(id);
  }

  loadDepartment(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.departmentService.getDepartmentById(id).subscribe({
      next: (department) => {
        this.department.set(department);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Department not found.');
        this.isLoading.set(false);
      },
    });
  }
}
