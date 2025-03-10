import { createPropertySelectors, createSelector } from "@ngxs/store";
import { USER_STATE } from "./user";

const userSlices = createPropertySelectors(USER_STATE);
export const isSignedIn = createSelector([userSlices.principal, userSlices.session], (principal, session) => {
    return !!principal;
});