const prefix = '[project]';
export class NewProject {
    static type = `${prefix} new project`;
    constructor(readonly name: string) { }
}

export class SelectProject {
    static type = `${prefix} select project`;
    constructor(readonly id?: string) { }
}

export class ProjectSelectionChanged {
    static type = `${prefix} project selection changed`;
}

export class ToggleEnvironment {
    static type = `${prefix} toggle environment`;
    constructor(readonly id: string, readonly project: string) { }
}

export class SelectEnvironment {
    static type = `${prefix} select project environment`;
    constructor(readonly id?: string) { }
}

export class EnvironmentSelectionChanged {
    static type = `${prefix} environment selection changed`;
}

export class CreateEnvironmentVersion {
    static type = `${prefix} new environment version`;
    constructor(readonly makeActive: boolean, readonly environment: string, readonly project: string, readonly label?: string) { }
}

export class SetActiveEnvironmentVersion {
    static type = `${prefix} set active environment version`;
    constructor(readonly name: string, readonly project: string, readonly env: string){}
}