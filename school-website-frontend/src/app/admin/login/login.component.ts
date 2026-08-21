import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PhoneInputComponent } from '../../shared/components/phone-input.component';
import { FirebasePhoneAuthService } from '../../shared/firebase/firebase-phone-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneInputComponent],
  template: `
    <!-- OPTION A — SPLIT SCREEN (ANIMATED) -->
    <div class="split">
      <!-- Left brand panel -->
      <aside class="brand-panel">
        <div class="bp-gradient"></div>
        <div class="bp-shapes">
          <span class="ring ring-1"></span>
          <span class="ring ring-2"></span>
          <span class="dot dot-1"></span>
          <span class="dot dot-2"></span>
          <span class="dot dot-3"></span>
        </div>
        <div class="bp-content">
          <div class="bp-logo reveal" style="--d:0.05s">
            <img src="school_website_saas_logo_512x512.png" alt="logo" />
            <span>SchoolSaaS</span>
          </div>
          <h1 class="bp-headline reveal" style="--d:0.15s">
            <span class="shimmer">Run every school website</span><br/>from one console.
          </h1>
          <p class="bp-sub reveal" style="--d:0.25s">Multi-tenant branding, page builder, admissions, billing, and more — unified in a single secure platform.</p>
          <ul class="bp-features">
            <li class="reveal" style="--d:0.35s"><span class="chk">✓</span> Instant tenant onboarding &amp; cloning</li>
            <li class="reveal" style="--d:0.45s"><span class="chk">✓</span> Live branding with per-school themes</li>
            <li class="reveal" style="--d:0.55s"><span class="chk">✓</span> Admissions, grades &amp; billing built-in</li>
          </ul>
        </div>
        <div class="bp-footer reveal" style="--d:0.65s">© 2026 SchoolSaaS · Unified Console</div>
      </aside>

      <!-- Right form panel -->
      <main class="form-panel">
        <div class="fp-inner">
          <div class="fp-head">
            <h2 class="pop" [attr.data-view]="currentView()">{{ headerTitle() }}</h2>
            <p class="pop-sub">{{ headerSubtitle() }}</p>
          </div>

          @if (errorMessage()) {
            <div class="alert alert-error shake"><span>⚠️</span> {{ errorMessage() }}</div>
          }
          @if (successMessage()) {
            <div class="alert alert-success"><span>✅</span> {{ successMessage() }}</div>
          }

          <!-- LOGIN -->
          @if (currentView() === 'LOGIN') {
            <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="stack">
              <div class="field stagger" style="--i:1">
                <input type="text" name="username" [(ngModel)]="credentials.username" required placeholder=" " autocomplete="username" />
                <label>Username</label>
                <span class="underline"></span>
              </div>
              <div class="field stagger" style="--i:2">
                <input type="password" name="password" [(ngModel)]="credentials.password" required placeholder=" " autocomplete="current-password" />
                <label>Password</label>
                <span class="underline"></span>
                <span (click)="setView('FORGOT')" class="link float-link">Forgot?</span>
              </div>
              <button type="submit" [disabled]="!loginForm.form.valid || isLoading()" class="btn btn-primary stagger" style="--i:3">
                <span class="btn-shine"></span>
                @if (isLoading()) { <span class="spinner"></span> Signing in... } @else { Sign in to console }
              </button>
            </form>

            <div class="divider stagger" style="--i:4"><span>or</span></div>

            <button type="button" (click)="setView('PHONE')" class="btn btn-ghost btn-alt stagger" style="--i:5">
              <span class="btn-alt-icon">📱</span> Sign in with mobile OTP
            </button>

            <div class="hint stagger" style="--i:6">
              <strong>Test credentials</strong>
              <div>Super Admin: <code>admin</code> / <code>admin123</code></div>
              <div>Pioneer Admin: <code>pioneer_admin</code> / <code>pioneer123</code></div>
            </div>
          }

          <!-- PHONE OTP LOGIN -->
          @if (currentView() === 'PHONE') {
            <div class="stack">
              @if (!phoneAuth.isConfigured) {
                <div class="alert alert-error stagger" style="--i:1"><span>⚠️</span> Mobile based login is not yet supported!</div>
              }

              @if (!otpSent()) {
                <div class="field-group stagger" style="--i:2">
                  <span class="field-caption">Mobile number</span>
                  <app-phone-input [(ngModel)]="phoneNumber" name="loginPhone" placeholder="Registered mobile number"></app-phone-input>
                </div>
                <button (click)="onSendLoginOtp()" [disabled]="!phoneNumber || isLoading() || !phoneAuth.isConfigured" class="btn btn-primary stagger" style="--i:3">
                  <span class="btn-shine"></span>
                  @if (isLoading()) { <span class="spinner"></span> Sending OTP... } @else { Send OTP }
                </button>
              } @else {
                <div class="field stagger" style="--i:2">
                  <input type="text" [(ngModel)]="phoneOtp" maxlength="6" inputmode="numeric" class="otp-input" placeholder=" " />
                  <label>6-Digit OTP</label>
                  <span class="underline"></span>
                </div>
                <div class="btn-row stagger" style="--i:3">
                  <button (click)="resetPhoneLogin()" class="btn btn-ghost">Back</button>
                  <button (click)="onVerifyLoginOtp()" [disabled]="!phoneOtp || isLoading()" class="btn btn-success grow">
                    <span class="btn-shine"></span>
                    @if (isLoading()) { <span class="spinner"></span> Verifying... } @else { Verify &amp; sign in }
                  </button>
                </div>
              }

              <div class="divider stagger" style="--i:4"><span>or</span></div>

              <button type="button" (click)="setView('LOGIN')" class="btn btn-ghost btn-alt stagger" style="--i:5">
                <span class="btn-alt-icon">🔑</span> Sign in with username &amp; password
              </button>

              <!-- Firebase invisible reCAPTCHA anchor -->
              <div id="login-recaptcha"></div>
            </div>
          }

          <!-- FORGOT -->
          @if (currentView() === 'FORGOT') {
            <div class="stack">
              <div class="field stagger" style="--i:1">
                <input type="text" [(ngModel)]="forgotContact" placeholder=" " />
                <label>Registered Email or Mobile</label>
                <span class="underline"></span>
              </div>
              <div class="btn-row stagger" style="--i:2">
                <button (click)="setView('LOGIN')" class="btn btn-ghost">Cancel</button>
                <button (click)="onRequestOtp()" [disabled]="!forgotContact || isLoading()" class="btn btn-primary grow">
                  <span class="btn-shine"></span>
                  @if (isLoading()) { <span class="spinner"></span> Sending... } @else { Send code }
                </button>
              </div>
            </div>
          }

          <!-- RESET -->
          @if (currentView() === 'RESET') {
            <div class="stack">
              @if (demoPrefilledOtp) {
                <div class="otp-banner stagger" style="--i:1">🔑 Demo OTP: <code>{{ demoPrefilledOtp }}</code></div>
              }
              <div class="field stagger" style="--i:2">
                <input type="text" [(ngModel)]="resetOtp" maxlength="6" class="otp-input" placeholder=" " />
                <label>6-Digit OTP</label>
                <span class="underline"></span>
              </div>
              <div class="field stagger" style="--i:3">
                <input type="password" [(ngModel)]="resetNewPassword" placeholder=" " />
                <label>New Password</label>
                <span class="underline"></span>
              </div>
              <div class="btn-row stagger" style="--i:4">
                <button (click)="setView('FORGOT')" class="btn btn-ghost">Back</button>
                <button (click)="onResetPassword()" [disabled]="!resetOtp || !resetNewPassword || isLoading()" class="btn btn-success grow">
                  <span class="btn-shine"></span>
                  @if (isLoading()) { <span class="spinner"></span> Saving... } @else { Reset password }
                </button>
              </div>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<any>();

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly currentView = signal('LOGIN');
  protected readonly otpSent = signal(false);

  credentials = { username: '', password: '' };
  forgotContact = '';
  resetOtp = '';
  resetNewPassword = '';
  demoPrefilledOtp = '';
  phoneNumber = '';
  phoneOtp = '';

  constructor(
    private readonly http: HttpClient,
    protected readonly phoneAuth: FirebasePhoneAuthService
  ) {}

  protected headerTitle(): string {
    switch (this.currentView()) {
      case 'FORGOT': return 'Reset password';
      case 'RESET': return 'Verify code';
      case 'PHONE': return 'Mobile sign in';
      default: return 'Welcome back';
    }
  }

  protected headerSubtitle(): string {
    switch (this.currentView()) {
      case 'FORGOT': return 'We\'ll send you a secure OTP token.';
      case 'RESET': return 'Enter the OTP and choose a new password.';
      case 'PHONE': return 'Sign in with a one-time code sent to your mobile.';
      default: return 'Sign in to your administrative console.';
    }
  }

  setView(view: string) {
    this.currentView.set(view);
    this.errorMessage.set('');
    this.successMessage.set('');
    if (view !== 'PHONE') {
      this.resetPhoneLogin();
    }
  }

  onSubmit() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.http.post<any>('http://localhost:8080/api/auth/login', this.credentials)
      .subscribe({
        next: (res) => { this.isLoading.set(false); this.loginSuccess.emit(res); },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Connection failed. Please ensure the backend is running.');
          console.error(err);
        }
      });
  }

  onRequestOtp() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.http.post<any>('http://localhost:8080/api/auth/forgot-password/request', { contact: this.forgotContact })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.successMessage.set('A secure verification OTP code has been generated and dispatched!');
          this.demoPrefilledOtp = res.otp || '';
          this.resetOtp = res.otp || '';
          this.setView('RESET');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to dispatch OTP verification.');
          console.error(err);
        }
      });
  }

  onResetPassword() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    const payload = { contact: this.forgotContact, otp: this.resetOtp, newPassword: this.resetNewPassword };
    this.http.post<any>('http://localhost:8080/api/auth/forgot-password/reset', payload)
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.successMessage.set('Password successfully reset! You can now log in with your new password.');
          this.credentials.username = '';
          this.credentials.password = '';
          this.setView('LOGIN');
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to override password.');
          console.error(err);
        }
      });
  }

  async onSendLoginOtp() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    try {
      await this.phoneAuth.sendOtp(this.phoneNumber, 'login-recaptcha');
      this.otpSent.set(true);
      this.successMessage.set('OTP sent to ' + this.phoneNumber + '.');
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Could not send OTP. Please try again.');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onVerifyLoginOtp() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    try {
      const idToken = await this.phoneAuth.confirmOtp(this.phoneOtp);
      this.http.post<any>('http://localhost:8080/api/auth/login/phone', { idToken })
        .subscribe({
          next: (res) => {
            this.isLoading.set(false);
            this.resetPhoneLogin();
            this.loginSuccess.emit(res);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set(err.error?.message || 'No admin account is linked to this mobile number.');
            console.error(err);
          }
        });
    } catch (err: any) {
      this.isLoading.set(false);
      this.errorMessage.set(err?.message || 'Invalid OTP. Please try again.');
      console.error(err);
    }
  }

  resetPhoneLogin() {
    this.otpSent.set(false);
    this.phoneOtp = '';
    this.phoneAuth.reset();
  }
}
