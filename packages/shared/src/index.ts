import { boolean, string, z } from 'zod';

export const ProjectSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  organization: z.string(),
  createdAt: z.coerce.date(),
  enabled: z.boolean(),
  updatedAt: z.coerce.date(),
});

export type Project = z.infer<typeof ProjectSchema>;

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
  overrides: FeatureValueOverrideSchema.array().optional().default([]).describe('Zones where this feature should be available to agents'),
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
export type UpdateFeatureFlagRequest = z.output<typeof UpdateFeatureFlagRequestSchema>;