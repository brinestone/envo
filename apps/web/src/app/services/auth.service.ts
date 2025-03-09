import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { createAuthClient } from 'better-auth/client';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authClient = createAuthClient({
    baseURL: environment.apiOrigin

  })
  constructor() { }

  async emailSignIn(email: string, password: string, rememberMe?: boolean) {
    return this.authClient.signIn.email({
      email, password, rememberMe,
    })
  }

  async googleConnect(signUpRedirect: string, signInRedirect: string) {
    return this.authClient.signIn.social({
      provider: 'google',
      callbackURL: signInRedirect,
      newUserCallbackURL: signUpRedirect
    })
  }
}
