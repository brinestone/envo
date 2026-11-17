import { Directive } from '@angular/core';
import { classes } from '@spartan/ui/utils';

@Directive({
  selector: '[hlmCardFooter],hlm-card-footer',
  exportAs: 'hlmCardFooter',
  host: { 'data-slot': 'card-footer' },
})
export class HlmCardFooter {
  constructor() {
    classes(() => 'rounded-none border-t p-(--card-spacing) flex items-center');
  }
}
