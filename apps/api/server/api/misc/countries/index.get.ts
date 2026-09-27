import { CountryInfoKeys, CountryInfo } from "@envo/common";
import { getCountryDataList } from 'countries-list';
import z from "zod";

const Field = z.object({
  fields: z.string()
    .optional()
    .transform(arg => {
      if (!arg) return [];
      const segments = arg.split(',');
      return CountryInfoKeys.array().parse(segments);
    })
})
export default defineCachedEventHandler(async event => {
  const { success, data, error } = await getValidatedQuery(event, Field.safeParse);
  if (!success) throw createError({
    statusCode: 400,
    message: z.prettifyError(error),
    statusMessage: 'Bad Request'
  });

  const { fields } = data;
  const countries = getCountryDataList();
  if (!fields || fields.length == 0) {
    return countries.map((country) => CountryInfo.parse(country))
  } else {
    return CountryInfo.pick(fields.reduce((acc, curr) => ({ ...acc, [curr]: true }), {})).array().parse(countries);
  }
});
