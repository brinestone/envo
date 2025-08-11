import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideSearch } from '@ng-icons/lucide';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch, select } from '@ngxs/store';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeletonComponent } from '@spartan-ng/helm/skeleton';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { SelectProject } from '@state/project/actions';
import { currentProject } from '@state/selectors';
import { Project, ProjectSchema } from "@envo/dto";

@Component({
  selector: 'ev-config-page',
  viewProviders: [
    provideIcons({
      lucideSearch,
      lucideCheck
    })
  ],
  imports: [
    RouterOutlet,
    HlmTabsImports,
    BrnSelectImports,
    HlmSelectImports,
    HlmSkeletonComponent
  ],
  templateUrl: './config-page.layout.html',
  styleUrl: './config-page.layout.scss'
})
export class ConfigPageLayout {
  private readonly navigate = dispatch(Navigate);
  private route = inject(ActivatedRoute);
  readonly activeTab = signal('flags');
  readonly activeProjectId = select(currentProject);
  readonly projectSelectorState = signal<BrnDialogState>('closed');
  readonly allProjects = httpResource<Project[]>(() => `/api/projects`, { parse: (value) => ProjectSchema.array().parse(value) })
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
}
