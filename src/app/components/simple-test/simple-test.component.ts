import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simple-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="
      padding: 40px;
      text-align: center;
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: white;
    ">
      <h1>🚀 TEST SIMPLE - TodoList Angular</h1>
      <p>✅ Angular fonctionne !</p>
      <p>✅ Composant standalone OK !</p>
      <p>✅ Port 23307 accessible !</p>
      
      <div style="
        background: rgba(255,255,255,0.1);
        padding: 20px;
        border-radius: 10px;
        margin: 20px auto;
        max-width: 500px;
      ">
        <h2>🔍 Debug Info</h2>
        <p><strong>Timestamp:</strong> {{ timestamp }}</p>
        <p><strong>Component:</strong> SimpleTestComponent</p>
        <p><strong>Status:</strong> RUNNING</p>
      </div>
      
      <button (click)="testClick()" style="
        background: #4CAF50;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        margin: 10px;
      ">
        🧪 Test Click
      </button>
      
      <div *ngIf="clickCount > 0" style="margin-top: 20px;">
        <p>✅ Click test réussi ! Compteur: {{ clickCount }}</p>
      </div>
    </div>
  `
})
export class SimpleTestComponent {
  timestamp = new Date().toLocaleString();
  clickCount = 0;

  constructor() {
    console.log('🧪 SimpleTestComponent: Constructor appelé à', this.timestamp);
  }

  testClick() {
    this.clickCount++;
    console.log('🧪 SimpleTestComponent: Click test #', this.clickCount);
    alert(`Test click réussi ! Compteur: ${this.clickCount}`);
  }
}
