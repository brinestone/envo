import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideChevronDown } from '@ng-icons/lucide';
import { select } from '@ngxs/store';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import {
  HlmDropdownMenu,
  HlmDropdownMenuItem,
  HlmDropdownMenuTrigger,
} from '@spartan/ui/dropdown-menu';
import { HlmSidebarImports, provideHlmSidebarConfig } from '@spartan/ui/sidebar';
import { HlmSkeleton } from '@spartan/ui/skeleton';
import { LoadOrganizations } from '@store/organization/actions';
import { activeOrg, orgs } from '@store/selectors';
import { actionsInProgress } from '@store/utils';
import { filter, map, startWith } from 'rxjs';

@Component({
  viewProviders: [
    provideIcons({
      lucideChevronDown,
      lucideCheck,
    }),
    provideHlmSidebarConfig({
      defaultOpen: false,
      sidebarWidthIcon: '3rem',
    }),
  ],
  imports: [
    HlmSidebarImports,
    HlmDropdownMenuItem,
    HlmDropdownMenuTrigger,
    RouterLink,
    RouterOutlet,
    NgIcon,
    HlmDropdownMenu,
    HlmSkeleton,
  ],
  selector: 'ev-main',
  styleUrl: './main.layout.scss',
  templateUrl: './main.layout.html',
})
export class MainLayout {
  protected readonly organizations = select(orgs);
  protected readonly activeOrganization = select(activeOrg);
  protected readonly loadingOrgs = actionsInProgress(LoadOrganizations);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly dialogState = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const hasDialog = this.route.snapshot.children.some((child) => child.outlet === 'dialog');
        return hasDialog ? 'open' : 'closed';
      }),
    ),
    { initialValue: 'closed' },
  );
  protected onDialogStateChanged(state: BrnDialogState) {
    if (state === 'closed' && this.dialogState() === 'open') {
      this.router.navigate([{ outlets: { dialog: null } }], { relativeTo: this.route });
    }
  }

  protected onDialogOutletDeactivated() {
    this.router.navigate([{ outlets: { dialog: null } }], { relativeTo: this.route });
  }
  protected selectOrganization(id: string) {}
}
