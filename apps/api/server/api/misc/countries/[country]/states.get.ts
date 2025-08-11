import { StateInfoKeysSchema, StateInfoSchema } from '@envo/dto';
import { countries } from 'countries-list';
import { State } from 'country-state-city';
import z from 'zod';

const Schema = z.object({
  country: z.string().max(2).transform(v => v.toUpperCase()).refine(v => v in countries)
});

const FieldSchema = z.object({
  fields: z.string()
    .optional()
    .transform(arg => {
      if (!arg) return [];
      const segments = arg.split(',');
      return StateInfoKeysSchema.array().parse(segments);
    })
});

export default defineCachedEventHandler(async event => {
  let result = await getValidatedRouterParams(event, Schema.safeParse);
  if (!result.success) throw createError({
    statusCode: 400,
    statusMessage: 'Bad Request',
    message: z.prettifyError(result.error)
  });
  const countryCode = result.data.country;
  const { success, data, error } = await getValidatedQuery(event, FieldSchema.safeParse);
  if (!success) throw createError({
    statusCode: 400,
    statusMessage: 'Bad Request',
    message: z.prettifyError(error)
  });

  const { fields } = data;
  const states = State.getStatesOfCountry(countryCode);
  if (!fields || fields.length == 0) {
    return StateInfoSchema.array().parse(states);
  } else {
    return StateInfoSchema.pick(fields.reduce((acc, curr) => ({ ...acc, [curr]: true }), {})).array().parse(states);
  }


})