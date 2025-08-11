import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { generateRandomCode, NewVariableRequestSchema, Variable, VariableSchema } from '@envo/common';
import { bootstrapCircleFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSave, lucideTrash2 } from '@ng-icons/lucide';
import { select } from '@ngxs/store';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { HlmFormFieldModule } from '@spartan-ng/helm/form-field';
import { HlmInputDirective } from "@spartan-ng/helm/input";
import { currentProject } from '@state/selectors';
import { Observable } from 'rxjs';
import { PendingChanges } from '../../../../models';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { heroXMark } from '@ng-icons/heroicons/outline';
import { HttpClient, httpResource } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { toast } from 'ngx-sonner';

type EnvVariableFormType = FormGroup<{
  id: FormControl<string | null>;
  isNew: FormControl<boolean>;
  name: FormControl<string>;
  isSecret: FormControl<boolean>;
  fallbackValue: FormControl<string>;
  trackingKey: FormControl<string>;
}>;

@Component({
  selector: 'ev-env-variables',
  viewProviders: [
    provideIcons({
      lucidePlus,
      lucideSave,
      lucideTrash2,
      heroXMark,
      bootstrapCircleFill
    }),
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ],
  imports: [
    NgIcon,
    HlmBadgeImports,
    HlmButtonDirective,
    HlmAccordionImports,
    ReactiveFormsModule,
    HlmFormFieldModule,
    HlmSwitchImports,
    BrnAlertDialogImports,
    HlmAlertDialogImports,
    HlmInputDirective,
    HlmButtonDirective
  ],
  templateUrl: './env-variables.page.html',
  styleUrl: './env-variables.page.scss'
})
export class EnvVariablesPage implements PendingChanges {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private project = select(currentProject);
  readonly forms: FormArray<EnvVariableFormType> = this.fb.array<EnvVariableFormType>([]);
  readonly pendingChangesDialogState = signal<BrnDialogState>('closed');
  readonly variables = httpResource(() => `${environment.apiBaseUrl}/projects/${this.project()}/vars`, { defaultValue: [], parse: v => VariableSchema.array().parse(v) })
  closeDialog: (discardPendingChanges: boolean) => void = () => { this.pendingChangesDialogState.set('closed'); };

  constructor() {
    effect(() => {
      const vars = this.variables.value();
      vars.forEach(v => {
        let form = this.forms.controls.find(form => form.value.id === v.id);
        let formIndex = this.forms.controls.findIndex(form => form.value.id === v.id);
        form = this.toEnvForm(v, form);
        if (formIndex < 0) {
          this.forms.insert(0, form);
        } else {
          this.forms.removeAt(formIndex);
          this.forms.insert(formIndex, form);
        }
      })
    })
  }

  private toEnvForm(env: Variable, form?: EnvVariableFormType) {
    form = form ?? this.newVariableForm();
    form.patchValue({ ...env, isNew: false });
    form.markAsPristine();
    form.markAsUntouched();
    form.updateValueAndValidity();
    return form;
  }

  submitForm(index: number, event: SubmitEvent) {
    event.preventDefault();
    const form = this.forms.at(index);
    if (form.value.isNew) {
      const requestData = NewVariableRequestSchema.parse(form.value);
      this.http.post(`${environment.apiBaseUrl}/projects/${this.project()}/vars`, requestData).subscribe({
        error: ({ message }: Error) => {
          toast.error('Could not create variable', { description: message });
        },
        complete: () => {
          this.forms.removeAt(index);
          this.variables.reload();
          toast.success('Changes saved successfully');
        }
      })
    }
  }

  addVariable() {
    this.forms.insert(0, this.newVariableForm());
  }

  newVariableForm() {
    return this.fb.group({
      fallbackValue: this.fb.nonNullable.control<string>('', [Validators.required]),
      id: this.fb.control<string | null>(null),
      isNew: this.fb.nonNullable.control<boolean>(true),
      name: this.fb.nonNullable.control<string | null>(null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]),
      isSecret: this.fb.nonNullable.control<boolean>(false),
      trackingKey: this.fb.nonNullable.control<string>(generateRandomCode())
    }) as EnvVariableFormType;
  }

  hasPendingChanges() {
    if (this.forms.pristine) return true;
    return new Observable<boolean>(subscriber => {
      this.closeDialog = (v) => {
        this.pendingChangesDialogState.set('closed');
        subscriber.add(() => this.closeDialog = () => { this.pendingChangesDialogState.set('closed'); });
        subscriber.next(!v);
        subscriber.complete();
      }
      this.pendingChangesDialogState.set('open');
    })
  }

  resetForm(index: number) {
    const form = this.forms.at(index);
    const data = this.variables.value()[index];
    this.toEnvForm(data, form);
  }
}
