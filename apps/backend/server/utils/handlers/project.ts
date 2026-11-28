import { and, asc, eq, gt } from "drizzle-orm";
import { ulid } from "ulid";
import { events, projectLookups, projects } from "../db/schema";
import { session } from "../db/session";
import type { ConnectionLike, PaginationParams } from "../utils";

export type SetActiveProjectParams = {
  projectId: string;
  memberId: string;
  userId: string;
  organization: string;
  sessionId: string;
};
export async function setActiveProject(
  tx: ConnectionLike,
  params: SetActiveProjectParams,
) {
  await tx
    .update(session)
    .set({
      activeProjectId: params.projectId,
    })
    .where(eq(session.id, params.sessionId));

  await tx.insert(events).values({
    id: ulid(),
    traceId: ulid(),
    note: "session active project changed",
    target: params.sessionId,
    targetType: "session",
    organization: params.organization,
    userId: params.userId,
    triggeredBy: params.memberId,
  });
}

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
  image?: string;
  slug: string;
};
export async function createProject(
  tx: ConnectionLike,
  { organization, image, slug, userId, name, creator }: NewProjectInput,
) {
  const projectId = ulid();
  await tx.insert(projects).values({
    image: image ?? `https://api.dicebear.com/10.x/disco/svg?seed=${projectId}`,
    id: projectId,
    name,
    slug,
    organization,
    createdBy: creator,
  });
  await tx.insert(events).values({
    id: ulid(),
    note: "project added",
    target: projectId,
    targetType: "project",
    traceId: ulid(),
    organization,
    triggeredBy: creator,
    userId,
  });
  return await tx
    .select()
    .from(projectLookups)
    .where(eq(projectLookups.id, projectId))
    .then((v) => v[0]);
}
