const prefix = '[Project]';

export class LoadProjects {
  static readonly type = `${prefix} load projects`;
}
export class SetActiveProject {
  static readonly type = `${prefix} set active`;
  constructor(readonly id: string) {}
}

export class CreateProject {
  static readonly type = `${prefix} create project`;
  constructor(
    readonly name: string,
    readonly slug: string,
    readonly image?: string,
  ) {}
}
