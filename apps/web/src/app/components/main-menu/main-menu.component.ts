import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-menu',
  imports: [Button, RouterLink, Select],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class MainMenuComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  async onSignOutButtonClicked() {
    const { data } = await this.authService.signOut();
    if (data?.success) {
      this.router.navigate(['/']);
    }
  }
}
