import { inject, Injectable } from '@angular/core';
import { Navigate } from "@ngxs/router-plugin";
import { Action, State, StateContext, StateToken } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { concatMap, of, switchMap, tap, throwError } from "rxjs";
import { AuthStateModel } from '../../../models';
import { AuthService } from '../../services/auth';
import { CompleteGithubSignIn, CredentialSignIn, CredentialSignUp, GetOrganizations, SignedIn, SignedOut, SignOut } from './actions';
import { PrincipalSchema } from '../../../schemas';
import z from 'zod';

export const AUTH_STATE = new StateToken<AuthStateModel>('auth');
type Context = StateContext<AuthStateModel>;

@State({
  name: AUTH_STATE,
  defaults: { signedIn: false }
})
@Injectable()
export class AuthState {
  private readonly authService = inject(AuthService);

  @Action(CredentialSignUp, { cancelUncompleted: true })
  onCredentialSignUp(ctx: Context, action: CredentialSignUp) {
    return this.authService.credentialSignUp(action).pipe(
      concatMap(() => this.authService.getSession().pipe(
        switchMap(data => {
          if (!data) return throwError(() => new Error('Invalid session'));
          return of(data);
        })
      )),
      tap(({ session, user }) => {
        ctx.setState(patch({
          signedIn: true,
          user: PrincipalSchema.parse(user),
          sessionExpiresAt: z.coerce.date().parse(session.expiresAt),
          activeOrganizationId: session.activeOrganizationId ?? undefined
        }))
      })
    )
  }

  @Action(SignOut, { cancelUncompleted: true })
  onSignOut(ctx: Context) {
    return this.authService.signOut().pipe(
      tap(() => ctx.dispatch(SignedOut))
    )
  }

  @Action(SignedIn)
  onSignedIn(ctx: Context) {
    ctx.setState(patch({ signedIn: true }));
  }

  @Action(SignedOut, { cancelUncompleted: true })
  onSignedOut(ctx: Context) {
    ctx.setState({ signedIn: false });
    ctx.dispatch(new Navigate(['/']));
    location.reload();
  }

  @Action(CredentialSignIn, { cancelUncompleted: true })
  onCredentialSignIn(ctx: Context, { email, password }: CredentialSignIn) {
    return this.authService.credentialSignIn(email, password).pipe(
      tap(({ user, session }) => ctx.setState(patch({
        user,
        activeOrganizationId: session.activeOrganizationId ?? undefined,
        sessionExpiresAt: session.expiresAt ?? undefined
      }))),
      tap(() => ctx.dispatch(SignedIn))
    )
  }

  @Action(CompleteGithubSignIn, { cancelUncompleted: true })
  onGitHubSignIn(ctx: Context, { jwt }: CompleteGithubSignIn) {
    alert('not implemented');
    // const payload = jwtDecode(jwt);
    // const userInfo = PrincipalSchema.parse(payload);
    // if (payload.exp === undefined) throw new Error('Token is invalid');
    // ctx.setState(patch({
    //   token: jwt,
    //   userInfo,
    //   provider: 'github',
    //   sessionExpiresAt: new Date(payload.exp * 1000)
    // }));
    // ctx.dispatch(SignedIn);
  }
}

// export * from './actions';

