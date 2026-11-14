import type { useDatabase } from "./db";

export type ConnectionLike =
  | ReturnType<typeof useDatabase>
  | Parameters<Parameters<ReturnType<typeof useDatabase>["transaction"]>[0]>[0];
