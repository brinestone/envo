import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext, StateToken } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { AuthService } from '@services/auth.service';
import { Session, User } from 'better-auth/types';
import { tap } from 'rxjs';
import { EmailSignIn, EmailSignUp, GoogleSignIn, RefreshSession, SignedOut, SignOut } from './actions';

export type StateModel = {
    session?: Session;
    principal?: User;
    refreshAt?: Date;
};

type Context = StateContext<StateModel>;
const defaultStateValue: StateModel = {};

export const USER_STATE = new StateToken<StateModel>('user');

@State<StateModel>({
    name: USER_STATE,
    defaults: defaultStateValue
})
@Injectable()
export class UserState implements NgxsOnInit {
    private authService = inject(AuthService);
    ngxsOnInit(ctx: Context) {
        const cachedState = localStorage.getItem('user')
        if (cachedState) {
            const state = JSON.parse(cachedState) as StateModel;
            ctx.setState(state);
        }
        ctx.dispatch(RefreshSession);
    }

    @Action(RefreshSession)
    onRefreshSession(ctx: Context) {
        return this.authService.getSession().pipe(
            tap(({ data }) => {
                if (!data) {
                    ctx.dispatch(new SignOut());
                } else {
                    ctx.setState(patch({
                        principal: data.user,
                        session: data.session
                    }));
                }
            })
        );
    }

    @Action(EmailSignUp)
    onEmailSignUp(ctx: Context, { email, names, password }: EmailSignUp) {
        return this.authService.signUp(email, password, names).pipe(
            tap(({ user }) => ctx.setState(patch({
                principal: user
            })))
        )
    }

    @Action(GoogleSignIn)
    onGoogleSignIn(_: Context, { redirect }: GoogleSignIn) {
        return this.authService.googleSignIn(redirect);
    }

    @Action(EmailSignIn)
    onEmailSignIn(ctx: Context, { email, password, rememberMe }: EmailSignIn) {
        return this.authService.emailSignIn(email, password, rememberMe ?? false).pipe(
            tap(({ user }) => ctx.setState(patch({
                principal: user
            })))
        );
    }

    @Action(SignedOut)
    onSignedOut(ctx: Context) {
        // ;
    }

    @Action(SignOut)
    onSignOut(ctx: Context) {
        return this.authService.signOut().pipe(
            tap(() => {
                ctx.setState(defaultStateValue);
                ctx.dispatch(SignedOut);
            })
        );
    }
}
