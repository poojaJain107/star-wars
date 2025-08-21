import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="app-container">
      <header class="app-header">
        <nav class="nav-container">
          <a routerLink="/characters" class="app-title">
            Star Wars Characters
          </a>
        </nav>
      </header>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .app-header {
      background: #2c3e50;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    .app-title {
      color: #ecf0f1;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: 600;
      display: block;
      padding: 16px 0;
      transition: color 0.3s ease;
    }

    .app-title:hover {
      color: #3498db;
    }

    .main-content {
      min-height: calc(100vh - 70px);
    }

    @media (max-width: 768px) {
      .nav-container {
        padding: 0 15px;
      }
      
      .app-title {
        font-size: 1.3rem;
        padding: 12px 0;
      }
    }
  `]
})
export class AppComponent {
  title = 'star-wars-app';
}