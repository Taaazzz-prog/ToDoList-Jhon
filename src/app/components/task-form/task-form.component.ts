import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService } from '../../services/task.service';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isLoading = false;
  isEditMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Task | null
  ) {
    this.isEditMode = !!data;
    this.taskForm = this.formBuilder.group({
      label: [data?.label || '', [Validators.required, Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.taskForm.valid && !this.isLoading) {
      this.isLoading = true;

      if (this.isEditMode && this.data) {
        this.updateTask();
      } else {
        this.createTask();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createTask(): void {
    console.log('📝 TaskFormComponent.createTask: Début de la création');
    
    const taskData: CreateTaskRequest = {
      label: this.taskForm.value.label.trim()
    };

    console.log('📝 TaskFormComponent.createTask: taskData =', taskData);

    this.taskService.createTask(taskData).subscribe({
      next: (task) => {
        console.log('✅ TaskFormComponent.createTask: Succès =', task);
        this.isLoading = false;
        this.snackBar.open('Tâche créée avec succès !', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(task);
      },
      error: (error) => {
        console.error('❌ TaskFormComponent.createTask: Erreur =', error);
        this.isLoading = false;
        this.snackBar.open(error, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private updateTask(): void {
    if (!this.data) return;

    const taskData: UpdateTaskRequest = {
      id: this.data.id,
      label: this.taskForm.value.label.trim()
    };

    this.taskService.updateTask(taskData).subscribe({
      next: (task) => {
        this.isLoading = false;
        this.snackBar.open('Tâche modifiée avec succès !', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(task);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(error, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.taskForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName === 'label' ? 'Titre' : 'Champ'} requis`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength']?.requiredLength;
      return `Maximum ${maxLength} caractères`;
    }
    return '';
  }
}
