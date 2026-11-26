import { inject, makeEnvironmentProviders, Service } from '@angular/core';
import { OrganizationBaseOutput } from '@envo/api/models';
import { AuthService } from '@envo/api/services';
import { SESSION_STORAGE_ENGINE, withStorageFeature } from '@ngxs/storage-plugin';
import { Action, NgxsOnInit, provideStates, State, StateContext, StateToken } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { RefreshSession, SessionRefreshed, SignedIn } from '@store/auth';
import { concatMap, tap } from 'rxjs';
import { CreateOrganization, LoadOrganizations, SelectOrganization } from './actions';

export type OrgStateModel = {
  organizations: OrganizationBaseOutput[];
  activeOrganization?: string;
};
export const ORG_STATE = new StateToken<OrgStateModel>('org');
const defaultValue: OrgStateModel = {
  organizations: [],
};
type Context = StateContext<OrgStateModel>;
@State({ name: ORG_STATE, defaults: defaultValue })
@Service()
export class OrgStore implements NgxsOnInit {
  private readonly authService = inject(AuthService);

  ngxsOnInit(ctx: Context): void {
    ctx.dispatch(LoadOrganizations);
  }

  @Action(SelectOrganization)
  onSelectOrganization(ctx: Context, action: SelectOrganization) {
    return this.authService
      .setActiveOrganization({ id: action.id })
      .pipe(concatMap(() => ctx.dispatch([LoadOrganizations, RefreshSession])));
  }

  @Action(SessionRefreshed)
  onSessionRefreshed(ctx: Context, action: SessionRefreshed) {
    ctx.setState(patch({ activeOrganization: action.session.activeOrganizationId }));
  }

  @Action(CreateOrganization, { cancelUncompleted: true })
  onCreateOrganization(ctx: Context, action: CreateOrganization) {
    return this.authService
      .createOrganization({
        name: action.name,
        slug: action.slug,
        keepCurrentActiveOrganization: false,
        logo: `https://api.dicebear.com/10.x/loops/svg?animationVariant=fast:0,medium:0,slow:0,slowest:0&animationProbability=89&seed=${action.slug}`,
      })
      .pipe(concatMap(() => ctx.dispatch([LoadOrganizations, RefreshSession])));
  }

  @Action(LoadOrganizations, { cancelUncompleted: true })
  onLoadOrgs(ctx: Context) {
    return this.authService.listOrganizations().pipe(
      tap((orgs) =>
        ctx.setState(
          patch({
            organizations: orgs,
          }),
        ),
      ),
    );
  }

  @Action(SignedIn)
  async onSignedIn(ctx: Context, action: SignedIn) {
    ctx.dispatch(LoadOrganizations);
    ctx.setState(
      patch({
        activeOrganization: action.session.activeOrganizationId,
      }),
    );
  }
}

export function provideOrganizationStore() {
  return makeEnvironmentProviders([
    provideStates(
      [OrgStore],
      withStorageFeature([{ key: ORG_STATE, engine: SESSION_STORAGE_ENGINE }]),
    ),
  ]);
}
