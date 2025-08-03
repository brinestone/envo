import { Injectable } from '@angular/core';
import { createAuthClient } from 'better-auth/client';
import { from } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly client = createAuthClient();

  credentialSignUp(obj: { email: string, name: string, password: string }) {
    return from(this.client.signUp.email(obj))
  }

  signOut() {
    return from(this.client.signOut().then(({ data, error }) => {
      if (error) throw error;
      return data;
    }));
  }

  credentialSignIn(email: string, password: string, rememberMe = false) {
    return from(this.client.signIn.email({
      email,
      password,
      rememberMe
    }).then(({ data, error }) => {
      if (error) throw error;
      return data;
    }));
  }
}
