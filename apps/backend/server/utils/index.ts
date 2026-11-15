import { HTTPError, type H3Event } from "nitro";
import { getValidatedQuery, readValidatedBody, getValidatedRouterParams } from "nitro/h3";
import { z } from "zod";

export async function validateRouterZod<TSchema extends z.ZodObject>(
  schema: TSchema,
  event: H3Event,
) {
  const { data, error, success } = await getValidatedRouterParams(event, (v) =>
    schema.safeParse(v),
  );

  if (!success)
    throw HTTPError.status(400, "Bad Request", {
      message: z.prettifyError(error),
      data: z.treeifyError(error),
    });

  return data;
}

export async function validateBodyZod<TSchema extends z.ZodObject>(
  schema: TSchema,
  event: H3Event,
) {
  const { data, error, success } = await readValidatedBody(event, (v) => schema.safeParse(v));
  if (!success)
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: z.prettifyError(error),
      data: z.treeifyError(error),
    });

  return data;
}

export async function validateQueryZod<TSchema extends z.ZodObject>(
  schema: TSchema,
  event: H3Event,
) {
  const { data, error, success } = await getValidatedQuery(event, (v) => schema.safeParse(v));

  if (!success)
    throw new HTTPError({
      status: 400,
      statusText: "Bad Request",
      message: z.prettifyError(error),
      data: z.treeifyError(error),
    });

  return data;
}
