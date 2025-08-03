import { HttpClient } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideSlash, lucideChevronsUpDown, lucideSearch, lucideCheck } from '@ng-icons/lucide';
import { select } from '@ngxs/store';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { HlmBreadCrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmMenuImports } from '@spartan-ng/helm/menu';
import { HlmSkeletonComponent } from '@spartan-ng/helm/skeleton';
import { activeOrganization, currentProject } from '@state/selectors';
import { of } from 'rxjs';
import { Project } from 'shared';
import { AuthService } from '../../services/auth.service';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ev-project',
  viewProviders: [
    provideIcons({
      lucideChevronDown,
      lucideSlash,
      lucideChevronsUpDown,
      lucideSearch,
      lucideCheck
    })
  ],
  imports: [
    RouterOutlet,
    HlmMenuImports,
    BrnMenuTriggerDirective,
    HlmBreadCrumbImports,
    HlmSkeletonComponent,
    NgTemplateOutlet,
    NgIcon
  ],
  templateUrl: './project.layout.html',
  styleUrl: './project.layout.scss'
})
export class ProjectLayout {
  private readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly activeOrgId = select(activeOrganization);
  private readonly activeProj = select(currentProject);
  readonly organizations = rxResource({
    defaultValue: [],
    stream: () => this.authService.getOrganizations()
  });
  readonly activeOrg = computed(() => {
    const orgs = this.organizations.value();
    const active = this.activeOrgId();
    return orgs.find(org => org.id === active);
  });
  readonly projects = rxResource({
    params: () => ({ org: this.activeOrgId() }),
    stream: ({ params: { org } }) => {
      if (!org) return of([]);
      return this.http.get<Project[]>(`/api/projects/${org}`);
    }
  })
}
