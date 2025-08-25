import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideFlag, lucideSearch, lucideWrench } from '@ng-icons/lucide';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch, select } from '@ngxs/store';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeletonComponent } from '@spartan-ng/helm/skeleton';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { SelectProject } from '@state/project/actions';
import { currentProject } from '@state/selectors';
import { Project, ProjectSchema } from "@envo/common";
import { environment } from '../../../environments/environment.development';
import { HlmSeparatorDirective } from '@spartan-ng/helm/separator';
import { BrnSeparatorComponent } from '@spartan-ng/brain/separator';

@Component({
  selector: 'ev-config-page',
  viewProviders: [
    provideIcons({
      lucideSearch,
      lucideCheck,
      lucideFlag,
      lucideWrench
    })
  ],
  imports: [
    RouterOutlet,
    BrnSelectImports,
    HlmSelectImports,
    RouterLink,
    RouterLinkActive,
    HlmSkeletonComponent,
    NgIcon,
    HlmSeparatorDirective,
    BrnSeparatorComponent,
  ],
  templateUrl: './config-page.layout.html',
  styleUrl: './config-page.layout.scss'
})
export class ConfigPageLayout implements OnInit {
  private readonly navigate = dispatch(Navigate);
  private route = inject(ActivatedRoute);
  readonly links = [
    { label: 'Feature flags', path: 'flags', icon: 'lucideFlag' },
    { label: 'Environment Variables', path: 'vars', icon: 'lucideWrench' },
  ]
  readonly activeTab = signal('flags');
  readonly activeProjectId = select(currentProject);
  readonly projectSelectorState = signal<BrnDialogState>('closed');
  readonly allProjects = httpResource<Project[]>(() => `${environment.apiBaseUrl}/projects`, { parse: (value) => ProjectSchema.array().parse(value) })
  readonly selectProject = dispatch(SelectProject);
  readonly activeProject = computed(() => {
    const activeId = this.activeProjectId();
    if (!activeId) return undefined;
    const all = this.allProjects.value() ?? [];
    return all.find(p => p.id == activeId);
  })

  constructor() {
    effect(() => {
      const tab = this.activeTab();
      this.navigate([tab], undefined, { relativeTo: this.route }).subscribe();
    })
  }

  ngOnInit() {
    const tab = this.route.snapshot.children[0].url[0].path;
    this.activeTab.set(tab);
  }
}
