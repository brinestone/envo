import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Environment, EnvironmentStat } from '@envo/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClock, lucideClockAlert, lucideComputer, lucideLogs, lucideTrash2 } from '@ng-icons/lucide';
import { BrnTabsImports } from '@spartan-ng/brain/tabs';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';

@Component({
  selector: 'ev-environment-info',
  viewProviders: [
    provideIcons({
      lucideComputer,
      lucideClock,
      lucideClockAlert,
      lucideTrash2
    })
  ],
  imports: [
    DecimalPipe,
    NgIcon,
    DatePipe,
    HlmTabsImports,
    BrnTabsImports,
    HlmButtonDirective
  ],
  templateUrl: './environment-info.html',
  styleUrl: './environment-info.scss'
})
export class EnvironmentInfo {
  readonly delete = output<string | undefined>();
  readonly stats: (EnvironmentStat & { icon: string; label: string; })[] = [
    { label: 'Agents', icon: 'lucideComputer', count: 0, type: 'numeric' },
    { label: 'Last Updated', icon: 'lucideClock', type: 'date', value: new Date() }
  ];
  readonly envRef = input<Environment>();

}
