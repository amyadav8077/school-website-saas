import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
            <h2 class="pop" [attr.data-view]="currentView()">{{ currentView() === 'LOGIN' ? 'Welcome back' : currentView() === 'FORGOT' ? 'Reset password' : 'Verify code' }}</h2>
            <p class="pop-sub">{{ currentView() === 'LOGIN' ? 'Sign in to your administrative console.' : currentView() === 'FORGOT' ? 'We\\'ll send you a secure OTP token.' : 'Enter the OTP and choose a new password.' }}</p>
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

            <div class="hint stagger" style="--i:4">
              <strong>Test credentials</strong>
              <div>Super Admin: <code>admin</code> / <code>admin123</code></div>
              <div>Pioneer Admin: <code>pioneer_admin</code> / <code>pioneer123</code></div>
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
              <div class="otp-banner stagger" style="--i:1">🔑 Demo OTP: <code>{{ demoPrefilledOtp }}</code></div>
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

  credentials = { username: '', password: '' };
  forgotContact = '';
  resetOtp = '';
  resetNewPassword = '';
  demoPrefilledOtp = '';

  constructor(private readonly http: HttpClient) {}

  setView(view: string) {
    this.currentView.set(view);
    this.errorMessage.set('');
    this.successMessage.set('');
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
}
