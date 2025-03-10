import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainMenuComponent } from '@components/main-menu';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch, select } from '@ngxs/store';
import { isSignedIn } from '@state/selectors';
import { SignOut } from '@state/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, MainMenuComponent, NgClass]
})
export class AppComponent {
  readonly signedIn = select(isSignedIn);
  private signOut = dispatch(SignOut);
  private navigate = dispatch(Navigate);

  onSignOutButtonClicked() {
    this.signOut().subscribe({
      complete: () => {
        this.navigate(['/']);
        location.reload();
      }
    });
  }
}
