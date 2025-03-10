import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { createAuthClient } from 'better-auth/client';
import { Session, User } from 'better-auth/types';
import { BehaviorSubject, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private sessionProvider = new BehaviorSubject<Session | null>(null);
  private userProvider = new BehaviorSubject<User | null>(null);

  get signedIn$() {
    return this.sessionProvider.pipe(map(s => !!s))
  }
  private sessionPrefetchPromise?: Promise<{ user: User, session: Session } | null>;
  private authClient = createAuthClient({
    baseURL: environment.apiOrigin

  })
  constructor() {
    from(this.authClient.getSession()).subscribe({
      next: ({ data, error }) => {
        this.userProvider.next(error ? null : data?.user ?? null);
        this.sessionProvider.next(error ? null : data?.session ?? null);
      },
      error: () => {
        this.userProvider.next(null);
        this.sessionProvider.next(null);
      }
    });
  }

  async signOut() {
    const result = await this.authClient.signOut();
    if (result.data?.success) {
      this.userProvider.next(null);
      this.sessionProvider.next(null);
    }
    return result;
  }

  async emailSignIn(email: string, password: string, rememberMe?: boolean) {
    return this.authClient.signIn.email({
      email, password, rememberMe,
    })
  }

  async googleSignIn(signInRedirect: string) {
    return this.authClient.signIn.social({
      provider: 'google',
      callbackURL: signInRedirect,
      // newUserCallbackURL: signUpRedirect
    })
  }
}
