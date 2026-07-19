import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #1e293b; margin-top: 0; margin-bottom: 1.5rem; font-weight: 700;">👤 My Profile & Account Security</h2>
      
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: start;">
        
        <!-- Section 1: User Profile Info Details -->
        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; color: #0f172a; font-weight: 700;">Active Account Profile</h3>
          
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div>
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; display: block; letter-spacing: 0.05em;">Username</span>
              <strong style="color: #0f172a; font-size: 1.05rem;">{{ user?.username }}</strong>
            </div>

            <div>
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; display: block; letter-spacing: 0.05em;">Security Role Authorization</span>
              <span style="display: inline-block; padding: 0.25rem 0.5rem; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 0.8rem; font-weight: 700; margin-top: 0.15rem;">
                🛡️ {{ user?.role }}
              </span>
            </div>

            @if (user?.tenantName) {
              <div>
                <span style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; display: block; letter-spacing: 0.05em;">Assigned School Workspace</span>
                <strong style="color: #0f172a; font-size: 1.05rem;">🏫 {{ user?.tenantName }}</strong>
              </div>
            }
          </div>
        </div>

        <!-- Section 2: Change Password Action Form -->
        <div style="background: #ffffff; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; color: #0f172a; font-weight: 700;">🔐 Change Account Password</h3>

          @if (successMessage()) {
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1rem; color: #047857; font-size: 0.85rem; font-weight: 500;">
              <strong>Success!</strong> {{ successMessage() }}
            </div>
          }

          @if (errorMessage()) {
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 0.75rem 1rem; border-radius: 4px; margin-bottom: 1rem; color: #b91c1c; font-size: 0.85rem; font-weight: 500;">
              <strong>Error:</strong> {{ errorMessage() }}
            </div>
          }

          <form (ngSubmit)="onChangePassword()" #pwdForm="ngForm" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Current Secret Password</label>
              <input type="password" name="oldPassword" [(ngModel)]="passwords.oldPassword" required placeholder="Enter current password..."
                style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.9rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">New Secure Password</label>
              <input type="password" name="newPassword" [(ngModel)]="passwords.newPassword" required placeholder="Enter new password..."
                style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.9rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Confirm New Password</label>
              <input type="password" name="confirmPassword" [(ngModel)]="passwords.confirmPassword" required placeholder="Re-type new password..."
                style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.9rem;" />
            </div>

            <button type="submit" [disabled]="!pwdForm.form.valid || isLoading()"
              style="background-color: #0f172a; color: white; border: 0; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s; font-size: 0.9rem;"
              [style.opacity]="pwdForm.form.valid && !isLoading() ? '1' : '0.6'">
              {{ isLoading() ? 'Saving...' : 'Update Password 🔒' }}
            </button>
          </form>
        </div>

      </div>
    </div>
  `
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
