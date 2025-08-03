import { createPropertySelectors, createSelector } from "@ngxs/store";
import { AUTH_STATE } from "./auth";

const authSlices = createPropertySelectors(AUTH_STATE);

export const principal = authSlices.user;

export const isUserSignedIn = authSlices.signedIn;
export const activeOrganization = authSlices.activeOrganizationId;
