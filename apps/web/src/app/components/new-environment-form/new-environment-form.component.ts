import { HttpClient } from '@angular/common/http';
import { Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '@env/environment.development';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';

export type NewEnvironmentResponse = {
  id: string;
}

@Component({
  selector: 'app-new-environment-form',
  imports: [ReactiveFormsModule, Button, InputText, Message],
  templateUrl: './new-environment-form.component.html',
  styleUrl: './new-environment-form.component.scss'
})
export class NewEnvironmentFormComponent {
  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });
  readonly submitting = signal(false);
  readonly created = output<NewEnvironmentResponse>();
  readonly error = output<Error>();
  readonly project = input.required<string>();

  private readonly http = inject(HttpClient);

  onFormSubmit(event: SubmitEvent) {
    event.preventDefault();
    this.submitting.set(true);
    this.http.post<NewEnvironmentResponse>(`${environment.apiBase}/projects/${this.project()}/environments`, this.form.value).subscribe({
      next: (x) => {
        this.created.emit(x);
      },
      error: (error: Error) => {
        this.error.emit(error);
        this.submitting.set(false);
      },
      complete: () => {
        this.form.reset();
        this.submitting.set(false);
      }
    });
  }
}
