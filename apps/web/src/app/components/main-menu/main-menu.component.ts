import { Component, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProjectLookup } from '@models/project';
import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-main-menu',
  imports: [Button, RouterLink, Select, MenuModule, FormsModule],
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss'
})
export class MainMenuComponent {
  readonly accountMenuItems: MenuItem[] = [
    {
      label: 'Account', icon: 'pi pi-user', expanded: true, items: [
        { label: 'Billing', icon: 'pi pi-receipt', routerLink: '/billing' },
        { label: 'Projects', icon: 'pi pi-list-check', routerLink: '/projects', routerLinkActiveOptions: { exact: false } },
        { label: 'Integrations', icon: 'pi pi-link', routerLink: 'integrations' }
      ]
    }
  ];
  readonly projects = input<ProjectLookup[]>();
  readonly projectId = input<string>();
  readonly selectedProject = linkedSignal(() => {
    const x = this.projectId();
    return x;
  }); 
  readonly signOut = output();
  async onSignOutButtonClicked() {
    this.signOut.emit();
  }
}
