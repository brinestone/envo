import { createPropertySelectors, createSelector } from '@ngxs/store';
import { AUTH_STATE } from './auth';
import { ORG_STATE } from './organization';

const authSlices = createPropertySelectors(AUTH_STATE);
const orgSlices = createPropertySelectors(ORG_STATE);

export const orgs = orgSlices.organizations;
export const activeOrg = createSelector(
  [orgSlices.organizations, orgSlices.activeOrganization],
  (orgs, id) => {
    if (!id) return null;
    return orgs.find((o) => o.id == id) ?? null;
  },
);

export const principal = authSlices.principal;
export const signedIn = authSlices.signedIn;
