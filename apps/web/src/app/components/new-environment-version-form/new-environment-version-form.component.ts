import { Component, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { dispatch } from '@ngxs/store';
import { CreateEnvironmentVersion } from '@state/projects';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-new-environment-version-form',
  imports: [ReactiveFormsModule, Button, InputText, Checkbox, Message],
  templateUrl: './new-environment-version-form.component.html',
  styleUrl: './new-environment-version-form.component.scss'
})
export class NewEnvironmentVersionFormComponent {
  private readonly createVersion = dispatch(CreateEnvironmentVersion);
  readonly submitted = output();
  readonly project = input.required<string>();
  readonly environment = input.required<string>();
  readonly submitting = signal(false);
  readonly errMessage = signal('');
  readonly form = new FormGroup({
    label: new FormControl<string | undefined>(undefined),
    makeActive: new FormControl<boolean>(true)
  });

  onFormSubmit(event: SubmitEvent) {
    event.preventDefault();

    this.submitting.set(true);
    this.errMessage.set('');
    const { label, makeActive } = this.form.value;
    this.createVersion(makeActive as boolean, this.environment(), this.project(), label ?? undefined).subscribe({
      error: (error: Error) => {
        this.errMessage.set(error.message);
        this.submitting.set(false);
      },
      complete: () => {
        this.submitting.set(false);
        this.submitted.emit();
        this.form.reset();
      }
    })
  }
}
