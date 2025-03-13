export type ProjectLookup = {
    membership: string;
    id: string;
    role: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export type EnvironmentLookup = {
    name: string;
    id: string;
    totalConfigurations: number;
};

export type FeatureLookup = {
    name: string;
    id: string;
    enabled: boolean;
    environment: string;
}

export type ConfigLookup = {
    name: string;
    id: string;
    encryptedValue: string;
    secure: boolean;
}

export type DetailedProject = ProjectLookup & {
    environments: EnvironmentLookup[];
    totalConfigurations: number;
    totalFeatures: number;
    totalIntegrations: number;
}