import { NgOptimizedImage } from '@angular/common';
import { Component, computed, HostBinding, HostListener, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideListChecks, lucideUserCog, lucideLogOut, lucideReceipt, lucideSettings } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonDirective } from '@spartan-ng/helm/button';

@Component({
  selector: 'ev-main-menu',
  viewProviders: [
    provideIcons({
      lucideListChecks,
      lucideReceipt,
      lucideSettings,
      lucideLogOut,
      lucideUserCog
    })
  ],
  imports: [
    RouterLink,
    NgOptimizedImage,
    RouterLinkActive,
    NgIcon,
    HlmAvatarImports,
    HlmButtonDirective
  ],
  templateUrl: './main-menu.ng.html',
  styleUrl: './main-menu.scss'
})
export class MainMenu {
  readonly signOut = output();
  readonly openSettings = output();
  readonly isOpen = signal(false);
  readonly userNames = input<string>();
  readonly userEmail = input<string>();
  readonly userAvatar = input<string>();
  readonly initials = computed(() => {
    const names = this.userNames();
    if (!names) return 'U';
    const [first, second, ...rest] = names.trim().split(' ');
    return [first, second ?? '']
      .map(v => v[0].toUpperCase())
      .join('');
  })

  @HostBinding('attr.expanded')
  get expanded() {
    return this.isOpen();
  }

  readonly items = [
    { route: '/projects', label: 'Projects', icon: 'lucideListChecks' },
    { route: '/billing', label: 'Billing', icon: 'lucideReceipt' },
    // { route: '/settings', label: 'Settings', icon: 'lucideSettings' }
  ];

  private onSettingsButtonClicked() {
    this.openSettings.emit();
  }

  private onSignOutButtonClicked() {
    this.signOut.emit();
  }

  readonly bottomActions = [
    { tooltip: 'Sign out', icon: 'lucideLogOut', handler: this.onSignOutButtonClicked.bind(this) },
    { tooltip: 'Settings', icon: 'lucideSettings', handler: this.onSettingsButtonClicked.bind(this) },
  ];


  onMouseOver() {
    this.isOpen.set(true);
  }

  onMouseLeave() {
    this.isOpen.set(false);
  }
}
