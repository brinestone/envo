import { createPropertySelectors } from "@ngxs/store";
import { AUTH_STATE } from "./auth";
import { PROJECTS } from "./project";

const authSlices = createPropertySelectors(AUTH_STATE);
const projectSlices = createPropertySelectors(PROJECTS);

export const principal = authSlices.user;

export const isUserSignedIn = authSlices.signedIn;
export const activeOrganization = authSlices.activeOrganizationId;
export const currentProject = projectSlices.activeProject;
