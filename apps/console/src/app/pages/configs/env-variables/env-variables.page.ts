import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, effect, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { generateRandomCode, NewVariableRequestSchema, UpdateVariableRequestSchema, Variable, VariableSchema } from '@envo/common';
import { bootstrapCircleFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';
import { lucideCheck, lucideCopy, lucideDot, lucideEye, lucidePencil, lucidePlus, lucideSave, lucideTrash2 } from '@ng-icons/lucide';
import { select } from '@ngxs/store';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { HlmFormFieldModule } from '@spartan-ng/helm/form-field';
import { HlmInputDirective } from "@spartan-ng/helm/input";
import { HlmSpinnerComponent } from '@spartan-ng/helm/spinner';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { currentProject } from '@state/selectors';
import { toast } from 'ngx-sonner';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { PendingChanges } from '../../../../models';
import { ignoreFormTrackedChanges } from '../../../utils';

type EnvVariableFormType = FormGroup<{
  id: FormControl<string | null>;
  isNew: FormControl<boolean>;
  name: FormControl<string>;
  isSecret: FormControl<boolean>;
  fallbackValue: FormControl<string>;
  fallbackMask: FormControl<string>;
  trackingKey: FormControl<string>;
  editing: FormControl<boolean>;
}>;

@Component({
  selector: 'ev-env-variables',
  viewProviders: [
    provideIcons({
      lucidePlus,
      lucideSave,
      lucidePencil,
      lucideCopy,
      lucideCheck,
      lucideEye,
      lucideTrash2,
      heroXMark,
      lucideDot,
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
    HlmSpinnerComponent,
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
  readonly copiedValues = signal<Record<string, 'copying' | 'copied'>>({});
  readonly showingValues = signal<Record<string, () => void | 'loading'>>({});
  deleteTimer?: number;
  deletingIndex = signal<number | null>(null);
  remainingDeletionTime = signal(5);
  deleteInProgress = signal<number | null>(null);

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
    });

    effect(() => {
      const index = this.deletingIndex();
      if (index === null) return;
      const form = this.forms.at(index);
      if (form.value.isNew) {
        this.remainingDeletionTime.set(3);
      }
      this.deleteTimer = setInterval(() => {
        this.remainingDeletionTime.update(v => Math.max(0, v - 1));
      }, 1000);
    });

    effect(() => {
      const index = this.deletingIndex();
      const remainingTime = this.remainingDeletionTime();
      if (remainingTime > 0 || index === null) return;

      this.doDeleteVar(index);
    })
  }

  resetDeletion() {
    this.deletingIndex.set(null);
    clearInterval(this.deleteTimer);
    this.remainingDeletionTime.set(5);
    this.deleteTimer = undefined;
    this.deleteInProgress.set(null);
  }

  private doDeleteVar(index: number) {
    const form = this.forms.at(index);
    const { id, name, isNew } = form.value;
    if (isNew) {
      this.forms.removeAt(index);
      this.resetDeletion();
      return;
    }
    // toast.loading('Removing feature...');
    this.deleteInProgress.set(index);
    this.http.delete(`${environment.apiBaseUrl}/projects/${this.project()}/vars/${id}`).subscribe({
      error: (e: HttpErrorResponse) => {
        toast.error('Could not remove "' + name + '"', { description: e.error?.message ?? e.message });
        this.resetDeletion();
      },
      complete: () => {
        this.forms.removeAt(index);
        toast.success(name + ' removed successfully');
        this.resetDeletion();
      }
    })
  }

  toggleEditing(index: number) {
    const form = this.forms.at(index);
    const update = form.value.editing === true ? false : true;
    form.controls.editing.setValue(update);
    const trackingKey = form.value.trackingKey as string;
    const showingTeardownFn = this.showingValues()[trackingKey];
    let valueWasShowing = typeof showingTeardownFn === 'function';
    if (update) {
      if (form.value.fallbackValue) {
        if (typeof showingTeardownFn == 'function') {
          showingTeardownFn();
        }
        ignoreFormTrackedChanges(form);
        return;
      }
      this.loadVariableValue(index).subscribe({
        error: (e: Error) => {
          toast.error('Something went wrong');
          console.error(e);
        },
        next: ({ value }) => {
          form.controls.fallbackValue.setValue(value);
        },
        complete: () => ignoreFormTrackedChanges(form)
      });
    } else {
      if (valueWasShowing) {
        form.controls.fallbackValue.setValue('');
        ignoreFormTrackedChanges(form);
      }
    }
  }

  copyVariableValue(index: number) {
    const form = this.forms.at(index);
    const trackingKey = form.value.trackingKey as string;
    this.copiedValues.update(r => ({ ...r, [trackingKey]: 'copying' }));
    if (form.value.fallbackValue) {
      navigator.clipboard.writeText(form.value.fallbackValue).then(() => {
        this.copiedValues.update(r => ({ ...r, [trackingKey]: 'copied' }));
        setTimeout(() => {
          this.copiedValues.update(r => {
            delete r[trackingKey];
            return { ...r };
          });
        }, 5000);
        toast.info('Copied to clipboard');
      });
      return;
    }
    this.loadVariableValue(index).subscribe({
      error: (error: Error) => {
        toast.error('Something went wrong', { description: error.message });
        this.copiedValues.update(r => {
          delete r[trackingKey];
          return { ...r };
        });
      },
      next: ({ value }) => {
        navigator.clipboard.writeText(value).then(() => {
          this.copiedValues.update(r => ({ ...r, [trackingKey]: 'copied' }));
          setTimeout(() => {
            this.copiedValues.update(r => {
              delete r[trackingKey];
              return { ...r };
            })
          }, 5000);
        });
      },
      complete: () => {
        toast.info('Copied to clipboard');
      }
    })
  }

  showVariableValue(index: number) {
    const form = this.forms.at(index);
    if (form.value.fallbackValue) {
      return;
    }
    const trackingKey = form.value.trackingKey as string;
    this.showingValues.update(r => ({ ...r, [trackingKey]: 'loading' as any }));
    this.loadVariableValue(index).subscribe({
      error: (error: Error) => {
        toast.error('Something went wrong', { description: error.message })
        this.showingValues.update(r => {
          delete r[trackingKey];
          return { ...r };
        });
      },
      next: ({ value }) => {
        form.controls.fallbackValue.setValue(value);
        ignoreFormTrackedChanges(form);
      },
      complete: () => {
        const timer = setTimeout(() => {
          form.controls.fallbackValue.setValue('');
          ignoreFormTrackedChanges(form);
          this.showingValues.update(r => {
            delete r[trackingKey];
            return { ...r };
          })
        }, 600_000);
        this.showingValues.update(r => ({
          ...r, [trackingKey]: () => {
            clearTimeout(timer);
            this.showingValues.update(r => {
              delete r[trackingKey];
              return { ...r };
            })
          }
        }));

      }
    });
  }

  private loadVariableValue(index: number) {
    const varId = this.forms.at(index).value.id;
    return this.http.get<{ value: string }>(`${environment.apiBaseUrl}/projects/${this.project()}/vars/${varId}/value`)
  }

  private toEnvForm(env: Variable, form?: EnvVariableFormType) {
    form = form ?? this.newVariableForm();
    form.patchValue({ ...env, isNew: false, editing: false });
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
    } else {
      const requestData = UpdateVariableRequestSchema.parse(Object.fromEntries(Object.entries(form.controls).filter(([_, control]) => control.dirty).map(([k, control]) => ([k, control.value]))));
      this.http.patch(`${environment.apiBaseUrl}/projects/${this.project()}/vars/${form.value.id}`, requestData).subscribe({
        error: ({ message }: Error) => {
          toast.error(`Could not update ${form.value.name}`, { description: message });
        },
        next: (response) => {
          const update = VariableSchema.parse(response);
          form.patchValue({ ...update, editing: false });
          toast.success('Changes saved successfully');
        }
      });
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
      trackingKey: this.fb.nonNullable.control<string>(generateRandomCode()),
      editing: this.fb.nonNullable.control<boolean>(true),
      fallbackMask: this.fb.control<string | null>(null)
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
