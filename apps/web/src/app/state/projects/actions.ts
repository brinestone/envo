const prefix = '[project]';
export class NewProject {
    static type = `${prefix} new project`;
    constructor(readonly name: string) { }
}

export class SelectProject {
    static type = `${prefix} select project`;
    constructor(readonly id?: string) { }
}

export class SelectionChanged {
    static type = `${prefix} project selection changed`;
}

export class ToggleEnvironment {
    static type = `${prefix} toggle environment`;
    constructor(readonly id: string, readonly project: string) { }
}