import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { dispatch } from '@ngxs/store';
import { FinishOauthSignIn } from '@store/auth';

@Component({
  imports: [],
  selector: 'ev-oauth-finish',
  styleUrl: './oauth-finish.page.scss',
  templateUrl: './oauth-finish.page.html',
})
export class OauthFinishPage implements OnInit {
  private readonly finish = dispatch(FinishOauthSignIn);
  private route = inject(ActivatedRoute);
  async ngOnInit() {
    const redirect = decodeURIComponent(this.route.snapshot.queryParams['continue'] ?? '/');
    await this.finish(redirect);
  }
}
