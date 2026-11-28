import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBot,
  lucideCheck,
  lucideChevronDown,
  lucideGauge,
  lucideList,
  lucideLogOut,
  lucideSettings,
  lucideSlidersVertical,
  lucideUser,
} from '@ng-icons/lucide';
import { dispatch, select } from '@ngxs/store';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmDropdownMenuImports } from '@spartan/ui/dropdown-menu';
import { HlmSidebarImports, provideHlmSidebarConfig } from '@spartan/ui/sidebar';
import { HlmSkeleton } from '@spartan/ui/skeleton';
import { SignOut } from '@store/auth';
import { LoadOrganizations, SelectOrganization } from '@store/organization/actions';
import { LoadProjects, SetActiveProject } from '@store/project/actions';
import {
  activeOrg,
  activeProject,
  allOrgProjects,
  avatar,
  orgs,
  principal,
} from '@store/selectors';
import { actionsInProgress } from '@store/utils';
import { filter, map, startWith } from 'rxjs';

@Component({
  viewProviders: [
    provideIcons({
      lucideChevronDown,
      lucideSlidersVertical,
      lucideCheck,
      lucideUser,
      lucideGauge,
      lucideList,
      lucideBot,
      lucideSettings,
      lucideLogOut,
    }),
    provideHlmSidebarConfig({
      defaultOpen: false,
      sidebarWidthIcon: '3.4rem',
    }),
  ],
  imports: [
    HlmSidebarImports,
    HlmDropdownMenuImports,
    RouterLink,
    RouterOutlet,
    NgIcon,
    HlmSkeleton,
  ],
  selector: 'ev-main',
  styleUrl: './main.layout.scss',
  templateUrl: './main.layout.html',
})
export class MainLayout implements OnInit {
  protected readonly signOut = dispatch(SignOut);
  private readonly loadProjects = dispatch(LoadProjects);
  protected readonly organizations = select(orgs);
  protected readonly projects = select(allOrgProjects);
  protected readonly principal = select(principal);
  protected readonly activeProject = select(activeProject);
  protected readonly activeProjectChanging = actionsInProgress(
    SelectOrganization,
    SetActiveProject,
  );
  protected readonly activeOrganizationChanging = actionsInProgress(SelectOrganization);
  protected readonly avatar = select(avatar);
  protected readonly menuItems = [
    { label: 'Account', route: '/account', icon: 'lucideUser' },
    { label: 'Settings', route: '/settings', icon: 'lucideSettings' },
  ];
  protected readonly activeOrganization = select(activeOrg);
  protected readonly loadingOrgs = actionsInProgress(LoadOrganizations);
  protected readonly loadingProjects = actionsInProgress(LoadOrganizations, LoadProjects);
  private readonly route = inject(ActivatedRoute);
  protected readonly selectProject = dispatch(SetActiveProject);
  protected readonly selectOrganization = dispatch(SelectOrganization);
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
  ngOnInit(): void {
    this.loadProjects();
  }
  protected readonly projectMenu = [
    {
      label: 'Project Menu',
      children: [
        { label: 'Overview', route: 'overview', icon: 'lucideGauge' },
        { label: 'Configs', route: 'configs', icon: 'lucideSlidersVertical' },
        { label: 'Clients', route: 'clients', icon: 'lucideBot' },
        { label: 'Events', route: 'events', icon: 'lucideList' },
        { label: 'Settings', route: 'settings', icon: 'lucideSettings' },
      ],
    },
  ];
}
