import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { BrnSheetContentDirective, BrnSheetTriggerDirective } from '@spartan-ng/brain/sheet';
import {
  HlmSheetModule
} from '@spartan-ng/helm/sheet';

@Component({
  viewProviders: [
    provideIcons({
      lucidePlus
    })
  ],
  selector: 'ev-all-projects',
  imports: [
    BrnSheetContentDirective,
    BrnSheetTriggerDirective,
    HlmButtonDirective,
    HlmSheetModule,
    NgIcon
  ],
  templateUrl: './all-projects.page.html',
  styleUrl: './all-projects.page.scss'
})
export class AllProjectsPage {
  onCreateProjectButtonClicked() {

  }
}
