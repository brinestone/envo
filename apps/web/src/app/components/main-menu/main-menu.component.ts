import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EnvironmentLookup, ProjectLookup } from '@models/project';
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
  readonly environments = input<EnvironmentLookup[]>();
  readonly projectId = input<string>();
  readonly selectedProject = linkedSignal(() => {
    const x = this.projectId();
    return x;
  });
  readonly signOut = output();

  readonly projectMenu = computed(() => {
    const project = this.projectId() as string;
    const env = this.environments() ?? [];
    const result = [
      {
        label: `Environments (${env.length})`, icon: 'pi pi-sitemap', styleClass: 'text-muted-color text-sm', expanded: true, items: env.map(e => ({
          routerLink: `/projects/${project}/environments/${e.id}`,
          label: e.name,
          routerLinkActiveOptions: { exact: false }
        }))
      }
    ] as MenuItem[];
    return result;
  })
  async onSignOutButtonClicked() {
    this.signOut.emit();
  }
}
