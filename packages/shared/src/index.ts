import { boolean, string, z } from 'zod';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export function generateRandomCode(length = 20) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = Array<string>();
  for (let i = 0; i < length; i++) {
    result.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
  }
  return result.join('');
}

export function generateUniqueName(style: 'capital' | 'lowerCase' | 'upperCase' = 'lowerCase', separator = ' ') {
  return uniqueNamesGenerator({ separator, style, dictionaries: [adjectives, colors, animals] });
}

export const NewVariableRequestSchema = z.object({
  name: z.string(),
  fallbackValue: z.string(),
  isSecret: z.boolean().default(false)
});


export const PermissionTargetSchema = z.enum(['vars', 'flags', 'environments']);
export const ClientTypeSchema = z.enum(['web', 'server', 'function', 'android', 'ios']);
export const NewClientRequestSchema = z.object({
  name: z.string('The name field is required').nonempty('The name field is required').describe('The name of the new client to be created'),
  type: ClientTypeSchema.nullable(),
  metaFields: z.record(z.string(), z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.date()
  ])).optional(),
  permissions: z.object({
    allow: z.boolean(),
    targetGroup: PermissionTargetSchema,
    targetId: z.uuid().optional(),
  }).array().optional()
}).describe('Represents a user\'s intent to add a client to a project they have access to');

export const VariableSchema = NewVariableRequestSchema.pick({ isSecret: true })
  .extend({
    id: z.uuid(),
    name: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    fallbackMask: z.string()
  });

export const SyncTransportSchema = z.enum(['sse', 'websocket', 'webhook', 'poll', 'pub-sub']);
export const PlatformTypeSchema = z.enum(['web', 'mobile', 'cli', 'server']);
export const EnvironmentTypeSchema = z.enum(['development', 'production', 'ci', 'staging']);
export const NewEnvironmentRequestSchema = z.object({
  name: z.string(),
  type: EnvironmentTypeSchema,
  isDefault: z.boolean().optional()
});

export const EnvironmentSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  type: EnvironmentTypeSchema,
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export const EnvironmentNumericStatSchema = z.object({
  type: z.literal('numeric'),
  count: z.coerce.number()
});

export const EnvironmentDateStatSchema = z.object({
  type: z.literal('date'),
  value: z.coerce.date()
});

export const EnvironmentStatSchema = z.discriminatedUnion('type', [EnvironmentNumericStatSchema, EnvironmentDateStatSchema])

export const UpdateVariableRequestSchema = NewVariableRequestSchema.partial();

export const NewProjectRequestSchema = z.object({
  name: z.string().meta({
    description: 'The name of the project',
    title: 'Project name'
  })
});

export const ProjectSchema = NewProjectRequestSchema.extend({
  id: z.uuid(),
  organization: z.string(),
  createdAt: z.coerce.date(),
  enabled: z.boolean(),
  updatedAt: z.coerce.date(),
});

export const FeatureZoneOverrideSchema = z.object({
  country: z.string().max(2),
  state: z.string().optional(),
  city: z.string().optional(),
  type: z.literal('zone'),
  enabled: z.union([z.boolean(), z.union([z.iso.datetime(), z.iso.date()])])
});

export const FeatureCidrOverrideSchema = z.object({
  cidr: z.union([z.cidrv4(), z.cidrv6()]),
  type: z.literal('cidr'),
  enabled: z.union([z.boolean(), z.union([z.iso.datetime(), z.iso.date()])])
});

export const FeatureIpOverrideSchema = z.object({
  ip: z.union([z.ipv4(), z.ipv6()]),
  type: z.literal('ip'),
  enabled: z.union([z.boolean(), z.union([z.iso.datetime(), z.iso.date()])])
});

export const FeatureValueOverrideSchema = z.discriminatedUnion('type', [
  FeatureZoneOverrideSchema,
  FeatureIpOverrideSchema,
  FeatureCidrOverrideSchema
]);

export const NewFeatureRequestSchema = z.object({
  signature: string().describe('A unique identifier for this flag'),
  displayName: string().describe('A display name for this flag').optional(),
  description: string().optional().nullable().describe('A description of the feature'),
  enabled: boolean().default(false).optional().describe('Whether the feature should be enabled or not'),
  overrides: FeatureValueOverrideSchema.array().optional().default([]).describe('Zones where this feature should be available to clients'),
});

export const UpdateFeatureFlagRequestSchema = NewFeatureRequestSchema
  .partial();

export const FeatureFlagSchema = NewFeatureRequestSchema.extend({
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).omit({ overrides: true });

export const CountryInfoSchema = z.object({
  name: z.string(),
  native: z.string(),
  phone: z.number().array(),
  currency: z.string().array(),
  iso3: z.string().max(3),
  iso2: z.string().max(2)
}).partial();

export const StateInfoSchema = z.object({
  name: z.string(),
  isoCode: z.string(),
  countryCode: z.string(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable()
}).partial();

export const CountryInfoKeysSchema = z.keyof(CountryInfoSchema)
export const StateInfoKeysSchema = z.keyof(StateInfoSchema);
export type StateInfo = z.output<typeof StateInfoSchema>;
export type CountryInfo = z.output<typeof CountryInfoSchema>;
export type CountryInfoKeys = z.infer<typeof CountryInfoKeysSchema>;
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type NeFeatureRequest = z.infer<typeof NewFeatureRequestSchema>;
export type NewVariableRequest = z.infer<typeof NewVariableRequestSchema>;
export type UpdateVariableRequest = z.output<typeof UpdateVariableRequestSchema>;
export type UpdateFeatureFlagRequest = z.output<typeof UpdateFeatureFlagRequestSchema>;
export type Variable = z.infer<typeof VariableSchema>;
export type PlatformType = z.infer<typeof PlatformTypeSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type EnvironmentType = z.infer<typeof EnvironmentTypeSchema>;
export type NewEnvironmentRequest = z.infer<typeof NewEnvironmentRequestSchema>;
export type Environment = z.infer<typeof EnvironmentSchema>;
export type EnvironmentStat = z.infer<typeof EnvironmentStatSchema>;
export type NewProjectRequest = z.infer<typeof NewProjectRequestSchema>;
export type NewClientRequest = z.infer<typeof NewClientRequestSchema>;
export type ClientType = z.output<typeof ClientTypeSchema>;
export type SyncTransport = z.output<typeof SyncTransportSchema>;