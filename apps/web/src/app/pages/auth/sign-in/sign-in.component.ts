import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { GoogleButton } from '@components/google-button';
import { AuthService } from '@services/auth.service';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Message } from 'primeng/message';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import { Checkbox } from 'primeng/checkbox';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, RouterLink, Checkbox, Message, GoogleButton, Card, Button, InputText, Password],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {
  private authService = inject(AuthService);
  private redirect = injectQueryParams('continue', { initialValue: '/' });
  readonly title = inject(Title);
  readonly signingIn = signal(false);
  readonly errMessage = signal('');
  readonly form = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(false)
  });

  ngOnInit() {
    this.authService.signOut();
  }

  async onFormSubmit() {
    this.signingIn.set(true);
    this.errMessage.set('');
    try {
      const { email, password, rememberMe } = this.form.value;
      const { error } = await this.authService.emailSignIn(String(email), String(password), Boolean(rememberMe));
      this.errMessage.set(error?.message ?? '');
    } catch (e) {
      this.errMessage.set((e as Error).message);
    } finally {
      this.signingIn.set(false);
    }
  }

  async onGoogleSignInButtonClicked() {
    const { error } = await this.authService.googleSignIn(location.origin + (this.redirect() ?? '/'));
    this.errMessage.set(error?.message ?? '');
  }
}
