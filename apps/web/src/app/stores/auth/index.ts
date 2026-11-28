export * from './actions';
import { Service } from '@angular/core';
import { injectAuthClient, Principal } from '@libs/auth';
import { Navigate } from '@ngxs/router-plugin';
import { Action, NgxsOnInit, State, StateContext, StateToken } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { concatMap } from 'rxjs';
import {
  EmailSignIn,
  FinishOauthSignIn,
  RefreshSession,
  SessionRefreshed,
  SignedIn,
  SignOut,
  SocialSignIn,
} from './actions';
export type AuthStateModel = {
  signedIn: boolean;
  principal: Principal & { image: string };
};
export const AUTH_STATE = new StateToken<AuthStateModel>('auth');
const defaultState: AuthStateModel = {
  signedIn: false,
  // organizations: [],
  principal: {
    createdAt: new Date(),
    email: 'user@example.com',
    emailVerified: false,
    id: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
    name: 'User',
    image: `https://api.dicebear.com/10.x/initials/svg?seed=U`,
    updatedAt: new Date(),
  },
};
type Context = StateContext<AuthStateModel>;
@State({
  name: AUTH_STATE,
  defaults: defaultState,
})
@Service()
export class AuthStore implements NgxsOnInit {
  private readonly client = injectAuthClient();

  ngxsOnInit(ctx: Context): void {
    if (ctx.getState().signedIn) ctx.dispatch(RefreshSession);
  }

  @Action(FinishOauthSignIn)
  async onOauthFinish(ctx: Context, action: FinishOauthSignIn) {
    ctx.setState(
      patch({
        signedIn: true,
      }),
    );
    return ctx
      .dispatch(RefreshSession)
      .pipe(concatMap(() => ctx.dispatch(new Navigate([action.redirect]))));
  }

  @Action(RefreshSession, { cancelUncompleted: true })
  async onRefreshSession(ctx: Context) {
    const { data, error } = await this.client.getSession({
      fetchOptions: { signal: ctx.abortSignal },
    });
    if (error) throw error;

    if (!data) return;

    const { user, session } = data;
    ctx.setState(
      patch({
        principal: { ...user, image: user.image ?? defaultState.principal.image },
      }),
    );

    ctx.dispatch(new SessionRefreshed(session as any));
  }
  @Action(SignOut, { cancelUncompleted: true })
  async onSignOut(ctx: Context) {
    const { error } = await this.client.signOut();
    if (error) throw error;
    ctx.setState(defaultState);
    ctx.dispatch(new Navigate(['/'], {}, { onSameUrlNavigation: 'reload' }));
  }

  @Action(SocialSignIn, { cancelUncompleted: true })
  async onSocialSignIn(ctx: Context, { provider, redirect }: SocialSignIn) {
    await this.client.signIn.social(
      {
        provider,
        disableRedirect: false,
        callbackURL: redirect,
      },
      { signal: ctx.abortSignal },
    );
  }

  @Action(EmailSignIn, { cancelUncompleted: true })
  async onEmailSignIn(ctx: Context, { email, password, rememberMe }: EmailSignIn) {
    const { data, error } = await this.client.signIn.email(
      { email, password, rememberMe },
      { signal: ctx.abortSignal },
    );

    if (error) throw error;

    const { user } = data;

    ctx.setState(
      patch({
        signedIn: true,
        principal: { ...user, image: defaultState.principal.image },
      }),
    );

    const session = await this.client.getSession();
    if (session.error) throw session.error;

    ctx.dispatch(new SignedIn(session.data!.session as any));
  }
}
