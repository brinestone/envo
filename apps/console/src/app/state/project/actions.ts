const prefix = '[projects]';

export class CreateProject {
  static type = `${prefix} new project`;
  constructor(readonly name: string, readonly org: string) { }
}

export class SelectProject {
  static type = `${prefix} select project`;
  constructor(readonly id: string) { }
}
