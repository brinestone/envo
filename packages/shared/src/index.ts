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

export const NewVariableRequest = z.object({
  name: z.string(),
  fallbackValue: z.string(),
  isSecret: z.boolean().default(false)
});

export const Variable = z.object({
  id: z.uuid(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  isSecret: z.boolean(),
  fallbackMask: z.string()
});

export const PlatformType = z.enum(['web', 'mobile', 'cli', 'server']);
export const EnvironmentType = z.enum(['development', 'production', 'ci', 'staging']);
export const NewEnvironmentRequest = z.object({
  name: z.string(),
  type: EnvironmentType,
  isDefault: z.boolean().optional()
});

export const Environment = z.object({
  id: z.uuid(),
  name: z.string(),
  type: EnvironmentType,
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
});

export const EnvironmentNumericStat = z.object({
  type: z.literal('numeric'),
  count: z.coerce.number()
});

export const EnvironmentDateStat = z.object({
  type: z.literal('date'),
  value: z.coerce.date()
});

export const EnvironmentStat = z.discriminatedUnion('type', [EnvironmentNumericStat, EnvironmentDateStat])

export const UpdateVariableRequest = NewVariableRequest.partial();

export const Project = z.object({
  id: z.uuid(),
  name: z.string(),
  organization: z.string(),
  createdAt: z.coerce.date(),
  enabled: z.boolean(),
  updatedAt: z.coerce.date(),
});

export const FeatureZoneOverride = z.object({
  country: z.string().max(2),
  state: z.string().optional(),
  city: z.string().optional(),
  type: z.literal('zone'),
  enabled: z.union([z.boolean(), z.union([z.iso.datetime(), z.iso.date()])])
});

export const FeatureCidrOverride = z.object({
  cidr: z.union([z.cidrv4(), z.cidrv6()]),
  type: z.literal('cidr'),
  enabled: z.union([z.boolean(), z.union([z.iso.datetime(), z.iso.date()])])
});

export const FeatureIpOverride = z.object({
  ip: z.union([z.ipv4(), z.ipv6()]),
  type: z.literal('ip'),
  enabled: z.union([z.boolean(), z.union([z.iso.datetime(), z.iso.date()])])
});

export const FeatureValueOverride = z.discriminatedUnion('type', [
  FeatureZoneOverride,
  FeatureIpOverride,
  FeatureCidrOverride
]);

export const NewFeatureRequest = z.object({
  signature: string().describe('A unique identifier for this flag'),
  displayName: string().describe('A display name for this flag').optional(),
  description: string().optional().nullable().describe('A description of the feature'),
  enabled: boolean().default(false).optional().describe('Whether the feature should be enabled or not'),
  overrides: FeatureValueOverride.array().optional().default([]).describe('Zones where this feature should be available to agents'),
});

export const UpdateFeatureFlagRequest = NewFeatureRequest
  .partial();

export const FeatureFlag = NewFeatureRequest.extend({
  id: z.uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
}).omit({ overrides: true });

export const CountryInfo = z.object({
  name: z.string(),
  native: z.string(),
  phone: z.number().array(),
  currency: z.string().array(),
  iso3: z.string().max(3),
  iso2: z.string().max(2)
}).partial();

export const StateInfo = z.object({
  name: z.string(),
  isoCode: z.string(),
  countryCode: z.string(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable()
}).partial();

export const CountryInfoKeys = z.keyof(CountryInfo)
export const StateInfoKeys = z.keyof(StateInfo);
export type StateInfo = z.output<typeof StateInfo>;
export type CountryInfo = z.output<typeof CountryInfo>;
export type CountryInfoKeys = z.infer<typeof CountryInfoKeys>;
export type FeatureFlag = z.infer<typeof FeatureFlag>;
export type NeFeatureRequest = z.infer<typeof NewFeatureRequest>;
export type NewVariableRequest = z.infer<typeof NewVariableRequest>;
export type UpdateVariableRequest = z.output<typeof UpdateVariableRequest>;
export type UpdateFeatureFlagRequest = z.output<typeof UpdateFeatureFlagRequest>;
export type Variable = z.infer<typeof Variable>;
export type PlatformType = z.infer<typeof PlatformType>;
export type Project = z.infer<typeof Project>;
export type EnvironmentType = z.infer<typeof EnvironmentType>;
export type NewEnvironmentRequest = z.infer<typeof NewEnvironmentRequest>;
export type Environment = z.infer<typeof Environment>;
export type EnvironmentStat = z.infer<typeof EnvironmentStat>;
