import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); display: flex; align-items: center; justify-content: center; padding: 1.5rem; font-family: system-ui, -apple-system, sans-serif;">
      
      <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; width: 100%; max-width: 440px; padding: 2.5rem; box-sizing: border-box; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
        
        <!-- Header Branded Logo & Title -->
        <div style="text-align: center; margin-bottom: 2rem;">
          <span style="font-size: 3rem; display: block; margin-bottom: 0.5rem; animation: pulse 2s infinite;">🛡️</span>
          <h2 style="color: white; font-size: 1.75rem; font-weight: 800; margin: 0; letter-spacing: -0.025em;">SchoolSaaS.com</h2>
          <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-top: 0.25rem;">Multi-Tenant Unified Console</span>
        </div>

        @if (errorMessage()) {
          <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.85rem; font-weight: 500; text-align: left;">
            ⚠️ {{ errorMessage() }}
          </div>
        }

        @if (successMessage()) {
          <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #a7f3d0; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.85rem; font-weight: 500; text-align: left;">
            ✅ {{ successMessage() }}
          </div>
        }

        <!-- VIEW 1: Standard login form -->
        @if (currentView() === 'LOGIN') {
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; text-align: left;">Username</label>
              <input type="text" name="username" [(ngModel)]="credentials.username" required placeholder="Enter username..." 
                style="width: 100%; padding: 0.75rem 1rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-size: 0.95rem; box-sizing: border-box; outline: none; transition: border-color 0.2s;"
                onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.1)'" />
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0;">Secret Password</label>
                <span (click)="setView('FORGOT')" style="font-size: 0.75rem; color: #60a5fa; cursor: pointer; font-weight: 600;" class="hover-underline">Forgot Password?</span>
              </div>
              <input type="password" name="password" [(ngModel)]="credentials.password" required placeholder="••••••••" 
                style="width: 100%; padding: 0.75rem 1rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-size: 0.95rem; box-sizing: border-box; outline: none; transition: border-color 0.2s;"
                onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='rgba(255, 255, 255, 0.1)'" />
            </div>

            <button type="submit" [disabled]="!loginForm.form.valid || isLoading()"
              style="background: #2563eb; color: white; border: 0; padding: 0.85rem; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);"
              [style.opacity]="loginForm.form.valid && !isLoading() ? '1' : '0.6'"
              onmouseenter="this.style.background='#1d4ed8'" onmouseleave="this.style.background='#2563eb'">
              {{ isLoading() ? 'Securing terminal...' : '🔒 Authenticate & Access Console' }}
            </button>
          </form>

          <div style="border-top: 1px solid rgba(255,255,255,0.08); margin-top: 1.5rem; padding-top: 1.25rem; text-align: center; font-size: 0.75rem; color: #64748b; line-height: 1.4;">
            <strong>Tip for Testing Credentials:</strong><br />
            Project Super Admin: <code style="color: #60a5fa;">admin</code> / <code style="color: #60a5fa;">admin123</code><br />
            (Email: <code style="color: #94a3b8;">admin@schoolsaas.com</code> | Phone: <code style="color: #94a3b8;">+15550199000</code>)<br />
            Pioneer School Admin: <code style="color: #60a5fa;">pioneer_admin</code> / <code style="color: #60a5fa;">pioneer123</code><br />
            (Email: <code style="color: #94a3b8;">admin@pioneer.edu</code> | Phone: <code style="color: #94a3b8;">+91401023344</code>)
          </div>
        }

        <!-- VIEW 2: Request OTP screen -->
        @if (currentView() === 'FORGOT') {
          <div style="display: flex; flex-direction: column; gap: 1.25rem; text-align: left;">
            <div>
              <h3 style="color: white; font-size: 1.15rem; font-weight: 700; margin: 0 0 0.25rem 0;">🔑 Reset Administrative Password</h3>
              <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.4; margin: 0;">Enter your registered admin email address or mobile number to generate a secure OTP validation token.</p>
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Registered Email or Mobile Phone</label>
              <input type="text" [(ngModel)]="forgotContact" placeholder="e.g. admin@schoolsaas.com or +15550199000" 
                style="width: 100%; padding: 0.75rem 1rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-size: 0.95rem; box-sizing: border-box; outline: none;" />
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <button (click)="setView('LOGIN')" style="flex: 1; background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 8px; font-weight: 700; cursor: pointer;">Cancel</button>
              <button (click)="onRequestOtp()" [disabled]="!forgotContact || isLoading()" style="flex: 1.5; background: #2563eb; color: white; border: 0; padding: 0.75rem; border-radius: 8px; font-weight: 700; cursor: pointer;">
                {{ isLoading() ? 'Dispatching OTP...' : '⚡ Send Verification Code' }}
              </button>
            </div>
          </div>
        }

        <!-- VIEW 3: Verify OTP & override password screen -->
        @if (currentView() === 'RESET') {
          <div style="display: flex; flex-direction: column; gap: 1.25rem; text-align: left;">
            <div>
              <h3 style="color: white; font-size: 1.15rem; font-weight: 700; margin: 0 0 0.25rem 0;">💬 Verify Security OTP Code</h3>
              <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.4; margin: 0;">We have dispatched a 6-digit verification code to <strong style="color: #60a5fa;">{{ forgotContact }}</strong>. Check your console logs or copy the prefilled demo code below!</p>
            </div>

            <div style="background: rgba(96, 165, 250, 0.1); border: 1px solid rgba(96, 165, 250, 0.2); padding: 0.75rem; border-radius: 6px; font-size: 0.75rem; color: #93c5fd; text-align: center;">
              🔑 <strong>Simulated OTP Code Dispatched:</strong> <code style="font-weight: 700; color: white; font-size: 0.85rem; letter-spacing: 0.05em; background: rgba(0,0,0,0.2); padding: 0.15rem 0.4rem; border-radius: 4px; display: inline-block; margin-left: 0.25rem;">{{ demoPrefilledOtp }}</code>
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Enter 6-Digit OTP</label>
              <input type="text" [(ngModel)]="resetOtp" placeholder="Enter 6-digit code..." 
                style="width: 100%; padding: 0.75rem 1rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-size: 0.95rem; box-sizing: border-box; outline: none; letter-spacing: 0.1em; text-align: center; font-weight: 700;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Enter New Secure Password</label>
              <input type="password" [(ngModel)]="resetNewPassword" placeholder="Minimum 6 characters..." 
                style="width: 100%; padding: 0.75rem 1rem; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: white; font-size: 0.95rem; box-sizing: border-box; outline: none;" />
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <button (click)="setView('FORGOT')" style="flex: 1; background: rgba(255,255,255,0.08); color: white; border: 1px solid rgba(255,255,255,0.1); padding: 0.75rem; border-radius: 8px; font-weight: 700; cursor: pointer;">Back</button>
              <button (click)="onResetPassword()" [disabled]="!resetOtp || !resetNewPassword || isLoading()" style="flex: 1.5; background: #10b981; color: white; border: 0; padding: 0.75rem; border-radius: 8px; font-weight: 700; cursor: pointer;">
                {{ isLoading() ? 'Overriding password...' : '💾 Reset & Save Password' }}
              </button>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class LoginComponent {
  @Output() loginSuccess = new EventEmitter<any>();

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly currentView = signal('LOGIN'); // LOGIN, FORGOT, RESET

  credentials = {
    username: '',
    password: ''
  };

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
        next: (res) => {
          this.isLoading.set(false);
          this.loginSuccess.emit(res);
        },
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
          this.resetOtp = res.otp || ''; // Pre-fill for painless testing!
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

    const payload = {
      contact: this.forgotContact,
      otp: this.resetOtp,
      newPassword: this.resetNewPassword
    };

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
