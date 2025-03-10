import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GoogleButton } from '@components/google-button';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch } from '@ngxs/store';
import { EmailSignIn, GoogleSignIn } from '@state/user';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Checkbox } from 'primeng/checkbox';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';

@Component({
  selector: 'app-sign-in',
  imports: [Divider, ReactiveFormsModule, RouterLink, Checkbox, Message, GoogleButton, Card, Button, InputText, Password],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {
  private redirect = injectQueryParams('continue', { initialValue: '/' });
  private navigate = dispatch(Navigate);
  private emailSignIn = dispatch(EmailSignIn);
  private googleSignIn = dispatch(GoogleSignIn);
  readonly signingIn = signal(false);
  readonly errMessage = signal('');
  readonly form = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(false)
  });

  ngOnInit() {
    // this.authService.signOut();
  }

  onFormSubmit() {
    this.signingIn.set(true);
    this.errMessage.set('');
    const { email, password, rememberMe } = this.form.value;
    this.emailSignIn(String(email), String(password), Boolean(rememberMe)).subscribe({
      error: (e: Error) => {
        console.error(e);
        this.errMessage.set(e.message);
        this.signingIn.set(false);
      },
      complete: () => {
        this.signingIn.set(false);
        this.navigate([this.redirect() ?? '/']);
      }
    })
  }

  onGoogleSignInButtonClicked() {
    this.signingIn.set(true);
    this.errMessage.set('');
    this.googleSignIn(location.origin + (this.redirect() ?? '/')).subscribe({
      error: (e: Error) => {
        console.error(e);
        this.errMessage.set(e.message);
        this.signingIn.set(false);
      },
      complete: () => {
        this.signingIn.set(false);
        // this.navigate([this.redirect() ?? '/']);
      }
    })
  }
}
