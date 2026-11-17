import { Directive } from '@angular/core';
import { classes } from '@spartan/ui/utils';

@Directive({
  selector: '[hlmCardTitle]',
  exportAs: 'hlmCardTitle',
  host: { 'data-slot': 'card-title' },
})
export class HlmCardTitle {
  constructor() {
    classes(() => 'text-sm font-medium group-data-[size=sm]/card:text-sm');
  }
}
