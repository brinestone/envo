import { Injectable } from '@angular/core';
import { createAuthClient } from 'better-auth/client';
import { organizationClient } from "better-auth/client/plugins"
import { concatMap, from, of, switchMap, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly client = createAuthClient({
    plugins: [
      organizationClient()
    ]
  });

  getOrganizations() {
    return from(this.client.organization.list()).pipe(
      switchMap(({ error, data }) => {
        if (error) return throwError(() => error);
        return of(data);
      })
    )
  }

  getSession() {
    return from(this.client.getSession()).pipe(
      switchMap(({ error, data }) => {
        if (error) return throwError(() => error);
        return of(data);
      })
    );
  }

  credentialSignUp(obj: { email: string, name: string, password: string }) {
    return from(this.client.signUp.email(obj)).pipe(
      switchMap(({ error, data }) => {
        if (error) return throwError(() => error);
        return of(data);
      })
    )
  }

  signOut() {
    return from(this.client.signOut()).pipe(
      switchMap(({ error, data }) => {
        if (error) return throwError(() => error);
        return of(data);
      })
    );
  }

  credentialSignIn(email: string, password: string, rememberMe = false) {
    return from(this.client.signIn.email({
      email,
      password,
      rememberMe
    })).pipe(
      concatMap(() => this.client.getSession()),
      switchMap(({ error, data }) => {
        debugger;
        if (error) return throwError(() => error);
        else if (!data) return throwError(() => new Error('An error occurred'));
        return of(data);
      })
    );
  }
}
