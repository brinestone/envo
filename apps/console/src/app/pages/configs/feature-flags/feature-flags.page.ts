import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup, FormRecord, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountryInfo, FeatureFlag, FeatureFlagSchema, generateRandomCode, NewFeatureRequestSchema, StateInfo, UpdateFeatureFlagRequestSchema } from '@envo/common';
import { bootstrapCircleFill } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroQuestionMarkCircle, heroXMark } from '@ng-icons/heroicons/outline';
import { lucideChevronDown, lucidePlus, lucideSave, lucideTrash2 } from '@ng-icons/lucide';
import { select } from '@ngxs/store';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { BrnHoverCardImports } from '@spartan-ng/brain/hover-card';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { HlmFormFieldModule } from '@spartan-ng/helm/form-field';
import { HlmHoverCardImports } from '@spartan-ng/helm/hover-card';
import { HlmInputDirective } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { currentProject } from '@state/selectors';
import { toast } from 'ngx-sonner';
import { distinctUntilChanged, filter, map, Observable, takeUntil } from 'rxjs';
import z from 'zod';
import { environment } from '../../../../environments/environment.development';
import { CanDeactivateType, PendingChanges } from '../../../../models';
import { BrnDialogContentDirective, BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';

type OverrideType = 'ip' | 'cidr' | 'zone';

type FeatureForm = FormGroup<{
  isNew: FormControl<boolean>;
  id: FormControl<string | null>;
  signature: FormControl<string>,
  displayName: FormControl<string>,
  description: FormControl<string | null>,
  enabled: FormControl<boolean>,
  overrides: FormArray<FormRecord>;
  useCustomSignature: FormControl<boolean>;
  autoSignature: FormControl<string | null>;
}>;

// const CountryMetaSchema = CountryInfoSchema.pick({ native: true, iso2: true, iso3: true }).required();
type CountryMeta = Required<Pick<CountryInfo, 'native' | 'iso2' | 'iso3'>>;
type StateMeta = Required<Pick<StateInfo, 'name' | 'isoCode'>>;

@Component({
  selector: 'ev-feature-flags',
  viewProviders: [
    provideIcons({
      lucidePlus,
      lucideSave,
      lucideChevronDown,
      bootstrapCircleFill,
      heroQuestionMarkCircle,
      heroXMark,
      lucideTrash2
    }),
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ],
  imports: [
    HlmAccordionImports,
    HlmButtonDirective,
    HlmFormFieldModule,
    HlmSwitchImports,
    HlmInputDirective,
    ReactiveFormsModule,
    BrnSelectImports,
    BrnAlertDialogImports,
    HlmAlertDialogImports,
    HlmSelectImports,
    HlmHoverCardImports,
    BrnHoverCardImports,
    HlmBadgeImports,
    NgIcon
  ],
  templateUrl: './feature-flags.page.html',
  styleUrl: './feature-flags.page.scss'
})
export class FeatureFlagsPage implements PendingChanges {
  private project = select(currentProject);
  readonly stateCache = signal<Record<string, StateMeta[]>>({});
  private destroyRef = inject(DestroyRef);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  readonly forms = new FormArray<FeatureForm>([]);
  readonly countries = httpResource<CountryMeta[]>(() => `${environment.apiBaseUrl}/misc/countries?fields=native,iso2,iso3`, { defaultValue: [] });
  readonly overrideTypes = [
    { label: 'Geo zone', value: 'zone' },
    { label: 'CIDR block', value: 'cidr' },
    { label: 'IP address', value: 'ip' }
  ];
  readonly featureFlags = httpResource(() => `${environment.apiBaseUrl}/projects/${this.project()}/flags`, { defaultValue: [], parse: v => FeatureFlagSchema.array().parse(v) });
  deleteTimer?: number;
  deletingIndex = signal<number | null>(null);
  remainingDeletionTime = signal(5);
  deleteInProgress = signal<number | null>(null);
  readonly pendingChangesDialogState = signal<BrnDialogState>('closed');
  closeDialog: (discardPendingChanges: boolean) => void = () => { this.pendingChangesDialogState.set('closed'); };

  constructor() {
    effect(() => {
      const loadingError = this.featureFlags.error();
      if (!loadingError) return;
      toast.error('Could not load feature flags', { description: loadingError.message });
    });
    effect(() => {
      const flags = this.featureFlags.value();
      flags.forEach(flag => {
        let form = this.forms.controls.find(form => form.value.id === flag.id);
        let formIndex = this.forms.controls.findIndex(form => form.value.id === flag.id);
        form = this.toFeatureForm(flag, form);
        if (formIndex < 0) {
          this.forms.insert(0,form);
        } else {
          this.forms.removeAt(formIndex);
          this.forms.insert(formIndex, form);
        }
      });
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

      this.doDeleteFeature(index);
    })
  }
  hasPendingChanges(): CanDeactivateType {
    if (this.forms.pristine) return true;
    return new Observable<boolean>(subscriber => {
      debugger;
      this.closeDialog = (v) => {
        debugger;
        this.pendingChangesDialogState.set('closed');
        subscriber.add(() => this.closeDialog = () => { this.pendingChangesDialogState.set('closed'); });
        subscriber.next(!v);
        subscriber.complete();
      }
      this.pendingChangesDialogState.set('open');
    })
  }

  private doDeleteFeature(index: number) {
    const form = this.forms.at(index);
    const { id, displayName, isNew } = form.value;
    if (isNew) {
      this.forms.removeAt(index);
      this.resetDeletion();
      return;
    }
    // toast.loading('Removing feature...');
    this.deleteInProgress.set(index);
    this.http.delete(`${environment.apiBaseUrl}/projects/${this.project()}/flags/${id}`).subscribe({
      error: (e: HttpErrorResponse) => {
        toast.error('Could not remove feature: "' + displayName + '"', { description: e.error?.message ?? e.message });
        this.resetDeletion();
      },
      complete: () => {
        this.forms.removeAt(index);
        toast.success('Feature removed successfully');
        this.resetDeletion();
      }
    })
  }

  resetDeletion() {
    this.deletingIndex.set(null);
    clearInterval(this.deleteTimer);
    this.remainingDeletionTime.set(5);
    this.deleteTimer = undefined;
    this.deleteInProgress.set(null);
  }

  toggleFeature(index: number, newValue: boolean) {
    const form = this.forms.at(index);
    if (form.value.isNew) return;
    const previousValue = !newValue;
    toast.loading('Saving changes');
    this.http.patch(`${environment.apiBaseUrl}/projects/${this.project()}/flags/${form.value.id}`, { enabled: newValue }).subscribe({
      error: (e: HttpErrorResponse) => {
        toast.error('Could not update feature: "' + form.value.displayName + '"', { description: e.error?.message ?? e.message });
        form.controls.enabled.setValue(previousValue);
        form.controls.enabled.markAsUntouched();
        form.controls.enabled.markAsPristine();
        form.controls.enabled.updateValueAndValidity();
      },
      complete: () => {
        toast.success('Changes updated successfully');
      }
    })
  }

  discardFormChanges(index: number) {
    const data = this.featureFlags.value()[index];
    const form = this.toFeatureForm(data, this.forms.at(index));
    this.forms.removeAt(index);
    this.forms.insert(index, form);
  }

  private loadCountryStates(iso2: string) {
    this.http.get<StateMeta[]>(`${environment.apiBaseUrl}/misc/countries/${iso2}/states?fields=name,isoCode`).subscribe(data => {
      if (data.length == 0) return;
      this.stateCache.update(record => {
        record[iso2] = data;
        return record;
      });
    })
  }

  removeOverride(featureForm: FeatureForm, index: number) {
    featureForm.controls.overrides.removeAt(index);
  }

  toggleFormSignatureType(index: number) {
    const form = this.forms.at(index);
    form.controls.useCustomSignature.setValue(!form.value.useCustomSignature)
    if (form.value.useCustomSignature && form.value.isNew) {
      form.controls.signature.setValue('');
    } else if (form.value.autoSignature && form.value.isNew)
      form.controls.signature.setValue(form.value.autoSignature);
    form.controls.signature.markAsPristine();
    form.controls.signature.markAsUntouched();
    form.controls.signature.updateValueAndValidity();
  }

  submitForm(index: number, event: SubmitEvent) {
    event.preventDefault();
    const form = this.forms.at(index);
    const value = form.value;
    const project = this.project();
    if (!project) {
      location.reload();
      return;
    }
    toast.loading('Saving changes...');
    if (value.isNew === true) {
      try {
        const data = NewFeatureRequestSchema.parse(value);
        this.http.post(`${environment.apiBaseUrl}/projects/${project}/flags`, data).subscribe({
          error: (e: HttpErrorResponse) => {
            toast.error('Could not create feature: "' + value.displayName + '"', { description: e.error?.message ?? e.message });
          },
          complete: () => {
            this.forms.removeAt(index);
            this.featureFlags.reload();
            toast.success('Changes saved successfully');
          }
        })
      } catch (e) {
        toast.error(z.prettifyError(e as z.ZodError));
      }
    } else {
      const data = UpdateFeatureFlagRequestSchema.parse(value);
      try {
        this.http.patch(`${environment.apiBaseUrl}/projects/${project}/flags/${value.id}`, data).subscribe({
          next: (data) => {
            const flag = FeatureFlagSchema.parse(data);
            this.featureFlags.value.update(arr => {
              arr[index] = flag;
              return [...arr];
            });
            // this.toFeatureForm(flag, form);
          },
          error: (e: HttpErrorResponse) => {
            toast.error('Could not update feature: "' + value.displayName + '"', { description: e.error?.message ?? e.message });
          },
          complete: () => {
            toast.success('Changes saved successfully');
          }
        })
      } catch (e) {
        toast.error(z.prettifyError(e as z.ZodError));
      }
    }
  }

  private toFeatureForm(feature: FeatureFlag, form?: FeatureForm) {
    form = form ?? this.newFeatuerForm();
    form.patchValue({ ...feature, isNew: false, useCustomSignature: true });
    form.markAsPristine();
    form.markAsUntouched();
    form.updateValueAndValidity();
    return form;
  }

  addFeatureForm() {
    this.forms.insert(0, this.newFeatuerForm());
    this.forms.updateValueAndValidity();
  }

  addOverride(form: FeatureForm) {
    form.controls.overrides.insert(0, this.newOverrideForm());
    form.updateValueAndValidity();
  }

  private newFeatuerForm() {
    const autoSignature = generateRandomCode();
    return this.fb.group({
      description: this.fb.control(null),
      displayName: this.fb.nonNullable.control('', [Validators.required]),
      signature: this.fb.nonNullable.control(autoSignature, [Validators.required]),
      enabled: this.fb.nonNullable.control(false),
      isNew: this.fb.nonNullable.control<boolean>(true),
      overrides: this.fb.array<FormRecord>([]),
      id: this.fb.control<string | null>(`new_${Date.now()}`),
      useCustomSignature: this.fb.control(false),
      autoSignature: this.fb.control(autoSignature)
    }) as FeatureForm;
  }

  private newOverrideForm(type: OverrideType = 'zone') {
    const record = this.fb.record({
      trackingKey: this.fb.nonNullable.control(generateRandomCode()),
      type: this.fb.nonNullable.control(this.overrideTypes[0]),
      enabled: this.fb.nonNullable.control<boolean | string>(false, [Validators.required])
    });

    if (type == 'zone') this.prepareZoneOverride(record);
    else if (type == 'cidr') this.prepareCiderOverride(record);
    else if (type = 'ip') this.prepareIpOverride(record);
    else
      throw new Error('Invalid override form type: ' + type);

    record.controls['type'].valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      distinctUntilChanged()
    ).subscribe(t => {
      const { value: type } = t as unknown as { value: OverrideType };
      if (['zone', 'cidr', 'ip'].includes(type)) {
        Object.keys(record.controls)
          .filter(k => !['trackingKey', 'type', 'enabled'].includes(k))
          .forEach(k => record.removeControl(k));
      }
      if (type == 'zone') {
        this.prepareZoneOverride(record);
        record.controls['country'].valueChanges.pipe(
          takeUntilDestroyed(this.destroyRef),
          takeUntil(record.controls['type'].valueChanges.pipe(filter(v => v !== 'zone'))),
          filter(v => !!v),
          map(v => v as unknown as CountryMeta),
          filter(v => !(v.iso2 in this.stateCache()))
        ).subscribe(({ iso2 }) => {
          debugger;
          this.loadCountryStates(iso2);
        });
      }
      else if (type == 'cidr') this.prepareCiderOverride(record);
      else if (type == 'ip') this.prepareIpOverride(record);
      else toast.warning('Error', { description: 'Invalid type: ' + type })
    });
    return record;
  }

  private prepareZoneOverride(record: FormRecord) {
    record.addControl('country', this.fb.nonNullable.control<CountryMeta | null>(null, [Validators.required]));
    record.addControl('city', this.fb.control<string | null>(null));
    record.addControl('state', this.fb.control<string | null>(null));
  }

  private prepareCiderOverride(record: FormRecord) {
    record.addControl('cidrBlock', this.fb.nonNullable.control<string>('', [Validators.required]));
  }

  private prepareIpOverride(record: FormRecord) {
    record.addControl('ip', this.fb.nonNullable.control<string>('', [Validators.required]));
  }
}
