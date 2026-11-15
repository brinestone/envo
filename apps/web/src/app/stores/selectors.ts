import { createPropertySelectors } from "@ngxs/store";
import { AUTH_STATE } from "./auth";

const authSlices = createPropertySelectors(AUTH_STATE);

export const principal = authSlices.principal;
export const signedIn = authSlices.signedIn;
