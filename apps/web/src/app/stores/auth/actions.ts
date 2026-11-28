import { Session } from 'better-auth';

const prefix = '[Auth]';

export class FinishOauthSignIn {
  static readonly type = `${prefix} finish social sign in`;
  constructor(readonly redirect: string) {}
}

export class SessionRefreshed {
  static readonly type = `${prefix} session refreshed`;
  constructor(
    readonly session: Session & { activeProjectId: string; activeOrganizationId: string },
  ) {}
}

export class RefreshSession {
  static readonly type = `${prefix} refresh session`;
}

export type SessionWIthActiveProject = Session & { activeProjectId: string };

export type SessionWithActivatedOrganization = Session & { activeOrganizationId: string };
export class SignedIn {
  static readonly type = `${prefix} signed in`;
  constructor(readonly session: SessionWithActivatedOrganization) {}
}

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
