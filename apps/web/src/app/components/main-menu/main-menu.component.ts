import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-main-menu',
  imports: [Button, RouterLink, Select],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class MainMenuComponent {
  readonly signOut = output();
  async onSignOutButtonClicked() {
    this.signOut.emit();
  }
}
