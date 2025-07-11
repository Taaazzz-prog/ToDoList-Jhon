import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user.model';

interface TestResult {
  success: boolean;
  username: string;
  email: string;
  error?: string;
}

@Component({
  selector: 'app-mass-register-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatProgressBarModule],
  template: `
    <mat-card class="test-container">
      <mat-card-header>
        <mat-card-title>🚀 Test d'inscription en masse</mat-card-title>
        <mat-card-subtitle>Création automatique de 10 comptes avec des noms fantaisistes</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="controls">
          <button mat-raised-button color="primary" 
                  [disabled]="isRunning"
                  (click)="startMassRegistration()">
            📝 Créer 10 comptes automatiquement
          </button>
          
          <button mat-raised-button color="warn" 
                  [disabled]="!isRunning"
                  (click)="stopRegistration()">
            ⏹️ Arrêter
          </button>
          
          <button mat-raised-button (click)="clearLog()">
            🗑️ Effacer les logs
          </button>
        </div>

        <mat-progress-bar mode="determinate" [value]="progress"></mat-progress-bar>
        
        <div class="status" [ngClass]="statusType">
          {{ statusMessage }}
        </div>

        <div class="log-container">
          <div class="log" #logContainer>
            <div *ngFor="let log of logs" [ngClass]="'log-' + log.type">
              <span class="timestamp">[{{ log.timestamp }}]</span> {{ log.message }}
            </div>
          </div>
        </div>

        <div class="results" *ngIf="results.length > 0">
          <h3>📊 Résultats détaillés :</h3>
          <div class="result-grid">
            <div *ngFor="let result of results" 
                 class="result-item" 
                 [ngClass]="result.success ? 'success' : 'error'">
              <strong>{{ result.username }}</strong><br>
              <small>{{ result.email }}</small><br>
              <span *ngIf="!result.success" class="error-msg">{{ result.error }}</span>
              <span *ngIf="result.success" class="success-msg">✅ Créé avec succès</span>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .test-container {
      max-width: 800px;
      margin: 20px auto;
    }
    
    .controls {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .status {
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
      font-weight: bold;
    }
    
    .status.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .status.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .status.info {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }
    
    .log-container {
      margin: 20px 0;
    }
    
    .log {
      height: 300px;
      overflow-y: auto;
      border: 1px solid #ddd;
      padding: 10px;
      background: #f9f9f9;
      font-family: monospace;
      font-size: 12px;
    }
    
    .log-success { color: green; }
    .log-error { color: red; }
    .log-info { color: blue; }
    .log-warning { color: orange; }
    
    .timestamp {
      opacity: 0.7;
    }
    
    .results {
      margin-top: 20px;
    }
    
    .result-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }
    
    .result-item {
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    
    .result-item.success {
      background: #d4edda;
      border-color: #c3e6cb;
    }
    
    .result-item.error {
      background: #f8d7da;
      border-color: #f5c6cb;
    }
    
    .success-msg {
      color: #155724;
      font-weight: bold;
    }
    
    .error-msg {
      color: #721c24;
      font-size: 11px;
    }
  `]
})
export class MassRegisterTestComponent {
  isRunning = false;
  shouldStop = false;
  progress = 0;
  statusMessage = 'Prêt à créer 10 comptes avec des noms fantaisistes...';
  statusType = 'info';
  logs: Array<{message: string, type: string, timestamp: string}> = [];
  results: TestResult[] = [];

  private readonly funnyNames = [
    'CacaBoudin',
    'PipiFace',
    'CrotteDeNez',
    'PetLaRale',
    'BouseBurger',
    'CrottinDuchene',
    'FienteDinde',
    'BousilleurDePizza',
    'CacaHuete',
    'PuantLeMorpion'
  ];

  constructor(private authService: AuthService) {
    this.log('Composant de test chargé et prêt!', 'success');
    this.log('Cliquez sur "Créer 10 comptes automatiquement" pour commencer', 'info');
  }

  private log(message: string, type: string = 'info'): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push({ message, type, timestamp });
  }

  private generateEmail(name: string, index: number): string {
    const domains = ['pourri.com', 'caca.fr', 'degeu.net', 'moche.org'];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const timestamp = Date.now();
    return `${name.toLowerCase()}${index}_${timestamp}@${randomDomain}`;
  }

  private generatePassword(): string {
    return 'motdepasse123';
  }

  async startMassRegistration(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.shouldStop = false;
    this.results = [];
    this.progress = 0;

    this.log('🚀 Démarrage de l\'inscription en masse...', 'info');
    this.statusMessage = 'Inscription en cours...';
    this.statusType = 'info';

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < this.funnyNames.length; i++) {
      if (this.shouldStop) {
        this.log('⏹️ Arrêt demandé par l\'utilisateur', 'warning');
        break;
      }

      const name = this.funnyNames[i];
      const userData: RegisterRequest = {
        email: this.generateEmail(name, i + 1),
        username: name,
        password: this.generatePassword(),
        role: 'user'
      };

      this.log(`📝 Tentative d'inscription: ${userData.username}...`, 'info');
      this.progress = ((i + 1) / this.funnyNames.length) * 100;

      try {
        await this.authService.register(userData).toPromise();
        this.log(`✅ Compte créé: ${userData.username} (${userData.email})`, 'success');
        this.results.push({
          success: true,
          username: userData.username,
          email: userData.email
        });
        successCount++;
      } catch (error: any) {
        this.log(`❌ Échec pour ${userData.username}: ${error}`, 'error');
        this.results.push({
          success: false,
          username: userData.username,
          email: userData.email,
          error: error
        });
        errorCount++;
      }

      // Attendre un peu entre chaque requête
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const totalAttempts = successCount + errorCount;
    this.log(`🏁 Inscription terminée!`, 'info');
    this.log(`📊 Résultats: ${successCount} succès, ${errorCount} échecs sur ${totalAttempts} tentatives`, 'info');

    if (successCount > 0) {
      this.statusMessage = `✅ Terminé! ${successCount} comptes créés avec succès`;
      this.statusType = 'success';
    } else {
      this.statusMessage = `❌ Aucun compte créé. ${errorCount} échecs`;
      this.statusType = 'error';
    }

    this.isRunning = false;
  }

  stopRegistration(): void {
    this.shouldStop = true;
    this.statusMessage = 'Arrêt en cours...';
    this.statusType = 'info';
  }

  clearLog(): void {
    this.logs = [];
    this.results = [];
    this.progress = 0;
    this.statusMessage = 'Prêt à créer 10 comptes avec des noms fantaisistes...';
    this.statusType = 'info';
    this.log('Logs effacés...', 'info');
  }
}
