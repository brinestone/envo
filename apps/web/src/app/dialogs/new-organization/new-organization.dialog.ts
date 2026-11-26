import { Component, inject, OnInit, signal } from '@angular/core';
import {
  createMetadataKey,
  form,
  FormField,
  FormRoot,
  metadata,
  required,
} from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertCircle, lucideLoader } from '@ng-icons/lucide';
import { dispatch } from '@ngxs/store';
import { HlmAlertImports } from '@spartan/ui/alert';
import { HlmButton } from '@spartan/ui/button';
import { HlmDialogImports } from '@spartan/ui/dialog';
import { HlmFieldImports } from '@spartan/ui/field';
import { HlmInput } from '@spartan/ui/input';
import { HlmSpinner } from '@spartan/ui/spinner';
import { CreateOrganization } from '@store/organization/actions';
import z from 'zod';
import { randomName } from '../../../utils';

const PLACEHOLDER = createMetadataKey<string>();
const COMPUTED_ID = createMetadataKey<string | undefined>();

type FormModel = {
  name: string;
};

function defaultFormValue() {
  return { name: '' } as FormModel;
}
const slugger = z.string().slugify();
function uniqueSuffixGenerator() {
  return Date.now().toString().slice(-5);
}

@Component({
  viewProviders: [
    provideIcons({
      lucideLoader,
      lucideAlertCircle,
    }),
  ],
  imports: [
    NgIcon,
    FormRoot,
    HlmSpinner,
    HlmAlertImports,
    HlmButton,
    FormField,
    HlmFieldImports,
    HlmInput,
    HlmDialogImports,
  ],
  selector: 'ev-new-organization',
  styleUrl: './new-organization.dialog.scss',
  templateUrl: './new-organization.dialog.html',
})
export class NewOrganizationDialog implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected close() {
    this.router.navigate([{ outlets: { dialog: this.route.outlet } }], { relativeTo: this.route });
  }
  private readonly createOrganization = dispatch(CreateOrganization);
  private generatedIdSuffix = uniqueSuffixGenerator();
  protected formData = signal<FormModel>(defaultFormValue());
  protected readonly form = form(
    this.formData,
    (paths) => {
      required(paths.name, { message: 'This field is required' });
      metadata(paths.name, PLACEHOLDER, () => randomName());
      metadata(paths.name, COMPUTED_ID, ({ value }) => {
        let parsed = slugger.parse(value()).substring(0, 6);
        if (parsed.endsWith('-')) parsed = parsed.substring(0, parsed.length - 1);
        const elements = [this.generatedIdSuffix];
        if (parsed.length <= 0) return undefined;
        elements.unshift(parsed);
        return elements.join('-');
      });
    },
    {
      submission: {
        action: async (value) => {
          try {
            await this.createOrganization(this.computedId()!, value.name().value());
            return this.close();
          } catch (e) {
            const err = e as Error;
            return { message: err.message, kind: 'server' };
          } finally {
            this.generatedIdSuffix = uniqueSuffixGenerator();
          }
        },
      },
    },
  );
  protected readonly namePlaceholder = this.form.name().metadata(PLACEHOLDER)!;
  protected readonly computedId = this.form.name().metadata(COMPUTED_ID)!;
  ngOnInit(): void {}
}
