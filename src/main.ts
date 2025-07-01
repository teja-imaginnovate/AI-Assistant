import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { ChatComponent } from './components/chat.component';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <app-chat></app-chat>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .app-container {
        padding: 0;
      }
    }
  `],
  standalone: true,
  imports: [ChatComponent]
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideHttpClient()
  ]
});