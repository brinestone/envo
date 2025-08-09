import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ev-footer',
  imports: [RouterLink],
  host: {
    'class': 'text-muted-foreground text-sm'
  },
  template: `
    <p>&copy; 2025</p>
    <a routerLink="/about" class="underline">About</a>
    <a routerLink="/terms-and-conditions" class="underline">Legal</a>
  `,
  styleUrl: './footer.scss'
})
export class Footer {

}
