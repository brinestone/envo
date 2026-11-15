import { and, asc, eq, gt } from "drizzle-orm";
import { ulid } from "ulid";
import { events, projectLookups, projects } from "../db/schema";
import type { ConnectionLike, PaginationParams } from "../utils";

export async function lookupProjects(
  tx: ConnectionLike,
  params: PaginationParams & { organization: string },
) {
  const filters = [eq(projectLookups.organization, params.organization)];
  if (params.cursor) filters.push(gt(projectLookups.id, params.cursor));

  const data = await tx
    .select()
    .from(projectLookups)
    .where(and(...filters))
    .orderBy(asc(projectLookups.id))
    .offset(params.page * params.size)
    .limit(params.size);

  const totalRecords = await tx.$count(
    projectLookups,
    eq(projectLookups.organization, params.organization),
  );

  const totalPages = Math.ceil(totalRecords / params.size);
  const hasNextPage = params.page < totalPages;
  return { hasNextPage, size: data.length, data, totalRecords, totalPages };
}

export type NewProjectInput = {
  organization: string;
  name: string;
  creator: string;
  userId: string;
};
export async function createProject(
  tx: ConnectionLike,
  { organization, userId, name, creator }: NewProjectInput,
) {
  const projectId = ulid();
  const [project] = await tx
    .insert(projects)
    .values({
      image: `https://api.dicebear.com/10.x/disco/svg?seed=${projectId}`,
      id: projectId,
      name,
      organization,
      createdBy: creator,
    })
    .returning();

  await tx.insert(events).values({
    id: ulid(),
    note: "project added",
    target: project.id,
    targetType: "project",
    traceId: ulid(),
    organization,
    triggeredBy: creator,
    userId,
  });
  return project;
}
