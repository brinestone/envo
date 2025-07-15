import { Component } from '@angular/core';
import { MainMenu } from '../../components/main-menu/main-menu';

@Component({
  selector: 'l-base',
  imports: [MainMenu],
  template: `
    <ev-main-menu/>
    <p>
      base works!
    </p>
  `,
  styleUrl: './base.layout.scss'
})
export class BaseLayout {

}
