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

export type EnvironmentVersion = {
    createdAt: Date;
    label: string;
    isActive: boolean;
}

export type DetailedConfiguration = {
    name: string;
    value?: string | null;
    version: string;
    secure: boolean;
};

export type DetailedFeature = {
    id: string;
    name: string;
    enabled: boolean;
    description?: string | null;
    version: string;
}

export type DetailedEnvironment = Omit<EnvironmentLookup, 'totalConfigurations'> & {
    enabled: boolean;
    configurations: DetailedConfiguration[];
    features: DetailedFeature[];
}