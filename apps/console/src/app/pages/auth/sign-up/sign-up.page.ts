import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { bootstrapFingerprint, bootstrapGoogle } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch } from '@ngxs/store';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@spartan-ng/brain/forms';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { BrnSeparatorComponent } from '@spartan-ng/brain/separator';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmErrorDirective, HlmFormFieldComponent } from '@spartan-ng/helm/form-field';
import { HlmInputDirective } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparatorDirective } from '@spartan-ng/helm/separator';
import { CredentialSignUp } from '@state/auth/actions';
import { toast } from 'ngx-sonner';
import z from 'zod';
import { isActionLoading } from '../../../utils';

const formSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string()
})

@Component({
  selector: 'dy-sign-up',
  viewProviders: [
    provideIcons({
      bootstrapGoogle,
      bootstrapFingerprint
    }),
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ],
  imports: [
    NgIcon,
    HlmCardImports,
    HlmSeparatorDirective,
    BrnSeparatorComponent,
    ReactiveFormsModule,
    HlmFormFieldComponent,
    HlmErrorDirective,
    HlmInputDirective,
    HlmButtonDirective,
    RouterLink,
    BrnSelectImports,
    HlmSelectImports
  ],
  templateUrl: './sign-up.page.html',
  styleUrl: './sign-up.page.scss'
})
export class SignUpPage {
  protected route = inject(ActivatedRoute);
  readonly signingUp = isActionLoading(CredentialSignUp);
  private readonly navigate = dispatch(Navigate);
  private readonly credentialSignUp = dispatch(CredentialSignUp);

  altAuthMethods = [
    { label: 'Google', icon: 'bootstrapGoogle', handler: this.doGoogleSignIn.bind(this) },
    { label: 'Passkey', icon: 'bootstrapFingerprint', handler: this.doPasskeySignIn.bind(this) },
  ];

  private doPasskeySignIn() {
    alert('Feature coming soon!');
  }

  private doGoogleSignIn() {
    alert('Feature coming soon!');
  }

  readonly form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    // confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  onFormSubmit(event: SubmitEvent) {
    event.preventDefault();
    const { name, password, email } = formSchema.parse(this.form.value);
    this.credentialSignUp(name, email, password).subscribe({
      error: (e: Error) => {
        toast.error('Could not sign in', { description: e.message });
      },
      complete: () => {
        const redirect = decodeURIComponent(this.route.snapshot.queryParamMap.get('continue') ?? '/');
        this.navigate([redirect]);
      }
    })
  }
}
