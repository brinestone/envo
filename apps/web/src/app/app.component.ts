import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { AuthService } from './services/auth.service';
import { AsyncPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, MainMenuComponent, AsyncPipe, NgClass]
})
export class AppComponent {
  authService = inject(AuthService);
}
