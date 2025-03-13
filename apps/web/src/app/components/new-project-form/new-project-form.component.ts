import { Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';

export type NewFormSubmission = {
  name: string;
}

@Component({
  selector: 'app-new-project-form',
  imports: [ReactiveFormsModule, Button, InputText, Message],
  templateUrl: './new-project-form.component.html',
  styleUrl: './new-project-form.component.scss'
})
export class NewProjectFormComponent {
  readonly onSubmit = output<NewFormSubmission>();
  readonly submitting = input<boolean>();
  readonly errMessage = input<string>();
  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  onFormSubmit(e: SubmitEvent) {
    e.preventDefault();
    const submission = { name: String(this.form.value.name) };
    this.onSubmit.emit(submission);
    this.form.reset();
  }
}
