import { createPropertySelectors, createSelector } from "@ngxs/store";
import { USER_STATE } from "./user";
import { PROJECTS } from "./projects";

const userSlices = createPropertySelectors(USER_STATE);
export const isSignedIn = createSelector([userSlices.principal], (principal) => {
    return !!principal;
});

const projectSlices = createPropertySelectors(PROJECTS);
export const activeProject = createSelector([projectSlices.selectedProject], (x) => {
    return x?.id
});
export const environments = createSelector([projectSlices.selectedProject], (x) => {
    return x?.data.environments;
});
export const activeProjectInfo = createSelector([projectSlices.selectedProject], (x) => {
    return x?.data;
});
export const selectedEnvironment = createSelector([projectSlices.selectedEnvironment], (x) => x?.data);
export const environmentVersions = createSelector([projectSlices.selectedEnvironment], (x) => (x?.versions ?? []).sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()));