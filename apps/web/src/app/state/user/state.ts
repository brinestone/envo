import { inject, Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext, StateToken } from '@ngxs/store';
import { AuthService } from '@services/auth.service';
import { Session, User } from 'better-auth/types';
import { tap } from 'rxjs';
import { EmailSignIn, EmailSignUp, GoogleSignIn, SignedOut, SignOut } from './actions';
import { patch } from '@ngxs/store/operators';

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
        this.authService.getSession().subscribe({
            next: ({ data, error }) => {
                if (error) {
                    console.error(error);
                    return;
                }

                const { session, user } = data;
                ctx.patchState({ session, principal: user });
            },
            error: console.error
        })
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
