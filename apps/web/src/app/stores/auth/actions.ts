const prefix = '[Auth]';

export class SignOut {
  static readonly type = `${prefix} sign out`;
}
export class EmailSignIn {
  static readonly type = `${prefix} email sign in`;
  constructor(
    readonly email: string,
    readonly password: string,
    readonly rememberMe: boolean = false,
  ) {}
}

export enum SocialIdentityProvider {
  Google = 'google',
}
export class SocialSignIn {
  static readonly type = `${prefix} social sign in`;
  constructor(
    readonly provider: SocialIdentityProvider,
    readonly redirect?: string,
  ) {}
}
