import { assertInInjectionContext, inject } from "@angular/core";
import { Actions, ActionType, ofActionCompleted, ofActionDispatched } from "@ngxs/store";
import { toSignal } from '@angular/core/rxjs-interop'
import { map, merge } from 'rxjs'

export function actionsInProgress(...actions: ActionType[]) {
  assertInInjectionContext(actionsInProgress);

  const $actions = inject(Actions);
  return toSignal(
    merge(
      ...actions.flatMap(action => [
        $actions.pipe(ofActionDispatched(action), map(() => true)),
        $actions.pipe(ofActionCompleted(action), map(() => false)),
      ])
    ),
    { initialValue: false }
  )
}
