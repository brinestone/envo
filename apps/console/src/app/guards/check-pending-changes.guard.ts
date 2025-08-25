import { CanDeactivateFn } from '@angular/router';
import { PendingChanges } from '../../models';

export const checkPendingChangesGuard: CanDeactivateFn<PendingChanges> = (component, currentRoute, currentState, nextState) => {
  return component.hasPendingChanges();
};
