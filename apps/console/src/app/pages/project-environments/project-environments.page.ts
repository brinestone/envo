import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, linkedSignal, model, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { EnvironmentSchema, EnvironmentType, EnvironmentTypeSchema, generateUniqueName, NewEnvironmentRequestSchema } from '@envo/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSave } from '@ng-icons/lucide';
import { select } from '@ngxs/store';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { HlmInputDirective } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSheetComponent, HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmSkeletonModule } from '@spartan-ng/helm/skeleton';
import { HlmSwitchComponent } from '@spartan-ng/helm/switch';
import { currentProject } from '@state/selectors';
import { toast } from 'ngx-sonner';
import { environment } from '../../../environments/environment.development';
import { NgClass } from '@angular/common';
import { EnvironmentInfo } from '@components/environment-info/environment-info';
import { HlmBadgeDirective } from '@spartan-ng/helm/badge';

type CdkListBoxSelection<T> = {
  listbox: CdkListbox;
  option: CdkOption;
  value: T[];
}

@Component({
  viewProviders: [

    provideIcons({
      lucidePlus,
      lucideSave
    })
  ],
  selector: 'ev-project-environments',
  host: {
    'class': 'page'
  },
  imports: [
    NgIcon,
    BrnSheetImports,
    HlmSheetImports,
    HlmButtonDirective,
    HlmSwitchComponent,
    HlmInputDirective,
    HlmSelectImports,
    BrnSelectImports,
    CdkListbox,
    EnvironmentInfo,
    NgClass,
    CdkOption,
    HlmSkeletonModule,
    HlmBadgeDirective,
    FormsModule,
  ],
  templateUrl: './project-environments.page.html',
  styleUrl: './project-environments.page.scss'
})
export class ProjectEnvironmentsPage {
  private http = inject(HttpClient);
  private project = select(currentProject);
  private form = viewChild(NgForm);
  private newEnvironmentSheet = viewChild(HlmSheetComponent);
  readonly allEnvironments = httpResource(() => `${environment.apiBaseUrl}/projects/${this.project()}/environments`, { defaultValue: [], parse: v => EnvironmentSchema.array().parse(v) });
  readonly focusedEnvironments = model<CdkListBoxSelection<string>>();
  readonly focusedEnvironment = computed(() => {
    const [focused] = this.focusedEnvironments()?.value ?? [];
    if (!focused) return null;
    return this.allEnvironments.value().find(({ id }) => id == focused) ?? null;
  });
  suggestedNewEnvironmentName = generateUniqueName('capital');
  readonly newEnvironmentName = model<string>();
  readonly newEnvironmentType = model<EnvironmentType | null>('production');
  readonly makeNewEnvironmentDefault = model<boolean | undefined>(false);
  readonly environmentOptions = Object.values(EnvironmentTypeSchema.enum);

  deleteEnvironment(id?: string) {
    if (!id) return;
    this.http.delete(`${environment.apiBaseUrl}/projects/${this.project()}/environments/${id}`).subscribe({
      error: (e: Error) => {
        toast.error('Could not delete environment', { description: e.message });
      },
      complete: () => {
        this.allEnvironments.reload();
        this.focusedEnvironments.set(undefined);
        toast.success('Environment deleted');
      }
    })
  }

  submitForm() {
    const requestData = NewEnvironmentRequestSchema.parse({
      ...this.form()?.value,
      isDefault: this.allEnvironments.value().length == 0,
      name: this.form()?.value?.name || this.suggestedNewEnvironmentName
    });

    this.http.post(`${environment.apiBaseUrl}/projects/${this.project()}/environments`, requestData).subscribe({
      error: (e: Error) => {
        toast.error('Could not create environment', { description: e.message })
      },
      complete: () => {
        this.newEnvironmentName.set(undefined);
        this.makeNewEnvironmentDefault.set(undefined);
        this.allEnvironments.reload();
        if (requestData.name === this.suggestedNewEnvironmentName)
          this.suggestedNewEnvironmentName = generateUniqueName('capital');
        this.newEnvironmentSheet()?.close();
        toast.success('Environment created successfully');
      }
    });
  }
}
