export * from './actions';
import { Service } from '@angular/core';
import { injectAuthClient, Principal } from '@libs/auth';
import { Action, State, StateContext, StateToken } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { EmailSignIn, SignOut, SocialSignIn } from './actions';
import { Navigate } from '@ngxs/router-plugin';
export type AuthStateModel = {
  signedIn: boolean;
  principal: Principal;
};
export const AUTH_STATE = new StateToken<AuthStateModel>('auth');
const defaultState: AuthStateModel = {
  signedIn: false,
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
export class AuthStore {
  private readonly client = injectAuthClient();

  @Action(SignOut, { cancelUncompleted: true })
  async onSignOut(ctx: Context) {
    const { error } = await this.client.signOut();
    if (error) throw error;
    ctx.setState(defaultState);
    ctx.dispatch(new Navigate(['/']));
  }

  @Action(SocialSignIn, { cancelUncompleted: true })
  async onSocialSignIn(ctx: Context, { provider, redirect }: SocialSignIn) {
    const { error, data: response } = await this.client.signIn.social(
      {
        provider,
        disableRedirect: false,
        callbackURL: redirect,
      },
      { signal: ctx.abortSignal },
    );

    if (response) {
      location.href = response.url!;
    }

    if (error) throw error;
    const { data, error: err } = await this.client.getSession();
    if (err) throw err;

    if (!data) return;
    const { user } = data;
    ctx.setState(
      patch({
        signedIn: true,
        principal: user,
      }),
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

    ctx.setState({
      signedIn: true,
      principal: user,
    });
  }
}
