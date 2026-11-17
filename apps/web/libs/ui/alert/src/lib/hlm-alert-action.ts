import { Directive } from '@angular/core';
import { classes } from '@spartan/ui/utils';

@Directive({
  selector: '[hlmAlertAction]',
  exportAs: 'hlmAlertAction',
  host: {
    'data-slot': 'alert-action',
  },
})
export class HlmAlertAction {
  constructor() {
    classes(() => 'absolute end-[calc(--spacing(1.25))] top-[calc(--spacing(1.25))]');
  }
}
