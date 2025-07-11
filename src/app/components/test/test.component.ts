import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="test-container">
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>check_circle</mat-icon>
            ToDoList Angular Test
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>✅ Application Angular démarrée avec succès !</p>
          <p>✅ Angular Material fonctionne</p>
          <p>✅ Composants standalone opérationnels</p>
          <p>📱 Ready pour les tests complets</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="goToLogin()">
            <mat-icon>login</mat-icon>
            Aller à la page de connexion
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .test-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 24px;
    }
    
    .test-card {
      max-width: 500px;
      text-align: center;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    mat-card-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #1976d2;
    }
    
    mat-card-content p {
      margin: 8px 0;
      font-size: 1.1rem;
    }
    
    mat-card-actions {
      justify-content: center;
      margin-top: 16px;
    }
  `]
})
export class TestComponent {
  constructor(private router: Router) {
    console.log('🧪 TestComponent: Constructor called');
  }
  
  goToLogin() {
    console.log('🔗 TestComponent.goToLogin: Navigation vers /login');
    this.router.navigate(['/login']);
  }
}
