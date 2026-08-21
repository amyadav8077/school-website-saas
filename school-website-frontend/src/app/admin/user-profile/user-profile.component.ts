import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PhoneInputComponent } from '../../shared/components/phone-input.component';
import { FirebasePhoneAuthService } from '../../shared/firebase/firebase-phone-auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneInputComponent],
  template: `
    <div class="ds-card ds-reveal up-card">
      <h2 class="ds-heading up-title">👤 My Profile &amp; <span class="ds-heading-grad">Account Security</span></h2>
      
      <div class="mobile-grid-1 up-grid">
        
        <!-- Section 1: User Profile Info Details -->
        <div class="up-info-panel">
          <h3 class="up-panel-heading">Active Account Profile</h3>
          
          <div class="up-info-list">
            <div>
              <span class="up-info-label">Username</span>
              <strong class="up-info-value">{{ user?.username }}</strong>
            </div>

            <div>
              <span class="up-info-label">Security Role Authorization</span>
              <span class="up-role-badge">
                🛡️ {{ user?.role }}
              </span>
            </div>

            @if (user?.tenantName) {
              <div>
                <span class="up-info-label">Assigned School Workspace</span>
                <strong class="up-info-value">🏫 {{ user?.tenantName }}</strong>
              </div>
            }
          </div>
        </div>

        <!-- Section 2: Change Password Action Form -->
        <div class="up-password-panel">
          <h3 class="up-panel-heading">🔐 Change Account Password</h3>

          @if (successMessage()) {
            <div class="ds-alert ds-alert-success"><span>✅</span> <span><strong>Success!</strong> {{ successMessage() }}</span></div>
          }

          @if (errorMessage()) {
            <div class="ds-alert ds-alert-error ds-shake"><span>⚠️</span> <span><strong>Error:</strong> {{ errorMessage() }}</span></div>
          }

          <form (ngSubmit)="onChangePassword()" #pwdForm="ngForm" class="up-form">
            <div>
              <label class="up-form-label">Current Secret Password</label>
              <input type="password" name="oldPassword" [(ngModel)]="passwords.oldPassword" required placeholder="Enter current password..."
                class="up-form-input" />
            </div>

            <div>
              <label class="up-form-label">New Secure Password</label>
              <input type="password" name="newPassword" [(ngModel)]="passwords.newPassword" required placeholder="Enter new password..."
                class="up-form-input" />
            </div>

            <div>
              <label class="up-form-label">Confirm New Password</label>
              <input type="password" name="confirmPassword" [(ngModel)]="passwords.confirmPassword" required placeholder="Re-type new password..."
                class="up-form-input" />
            </div>

            <button type="submit" [disabled]="!pwdForm.form.valid || isLoading()" class="ds-btn ds-btn-primary up-submit-btn">
              @if (isLoading()) { <span class="ds-spinner"></span> Saving... } @else { Update Password 🔒 }
            </button>
          </form>
        </div>

        <!-- Section 3: Update Mobile Number (Firebase OTP) -->
        <div class="up-password-panel">
          <h3 class="up-panel-heading">📱 Update Mobile Number</h3>

          @if (phoneMsg()) {
            <div class="ds-alert" [class.ds-alert-success]="phoneOk()" [class.ds-alert-error]="!phoneOk()">
              <span>{{ phoneOk() ? '✅' : '⚠️' }}</span> <span>{{ phoneMsg() }}</span>
            </div>
          }

          @if (!phoneAuth.isConfigured) {
            <div class="ds-alert ds-alert-error"><span>⚠️</span> <span>Mobile based login is not yet supported!</span></div>
          }

          @if (!phoneOtpSent()) {
            <div>
              <label class="up-form-label">New Mobile Number</label>
              <app-phone-input [(ngModel)]="newPhone" name="newPhone" placeholder="New mobile number"></app-phone-input>
            </div>
            <button type="button" (click)="onSendPhoneOtp()" [disabled]="!newPhone || phoneLoading() || !phoneAuth.isConfigured" class="ds-btn ds-btn-primary up-submit-btn">
              @if (phoneLoading()) { <span class="ds-spinner"></span> Sending... } @else { Send OTP }
            </button>
          } @else {
            <div>
              <label class="up-form-label">Enter 6-Digit OTP</label>
              <input type="text" [(ngModel)]="phoneOtp" maxlength="6" inputmode="numeric" placeholder="123456" class="up-form-input" />
            </div>
            <button type="button" (click)="onVerifyPhoneOtp()" [disabled]="!phoneOtp || phoneLoading()" class="ds-btn ds-btn-primary up-submit-btn">
              @if (phoneLoading()) { <span class="ds-spinner"></span> Verifying... } @else { Verify &amp; Save Number }
            </button>
          }
          <div id="profile-recaptcha"></div>
        </div>

        <!-- Section 4: Update Email (in-app OTP) -->
        <div class="up-password-panel">
          <h3 class="up-panel-heading">✉️ Update Email</h3>

          @if (emailMsg()) {
            <div class="ds-alert" [class.ds-alert-success]="emailOk()" [class.ds-alert-error]="!emailOk()">
              <span>{{ emailOk() ? '✅' : '⚠️' }}</span> <span>{{ emailMsg() }}</span>
            </div>
          }

          @if (!emailOtpSent()) {
            <div>
              <label class="up-form-label">New Email Address</label>
              <input type="email" [(ngModel)]="newEmail" placeholder="new@email.com" class="up-form-input" />
            </div>
            <button type="button" (click)="onSendEmailOtp()" [disabled]="!newEmail || emailLoading()" class="ds-btn ds-btn-primary up-submit-btn">
              @if (emailLoading()) { <span class="ds-spinner"></span> Sending... } @else { Send OTP }
            </button>
          } @else {
            <div>
              <label class="up-form-label">Enter OTP sent to {{ newEmail }}</label>
              <input type="text" [(ngModel)]="emailOtp" maxlength="6" inputmode="numeric" placeholder="123456" class="up-form-input" />
            </div>
            <button type="button" (click)="onVerifyEmailOtp()" [disabled]="!emailOtp || emailLoading()" class="ds-btn ds-btn-primary up-submit-btn">
              @if (emailLoading()) { <span class="ds-spinner"></span> Verifying... } @else { Verify &amp; Save Email }
            </button>
          }
        </div>

      </div>
    </div>
  `,
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  @Input() user: any;

  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  passwords = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Phone update state
  protected readonly phoneLoading = signal(false);
  protected readonly phoneOtpSent = signal(false);
  protected readonly phoneMsg = signal('');
  protected readonly phoneOk = signal(false);
  newPhone = '';
  phoneOtp = '';

  // Email update state
  protected readonly emailLoading = signal(false);
  protected readonly emailOtpSent = signal(false);
  protected readonly emailMsg = signal('');
  protected readonly emailOk = signal(false);
  newEmail = '';
  emailOtp = '';

  constructor(
    private readonly http: HttpClient,
    protected readonly phoneAuth: FirebasePhoneAuthService
  ) {}

  onChangePassword() {
    if (this.passwords.newPassword !== this.passwords.confirmPassword) {
      this.errorMessage.set('New passwords do not match!');
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const payload = {
      username: this.user.username,
      oldPassword: this.passwords.oldPassword,
      newPassword: this.passwords.newPassword
    };

    this.http.post<any>('http://localhost:8080/api/auth/change-password', payload)
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.successMessage.set('Password updated successfully!');
          // Reset form fields
          this.passwords.oldPassword = '';
          this.passwords.newPassword = '';
          this.passwords.confirmPassword = '';
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to update password.');
          console.error(err);
        }
      });
  }

  // --- Update Mobile Number via Firebase OTP ---
  async onSendPhoneOtp() {
    this.phoneLoading.set(true);
    this.phoneMsg.set('');
    try {
      await this.phoneAuth.sendOtp(this.newPhone, 'profile-recaptcha');
      this.phoneOtpSent.set(true);
      this.phoneOk.set(true);
      this.phoneMsg.set('OTP sent to ' + this.newPhone + '.');
    } catch (err: any) {
      this.phoneOk.set(false);
      this.phoneMsg.set(err?.message || 'Could not send OTP. Please try again.');
      console.error(err);
    } finally {
      this.phoneLoading.set(false);
    }
  }

  async onVerifyPhoneOtp() {
    this.phoneLoading.set(true);
    this.phoneMsg.set('');
    try {
      const idToken = await this.phoneAuth.confirmOtp(this.phoneOtp);
      this.http.post<any>('http://localhost:8080/api/auth/profile/phone', { idToken })
        .subscribe({
          next: (res) => {
            this.phoneLoading.set(false);
            this.phoneOk.set(true);
            this.phoneMsg.set('Mobile number updated successfully.');
            this.resetPhoneUpdate();
          },
          error: (err) => {
            this.phoneLoading.set(false);
            this.phoneOk.set(false);
            this.phoneMsg.set(err.error?.message || 'Failed to update mobile number.');
            console.error(err);
          }
        });
    } catch (err: any) {
      this.phoneLoading.set(false);
      this.phoneOk.set(false);
      this.phoneMsg.set(err?.message || 'Invalid OTP. Please try again.');
      console.error(err);
    }
  }

  private resetPhoneUpdate() {
    this.phoneOtpSent.set(false);
    this.phoneOtp = '';
    this.newPhone = '';
    this.phoneAuth.reset();
  }

  // --- Update Email via in-app OTP ---
  onSendEmailOtp() {
    this.emailLoading.set(true);
    this.emailMsg.set('');
    this.http.post<any>('http://localhost:8080/api/auth/profile/email/request-otp', { newEmail: this.newEmail })
      .subscribe({
        next: (res) => {
          this.emailLoading.set(false);
          this.emailOtpSent.set(true);
          this.emailOk.set(true);
          this.emailMsg.set(res?.message || 'A one-time code has been sent.');
        },
        error: (err) => {
          this.emailLoading.set(false);
          this.emailOk.set(false);
          this.emailMsg.set(err.error?.message || 'Failed to send OTP.');
          console.error(err);
        }
      });
  }

  onVerifyEmailOtp() {
    this.emailLoading.set(true);
    this.emailMsg.set('');
    this.http.post<any>('http://localhost:8080/api/auth/profile/email/verify', { newEmail: this.newEmail, otp: this.emailOtp })
      .subscribe({
        next: (res) => {
          this.emailLoading.set(false);
          this.emailOk.set(true);
          this.emailMsg.set('Email updated successfully.');
          this.emailOtpSent.set(false);
          this.emailOtp = '';
          this.newEmail = '';
        },
        error: (err) => {
          this.emailLoading.set(false);
          this.emailOk.set(false);
          this.emailMsg.set(err.error?.message || 'Failed to verify OTP.');
          console.error(err);
        }
      });
  }
}
