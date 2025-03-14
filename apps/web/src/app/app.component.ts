import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostBinding, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { MainMenuComponent } from '@components/main-menu';
import { environment } from '@env/environment.development';
import { ProjectLookup } from '@models/project';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch, select } from '@ngxs/store';
import { activeProject, isSignedIn } from '@state/selectors';
import { SignOut } from '@state/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, MainMenuComponent, NgClass]
})
export class AppComponent {
  readonly selectedProject = select(activeProject);
  @HostBinding('class.authed')
  readonly signedIn = select(isSignedIn);
  private signOut = dispatch(SignOut);
  private http = inject(HttpClient);
  private navigate = dispatch(Navigate);
  projects = rxResource({
    loader: () => this.http.get<ProjectLookup[]>(`${environment.apiBase}/projects`)
  });

  onSignOutButtonClicked() {
    this.signOut().subscribe({
      complete: () => {
        this.navigate(['/']);
        location.reload();
      }
    });
  }
}
