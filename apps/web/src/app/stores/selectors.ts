import { createPropertySelectors, createSelector } from '@ngxs/store';
import { AUTH_STATE } from './auth';
import { ORG_STATE } from './organization';
import { PROJECT_STORE } from './project';

const authSlices = createPropertySelectors(AUTH_STATE);
const orgSlices = createPropertySelectors(ORG_STATE);
const projSlices = createPropertySelectors(PROJECT_STORE);

export const avatar = createSelector([authSlices.principal], (principal) => {
  return principal.image;
});
export const orgs = orgSlices.organizations;
export const allOrgProjects = projSlices.projects;
export const activeProject = createSelector(
  [projSlices.projects, projSlices.active],
  (projects, activeId) => {
    if (!activeId) return null;
    return projects.find((p) => p.id == activeId) ?? null;
  },
);
export const activeOrg = createSelector(
  [orgSlices.organizations, orgSlices.activeOrganization],
  (orgs, id) => {
    if (!id) return null;
    return orgs.find((o) => o.id == id) ?? null;
  },
);

export const principal = authSlices.principal;
export const signedIn = authSlices.signedIn;
