import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    main {
      flex: 1;
      padding: 24px;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'TodoList Angular';
  timestamp = new Date().toLocaleString();

  constructor() {
    console.log('🎯 AppComponent: Constructor called - SIMPLE VERSION');
    console.log('🎯 AppComponent: title =', this.title);
    console.log('🎯 AppComponent: timestamp =', this.timestamp);
  }

  ngOnInit() {
    console.log('🚀 AppComponent: ngOnInit appelé - SIMPLE VERSION');
    console.log('🚀 AppComponent: Application prête');
  }
}
