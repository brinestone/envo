import { Component, inject, signal } from '@angular/core';
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
import { dispatch, select } from '@ngxs/store';
import { HlmAlertImports } from '@spartan/ui/alert';
import { HlmButton } from '@spartan/ui/button';
import { HlmDialogImports } from '@spartan/ui/dialog';
import { HlmFieldImports } from '@spartan/ui/field';
import { HlmInput } from '@spartan/ui/input';
import { HlmSpinner } from '@spartan/ui/spinner';
import { CreateProject } from '@store/project/actions';
import { randomName } from '../../../utils';
import { activeOrg } from '@store/selectors';
import { z } from 'zod';
const PLACEHOLDER = createMetadataKey<string>();
const COMPUTED_SLUG = createMetadataKey<string | undefined>();

function suffixGenerator() {
  return Date.now().toString().slice(-5);
}
type FormModel = {
  name: string;
};
function defaultFormValue() {
  return { name: '' } as FormModel;
}

const slugger = z.string().slugify();
@Component({
  viewProviders: [provideIcons({ lucideLoader, lucideAlertCircle })],
  imports: [
    HlmAlertImports,
    HlmFieldImports,
    HlmDialogImports,
    NgIcon,
    FormRoot,
    FormField,
    HlmSpinner,
    HlmButton,
    HlmInput,
  ],
  selector: 'ev-new-project',
  styleUrl: './new-project.dialog.scss',
  templateUrl: './new-project.dialog.html',
})
export class NewProjectDialog {
  protected suffix = suffixGenerator();
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly currentOrg = select(activeOrg);
  protected close() {
    this.router.navigate([{ outlets: { dialog: this.route.outlet } }], { relativeTo: this.route });
  }
  private readonly createProject = dispatch(CreateProject);
  protected formData = signal<FormModel>(defaultFormValue());
  protected form = form(
    this.formData,
    (paths) => {
      required(paths.name, { message: 'This field is required' });
      metadata(paths.name, PLACEHOLDER, () => randomName());
      metadata(paths.name, COMPUTED_SLUG, ({ value }) => {
        let parsed = slugger.parse(value()).substring(0, 6);
        if (parsed.endsWith('-')) parsed = parsed.substring(0, parsed.length - 1);
        const elements = [this.suffix];
        if (parsed.length <= 0) return undefined;
        elements.unshift(parsed);
        return elements.join('-');
      });
    },
    {
      submission: {
        action: async (tree) => {
          try {
            await this.createProject(
              tree.name().value(),
              this.computedSlug()!,
              `https://api.dicebear.com/10.x/patchwork/svg?seed=${[this.currentOrg()?.slug ?? '', this.computedSlug()].filter((i) => !!i && i.length > 0).join('|')}`,
            );
            return this.close();
          } catch (e) {
            const err = e as Error;
            return { message: err.message, kind: 'server' };
          } finally {
            this.suffix = suffixGenerator();
          }
        },
      },
    },
  );
  protected readonly computedSlug = this.form.name().metadata(COMPUTED_SLUG)!;
  protected readonly placeholder = this.form.name().metadata(PLACEHOLDER)!;
}
