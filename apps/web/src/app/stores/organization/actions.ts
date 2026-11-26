const prefix = '[Organization]';
export class SelectOrganization {
  static readonly type = `${prefix} select organization`;
  constructor(readonly id: string) {}
}
export class CreateOrganization {
  static readonly type = `${prefix} create organization`;
  constructor(
    readonly slug: string,
    readonly name: string,
  ) {}
}
export class LoadOrganizations {
  static readonly type = `${prefix} load orgs`;
}
