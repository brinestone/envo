import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideChevronDown, lucideChevronsUpDown, lucideSearch, lucideSlash } from '@ng-icons/lucide';
import { select } from '@ngxs/store';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { HlmBreadCrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmMenuImports } from '@spartan-ng/helm/menu';
import { HlmSkeletonComponent } from '@spartan-ng/helm/skeleton';
import { activeOrganization } from '@state/selectors';
import { AuthService } from '../../services/auth.service';
import { MainMenu } from "../../components/main-menu/main-menu";
import { Footer } from "../../components/footer/footer";

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
    NgIcon,
    MainMenu,
    Footer
],
  templateUrl: './project.layout.html',
  styleUrl: './project.layout.scss'
})
export class ProjectLayout {
  private readonly authService = inject(AuthService);
  private readonly activeOrgId = select(activeOrganization);
  // private readonly activeProj = select(currentProject);
  readonly organizations = rxResource({
    defaultValue: [],
    stream: () => this.authService.getOrganizations()
  });
  readonly activeOrg = computed(() => {
    const orgs = this.organizations.value();
    const active = this.activeOrgId();
    return orgs.find(org => org.id === active);
  });
}
