import { inject, Injectable } from '@angular/core';
import { BETTER_AUTH } from '@providers/better-auth';
import { concatMap, from, of, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authClient = inject(BETTER_AUTH);

  getSession() {
    return from(this.authClient.getSession());
  }

  signUp(email: string, password: string, name: string) {
    return from(this.authClient.signUp.email({
      email, password, name
    })).pipe(
      switchMap(({ error, data }) => {
        if (error) return throwError(() => error);
        return of(data);
      })
    )
  }

  signOut() {
    return from(this.authClient.signOut()).pipe(
      switchMap(({ error, data }) => {
        if (error) return throwError(() => error);
        return of(data);
      })
    );
  }

  emailSignIn(email: string, password: string, rememberMe: boolean) {
    return from(this.authClient.signIn.email({
      email, password, rememberMe
    })).pipe(
      switchMap(({ error, data }) => {
        if (error) return throwError(() => error);
        return of(data);
      })
    )
  }

  googleSignIn(signInRedirect: string) {
    return from(this.authClient.signIn.social({
      provider: 'google',
      callbackURL: signInRedirect
    })).pipe(
      switchMap(({ error, data }) => {
        if (error) return throwError(() => error);
        return of(data);
      })
    );
  }
}
