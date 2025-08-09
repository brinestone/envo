import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSave } from '@ng-icons/lucide';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { HlmFormFieldModule } from '@spartan-ng/helm/form-field';
import { HlmInputDirective } from '@spartan-ng/helm/input';
import z from 'zod';

const FormSchema = z.object({
  name: z.string()
});

export type Submission = z.infer<typeof FormSchema>;

@Component({
  selector: 'ev-new-project-form',
  viewProviders: [
    provideIcons({ lucideSave }),
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ],
  imports: [
    ReactiveFormsModule,
    HlmFormFieldModule,
    HlmButtonDirective,
    HlmInputDirective,
    NgIcon
  ],
  template: `
    <form (ngSubmit)="onFormSubmit($event)" [formGroup]="form" class="space-y-2">
      <hlm-form-field>
        <input hlmInput placeholder="Project Name" formControlName="name">
        <hlm-error>This field is required</hlm-error>
      </hlm-form-field>
      <div>
        <button [disabled]="form.invalid || inProgress()" hlmBtn type="submit" class="flex w-full">
          <ng-icon name="lucideSave"/>
          <span>
            @if(!inProgress()) {
              Create project
            }@else {
              Create project...
            }
          </span>
        </button>
      </div>
    </form>
  `,
  styleUrl: './new-project-form.scss'
})
export class NewProjectForm {
  readonly onSubmit = output<Submission>()
  readonly inProgress = input<boolean>();
  readonly form = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
  });

  onFormSubmit(event: SubmitEvent) {
    event.preventDefault();
    const value = FormSchema.parse(this.form.value);
    this.onSubmit.emit(value);
  }
}
