import { Directive, input } from '@angular/core';
import { classes } from '@spartan/ui/utils';

@Directive({
  selector: 'legend[hlmFieldLegend]',
  exportAs: 'hlmFieldLegend',
  host: {
    'data-slot': 'field-legend',
    '[attr.data-variant]': 'variant()',
  },
})
export class HlmFieldLegend {
  public readonly variant = input<'label' | 'legend'>('legend');

  constructor() {
    classes(() => 'mb-2.5 font-medium data-[variant=label]:text-xs data-[variant=legend]:text-sm');
  }
}
