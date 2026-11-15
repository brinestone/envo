import { sql, type AnyColumn } from "drizzle-orm";
import type { useDatabase } from "./db";
import z from "zod";

export type ConnectionLike =
  | ReturnType<typeof useDatabase>
  | Parameters<Parameters<ReturnType<typeof useDatabase>["transaction"]>[0]>[0];

export function excluded(column: AnyColumn) {
  return sql`excluded.${sql.identifier(column.name)}`;
}

export const PaginationParams = z.object({
  page: z.coerce.number().min(0).default(0),
  size: z.coerce.number().min(1).default(100),
  cursor: z.string().trim().pipe(z.ulid()).optional(),
});

export type PaginationParams = z.output<typeof PaginationParams>;
