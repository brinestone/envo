import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';

@Component({
  selector: 'ev-project-clients',
  viewProviders: [
    provideIcons({
      lucidePlus
    })
  ],
  imports: [
    HlmButtonDirective,
    NgIcon,
    BrnSheetImports,
    HlmSheetImports,
    RouterLink
  ],
  host: {
    'class': 'page'
  },
  templateUrl: './project-clients.page.html',
  styleUrl: './project-clients.page.scss'
})
export class ProjectClientsPage {

}
