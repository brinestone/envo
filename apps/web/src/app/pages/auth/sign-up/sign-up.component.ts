import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GoogleButton } from '@components/google-button';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch } from '@ngxs/store';
import { EmailSignUp, GoogleSignIn } from '@state/user';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';

@Component({
  selector: 'app-sign-up',
  imports: [Divider, ReactiveFormsModule, RouterLink, Message, GoogleButton, Card, Button, InputText, Password],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent implements OnInit {
  private navigate = dispatch(Navigate);
  private signUp = dispatch(EmailSignUp);
  private googleSignIn = dispatch(GoogleSignIn);

  errMessage = signal('');
  signingUp = signal(false);
  router = inject(Router);
  readonly form = new FormGroup({
    names: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    // this.authService.signOut();
  }

  onFormSubmit() {
    this.signingUp.set(true);
    this.errMessage.set('');
    const { names, email, password } = this.form.value;

    this.signUp(String(email), String(password), String(names)).subscribe({
      error: (error: Error) => {
        this.signingUp.set(false);
        this.errMessage.set(error.message);
      },
      complete: () => {
        this.signingUp
        this.navigate(['/']);
      }
    });
  }

  onGoogleButtonClicked() {
    this.googleSignIn(location.origin).subscribe({
      error: (error: Error) => {
        this.signingUp.set(false);
        this.errMessage.set(error.message);
      },
      complete: () => {
        this.signingUp.set(false);
        this.router.navigate(['/']);
      }
    });
  }
}
