const prefix = '[user]'
export class EmailSignIn {
    static type = `${prefix} sign in`;
    constructor(readonly email: string, readonly password: string, readonly rememberMe?: boolean) { }
}

export class SignedOut {
    static type = `${prefix} signed out`;
}

export class SignOut {
    static type = `${prefix} sign out`;
}

export class EmailSignUp {
    static type = `${prefix} sign up`;
    constructor(readonly names: string, readonly email: string, readonly password: string) { }
}

export class GoogleSignIn {
    static type = `${prefix} google sign in`;
    constructor(readonly redirect: string) { }
}

export class RefreshSession {
    static type = `${prefix} refresh session`;
}