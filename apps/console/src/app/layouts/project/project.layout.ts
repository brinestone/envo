import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideSlash } from '@ng-icons/lucide';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { HlmBreadCrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmMenuImports } from '@spartan-ng/helm/menu';
import { AuthService } from '../../services/auth.service';
import { select } from '@ngxs/store';
import { activeOrganization } from '@state/selectors';

@Component({
  selector: 'ev-project',
  viewProviders: [
    provideIcons({
      lucideChevronDown,
      lucideSlash
    })
  ],
  imports: [
    RouterOutlet,
    HlmMenuImports,
    BrnMenuTriggerDirective,
    HlmBreadCrumbImports,
    NgIcon
  ],
  templateUrl: './project.layout.html',
  styleUrl: './project.layout.scss'
})
export class ProjectLayout {
  private readonly authService = inject(AuthService);
  private readonly activeOrgId = select(activeOrganization);
  readonly organizations = rxResource({
    defaultValue: [],
    stream: () => this.authService.getOrganizations()
  });
  readonly activeOrg = computed(() => {
    const orgs = this.organizations.value();
    const active = this.activeOrgId();
    return orgs.find(org => org.id === active);
  });
  readonly projects = signal([{id: 'foo', name: 'Test'}]);
}
