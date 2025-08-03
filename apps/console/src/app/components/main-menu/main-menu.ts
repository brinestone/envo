import { NgOptimizedImage } from '@angular/common';
import { Component, HostBinding, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ev-main-menu',
  imports: [
    RouterLink,
    NgOptimizedImage
  ],
  templateUrl: './main-menu.ng.html',
  styleUrl: './main-menu.scss'
})
export class MainMenu {
  private readonly isOpen = signal(false);

  @HostBinding('attr.expanded')
  get expanded() {
    return this.isOpen();
  }
  @HostListener('mouseenter')
  onMouseOver() {
    this.isOpen.set(true);
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.isOpen.set(false);
  }
}
