import { inject, Injectable } from '@angular/core';
import { Action, State, StateContext, StateToken } from '@ngxs/store';
import { AuthService } from '../../services/auth.service';
import { CompleteGithubSignIn, CredentialSignIn, CredentialSignUp, SignedIn, SignedOut, SignOut } from './actions';
import { patch } from '@ngxs/store/operators';
import { map, tap } from "rxjs";
import { Navigate } from "@ngxs/router-plugin";
import { AuthStateModel } from '../../../models';

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
    return this.authService.credentialSignUp(action)
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
      tap(({ user }) => ctx.setState(patch({
        user
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

