import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Category } from '../../models/category.model';

export interface CategoryDialogData {
  category?: Category;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ isEditMode ? 'edit' : 'add' }}</mat-icon>
      {{ isEditMode ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="categoryForm" class="category-form">
        
        <!-- Nom de la catégorie -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom de la catégorie</mat-label>
          <input 
            matInput 
            formControlName="name" 
            placeholder="Ex: Personnel, Travail, Urgent..."
            maxlength="50">
          <mat-icon matSuffix>label</mat-icon>
          <mat-error *ngIf="categoryForm.get('name')?.hasError('required')">
            Le nom est obligatoire
          </mat-error>
          <mat-error *ngIf="categoryForm.get('name')?.hasError('minlength')">
            Le nom doit faire au moins 2 caractères
          </mat-error>
          <mat-error *ngIf="categoryForm.get('name')?.hasError('maxlength')">
            Le nom ne peut pas dépasser 50 caractères
          </mat-error>
        </mat-form-field>

        <!-- Description -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description (optionnelle)</mat-label>
          <textarea 
            matInput 
            formControlName="description" 
            placeholder="Description de la catégorie..."
            rows="3"
            maxlength="200">
          </textarea>
          <mat-icon matSuffix>description</mat-icon>
          <mat-hint>{{ categoryForm.get('description')?.value?.length || 0 }}/200</mat-hint>
        </mat-form-field>

        <!-- Couleur -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Couleur</mat-label>
          <mat-select formControlName="color">
            <mat-option 
              *ngFor="let colorOption of availableColors" 
              [value]="colorOption.value"
              class="color-option">
              <div class="color-preview">
                <div 
                  class="color-circle" 
                  [style.background-color]="colorOption.value">
                </div>
                {{ colorOption.name }}
              </div>
            </mat-option>
          </mat-select>
          <mat-icon matSuffix>palette</mat-icon>
        </mat-form-field>

        <!-- Icône -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Icône</mat-label>
          <mat-select formControlName="icon">
            <mat-option 
              *ngFor="let iconOption of availableIcons" 
              [value]="iconOption.value"
              class="icon-option">
              <div class="icon-preview">
                <mat-icon>{{ iconOption.value }}</mat-icon>
                {{ iconOption.name }}
              </div>
            </mat-option>
          </mat-select>
          <mat-icon matSuffix>emoji_symbols</mat-icon>
        </mat-form-field>

        <!-- Aperçu -->
        <div class="category-preview" *ngIf="categoryForm.valid">
          <h4>Aperçu :</h4>
          <div class="preview-category">
            <mat-icon 
              [style.color]="categoryForm.get('color')?.value"
              class="preview-icon">
              {{ categoryForm.get('icon')?.value }}
            </mat-icon>
            <span class="preview-name">{{ categoryForm.get('name')?.value }}</span>
          </div>
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
        Annuler
      </button>
      
      <button 
        mat-raised-button 
        color="primary"
        [disabled]="!categoryForm.valid"
        (click)="onSave()">
        <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
        {{ isEditMode ? 'Modifier' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .category-form {
      min-width: 400px;
      padding: 16px 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .color-option .color-preview {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .color-circle {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid rgba(0,0,0,0.2);
    }

    .icon-option .icon-preview {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .category-preview {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }

    .preview-category {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
    }

    .preview-icon {
      font-size: 20px;
    }

    .preview-name {
      font-weight: 500;
    }

    mat-dialog-actions {
      padding: 16px 0 8px 0;
      margin: 0;
    }

    mat-dialog-actions button {
      margin-left: 8px;
    }
  `]
})
export class CategoryDialogComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode: boolean;

  availableColors = [
    { name: 'Bleu', value: '#2196F3' },
    { name: 'Vert', value: '#4CAF50' },
    { name: 'Orange', value: '#FF9800' },
    { name: 'Rouge', value: '#F44336' },
    { name: 'Violet', value: '#9C27B0' },
    { name: 'Teal', value: '#009688' },
    { name: 'Indigo', value: '#3F51B5' },
    { name: 'Rose', value: '#E91E63' },
    { name: 'Cyan', value: '#00BCD4' },
    { name: 'Lime', value: '#8BC34A' },
    { name: 'Ambre', value: '#FFC107' },
    { name: 'Gris', value: '#607D8B' }
  ];

  availableIcons = [
    { name: 'Travail', value: 'work' },
    { name: 'Personnel', value: 'person' },
    { name: 'Maison', value: 'home' },
    { name: 'Shopping', value: 'shopping_cart' },
    { name: 'Sport', value: 'fitness_center' },
    { name: 'Voyage', value: 'flight' },
    { name: 'Santé', value: 'local_hospital' },
    { name: 'École', value: 'school' },
    { name: 'Voiture', value: 'directions_car' },
    { name: 'Restauration', value: 'restaurant' },
    { name: 'Musique', value: 'music_note' },
    { name: 'Livre', value: 'book' },
    { name: 'Urgent', value: 'priority_high' },
    { name: 'Idée', value: 'lightbulb' },
    { name: 'Étoile', value: 'star' },
    { name: 'Cœur', value: 'favorite' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CategoryDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.categoryForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.category) {
      this.categoryForm.patchValue({
        name: this.data.category.name,
        description: this.data.category.description || '',
        color: this.data.category.color,
        icon: this.data.category.icon
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(200)]],
      color: [this.availableColors[0].value, [Validators.required]],
      icon: [this.availableIcons[0].value, [Validators.required]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      const categoryData = {
        ...formValue,
        id: this.isEditMode ? this.data.category?.id : undefined
      };
      
      this.dialogRef.close(categoryData);
    }
  }
}
