import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'l-auth',
  imports: [RouterOutlet],
  template: `
    <p>
      auth works!
    </p>
    <router-outlet/>
  `,
  styleUrl: './auth.layout.scss'
})
export class AuthLayout {

}
