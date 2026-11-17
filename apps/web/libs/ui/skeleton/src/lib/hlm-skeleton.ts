import { Directive } from '@angular/core';
import { classes } from '@spartan/ui/utils';

@Directive({
  selector: '[hlmSkeleton],hlm-skeleton',
  exportAs: 'hlmSkeleton',
  host: {
    'data-slot': 'skeleton',
  },
})
export class HlmSkeleton {
  constructor() {
    classes(() => 'bg-muted rounded-none block motion-safe:animate-pulse');
  }
}
