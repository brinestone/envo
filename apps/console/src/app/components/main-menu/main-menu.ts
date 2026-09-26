import { NgOptimizedImage } from '@angular/common';
import { Component, computed, HostListener, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut, lucideReceipt, lucideSettings } from '@ng-icons/lucide';
import { BrnSeparatorComponent } from '@spartan-ng/brain/separator';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { HlmSeparatorDirective } from '@spartan-ng/helm/separator';
import z, { literal } from 'zod';

export const SeparatorMenuItem = z.object({ separator: z.literal(true) })
export const NonSeparatorMenuItem = z.object({
  route: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  routerLinkActiveOptions: z.object({ exact: z.boolean().default(false) }).default({ exact: false }),
  separator: literal(false).optional().default(false)
});


export const MenuItem = z.discriminatedUnion('separator', [
  SeparatorMenuItem,
  NonSeparatorMenuItem
]);

export type MenuItem = z.infer<typeof MenuItem>;

@Component({
  selector: 'ev-main-menu',
  viewProviders: [
    provideIcons({
      lucideSettings,
      lucideLogOut,
      lucideReceipt
    })
  ],
  imports: [
    RouterLink,
    NgOptimizedImage,
    RouterLinkActive,
    NgIcon,
    HlmSeparatorDirective,
    BrnSeparatorComponent,
    HlmAvatarImports,
    HlmButtonDirective
  ],
  host: {
    '[attr.expanded]': 'isOpen()'
  },
  templateUrl: './main-menu.ng.html',
  styleUrl: './main-menu.scss'
})
export class MainMenu {
  readonly signOut = output();
  readonly openSettings = output();
  readonly openBilling = output();
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

  readonly menuItems = input<MenuItem[]>([]);

  private onSettingsButtonClicked() {
    this.openSettings.emit();
  }

  private onBillingButtonClicked() {
    this.openBilling.emit();
  }

  private onSignOutButtonClicked() {
    this.signOut.emit();
  }

  readonly bottomActions = [
    { tooltip: 'Sign out', icon: 'lucideLogOut', handler: this.onSignOutButtonClicked.bind(this) },
    { tooltip: 'Settings', icon: 'lucideSettings', handler: this.onSettingsButtonClicked.bind(this) },
    { tooltip: 'Billing', icon: 'lucideReceipt', handler: this.onBillingButtonClicked.bind(this) },
  ];


  @HostListener('mouseenter')
  onMouseOver() {
    this.isOpen.set(true);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.isOpen.set(false);
  }
}
