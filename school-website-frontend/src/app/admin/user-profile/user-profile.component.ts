import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  constructor(private readonly http: HttpClient) {}

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
}
