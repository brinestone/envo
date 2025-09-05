import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormRecord, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { Control, form, property, required } from '@angular/forms/signals';
import { ClientTypeSchema, ClientType, SyncTransportSchema, SyncTransport } from '@envo/common';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { BrnSeparatorComponent } from '@spartan-ng/brain/separator';
import { HlmFormFieldModule } from '@spartan-ng/helm/form-field';
import { HlmInputDirective } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparatorDirective } from '@spartan-ng/helm/separator';
import { distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'ev-new-client',
  viewProviders: [
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HlmInputDirective,
    ReactiveFormsModule,
    BrnSelectImports,
    HlmSeparatorDirective,
    BrnSeparatorComponent,
    HlmFormFieldModule,
    HlmSelectImports
  ],
  templateUrl: './new-client.page.html',
  host: {
    'class': 'page mx-auto'
  },
  styleUrl: './new-client.page.scss'
})
export class NewClientPage {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  clientTypes = ClientTypeSchema.options;
  syncTransportTypes = SyncTransportSchema.options;
  form = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    type: new FormControl<ClientType | null>(null, [Validators.required]),
    metaFields: new FormRecord({})
  });
  get metaFields() {
    return this.form.controls.metaFields;
  }
  private clearMetaFieldsControls() {
    for (const controlName of Object.keys(this.metaFields.controls)) {
      this.metaFields.removeControl(controlName);
    }
  }

  constructor(destroyRef: DestroyRef) {
    this.form.controls.type.valueChanges.pipe(
      takeUntilDestroyed(),
      distinctUntilChanged()
    ).subscribe(v => {
      this.clearMetaFieldsControls();
      switch (v) {
        case 'server':
          const syncSubForm = new UntypedFormGroup({
            'transport': new FormControl<SyncTransport | null>(null, Validators.required),
          });
          const transportControl = syncSubForm.controls['transport'];
          transportControl.valueChanges.pipe(
            takeUntil(this.form.controls.type.valueChanges.pipe(
              takeUntilDestroyed(destroyRef),
              distinctUntilChanged()
            ))
          ).subscribe(transport => {
            for (const controlName of Object.keys(syncSubForm.controls)) {
              if (controlName == 'transport') continue;
              syncSubForm.removeControl(controlName);
            }
            switch (transport) {
              case 'webhook':
                syncSubForm.addControl('tokenHeader', new FormGroup({
                  name: new FormControl<string | null>('x-envo-webhook', [Validators.required]),
                  token: new FormControl<string | null>('', [Validators.required])
                }));
            }
          })
          this.metaFields.addControl('sync', syncSubForm);
          break;
      }
      this.cdr.markForCheck();
    });

    this.form.valueChanges.subscribe(v => console.log(v));
  }
}
