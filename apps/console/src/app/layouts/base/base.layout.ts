import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideChevronDown, lucideChevronsUpDown, lucideReceipt, lucideSearch, lucideSlidersVertical } from '@ng-icons/lucide';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch, select } from '@ngxs/store';
import { BrnMenuTriggerDirective } from '@spartan-ng/brain/menu';
import { HlmBreadCrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmMenuImports } from '@spartan-ng/helm/menu';
import { HlmSkeletonComponent } from '@spartan-ng/helm/skeleton';
import { SignOut } from '@state/auth/actions';
import { activeOrganization, principal } from '@state/selectors';
import { map } from 'rxjs';
import { Footer } from "../../components/footer/footer";
import { MainMenu, MenuItemSchema } from "../../components/main-menu/main-menu";
import { AuthService } from '../../services/auth';

@Component({
  selector: 'ev-base',
  viewProviders: [
    provideIcons({
      lucideSlidersVertical,
      lucideReceipt,
      lucideChevronsUpDown,
      lucideChevronDown,
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
  templateUrl: './base.layout.html',
  styleUrl: './base.layout.scss'
})
export class BaseLayout {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly activeOrgId = select(activeOrganization);
  readonly user = select(principal);
  readonly signOut = dispatch(SignOut);
  readonly navigate = dispatch(Navigate);
  readonly organizations = rxResource({
    defaultValue: [],
    stream: () => this.authService.getOrganizations()
  });
  readonly activeOrg = computed(() => {
    const orgs = this.organizations.value();
    const active = this.activeOrgId();
    return orgs.find(org => org.id === active);
  });
  readonly menuItems = toSignal(this.route.data.pipe(
    map(data => MenuItemSchema.array().optional().default([]).parse(data?.['menuItems']))
  ), { initialValue: [] });
}
