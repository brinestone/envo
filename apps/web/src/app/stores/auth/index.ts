export * from "./actions";
import { Service } from "@angular/core";
import { injectAuthClient, Principal } from "@libs/auth";
import { Action, State, StateContext, StateToken } from "@ngxs/store";
import { EmailSignIn } from "./actions";
export type AuthStateModel = {
  signedIn: boolean;
  principal?: Principal;
};
export const AUTH_STATE = new StateToken<AuthStateModel>("auth");
const defaultState: AuthStateModel = {
  signedIn: false,
};
type Context = StateContext<AuthStateModel>;
@State({
  name: AUTH_STATE,
  defaults: defaultState,
})
@Service()
export class AuthStore {
  private readonly client = injectAuthClient();

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
