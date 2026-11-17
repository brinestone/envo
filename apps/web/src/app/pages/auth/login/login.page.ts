import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertCircle, lucideLoader } from '@ng-icons/lucide';
import { remixGoogleFill } from '@ng-icons/remixicon';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch } from '@ngxs/store';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmAlertImports } from '@spartan/ui/alert';
import { HlmButton } from '@spartan/ui/button';
import { HlmCardImports } from '@spartan/ui/card';
import { HlmCheckbox } from '@spartan/ui/checkbox';
import { HlmFieldImports } from '@spartan/ui/field';
import { HlmInput } from '@spartan/ui/input';
import { HlmSeparator } from '@spartan/ui/separator';
import { HlmSpinner } from '@spartan/ui/spinner';
import { EmailSignIn, SocialIdentityProvider, SocialSignIn } from '@store/auth';
import { actionsInProgress } from '@store/utils';

type FormModel = {
  email: string;
  password: string;
  rememberMe: boolean;
};

function defaultFormValue() {
  return { email: '', password: '', rememberMe: false } as FormModel;
}
@Component({
  viewProviders: [
    provideIcons({
      remixGoogleFill,
      lucideAlertCircle,
      lucideLoader,
    }),
  ],
  imports: [
    HlmSpinner,
    HlmAlertImports,
    FormRoot,
    FormField,
    HlmInput,
    HlmSeparator,
    HlmCheckbox,
    NgIcon,
    HlmFieldImports,
    HlmButton,
    RouterLink,
    HlmCardImports,
  ],
  selector: 'ev-login',
  styleUrl: './login.page.scss',
  templateUrl: './login.page.html',
})
export class LoginPage {
  protected readonly route = inject(ActivatedRoute);
  private readonly socialSignIn = dispatch(SocialSignIn);
  private readonly navigate = dispatch(Navigate);
  private readonly dispatchSignIn = dispatch(EmailSignIn);
  protected readonly formData = signal(defaultFormValue());
  protected readonly model = form(
    this.formData,
    (paths) => {
      required(paths.email, { message: 'This field is required' });
      email(paths.email, { message: 'Invalid email address' });
      required(paths.password, { message: 'This field is required' });
    },
    {
      submission: {
        onInvalid(field) {
          field().focusBoundControl();
        },
        action: async (tree) => {
          if (this.signingIn()) return;
          try {
            const { email, password, rememberMe } = tree().value();
            await this.dispatchSignIn(email, password, rememberMe);
            const redirect = decodeURIComponent(this.route.snapshot.queryParams['continue'] ?? '/');
            void this.navigate([redirect]);
            return;
          } catch (e) {
            const err = e as Error;
            return { message: err.message, kind: 'server' };
          }
        },
      },
    },
  );

  protected readonly credentialSignin = actionsInProgress(EmailSignIn);
  protected readonly signingIn = actionsInProgress(SocialSignIn, EmailSignIn);
  protected readonly socialSigningIn = actionsInProgress(SocialSignIn);
  protected async onGoogleSignInClicked() {
    try {
      const redirect = decodeURIComponent(this.route.snapshot.queryParams['continue'] ?? '/');
      const redirectURL = new URL(redirect, location.origin);
      await this.socialSignIn(SocialIdentityProvider.Google, redirectURL.toString());
    } catch (e) {
      const err = e as Error;
      toast.error('Error', { description: err.message });
    }
  }
}
