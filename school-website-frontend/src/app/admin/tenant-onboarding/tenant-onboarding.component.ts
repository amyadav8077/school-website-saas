import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tenant-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #1e293b; margin-top: 0; margin-bottom: 1.5rem; font-weight: 700;">Onboard New School (Tenant)</h2>
      
      @if (successMessage()) {
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem; color: #047857;">
          <strong>Success!</strong> {{ successMessage() }}
        </div>
      }
      
      @if (errorMessage()) {
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem; color: #b91c1c;">
          <strong>Error:</strong> {{ errorMessage() }}
        </div>
      }

      <form (ngSubmit)="onSubmit()" #onboardForm="ngForm" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">School / Institution Name</label>
          <input type="text" name="name" [(ngModel)]="form.name" required placeholder="e.g. Oakridge International School"
            style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem;" />
        </div>

        <div>
          <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">Desired Subdomain</label>
          <div style="display: flex; align-items: center;">
            <input type="text" name="subdomain" [(ngModel)]="form.subdomain" required placeholder="e.g. oakridge"
              style="flex: 1; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px 0 0 6px; box-sizing: border-box; font-size: 1rem;" />
            <span style="background: #f1f5f9; padding: 0.75rem; border: 1px solid #cbd5e1; border-left: 0; border-radius: 0 6px 6px 0; color: #64748b; font-weight: 500;">.schoolsaas.com</span>
          </div>
        </div>

        <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">Primary Color</label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <input type="color" name="primaryColor" [(ngModel)]="form.primaryColor" style="width: 40px; height: 40px; border: 0; padding: 0; cursor: pointer; border-radius: 4px;" />
              <input type="text" name="primaryColorText" [(ngModel)]="form.primaryColor" style="flex: 1; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.9rem; width: 100%;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">Secondary Color</label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <input type="color" name="secondaryColor" [(ngModel)]="form.secondaryColor" style="width: 40px; height: 40px; border: 0; padding: 0; cursor: pointer; border-radius: 4px;" />
              <input type="text" name="secondaryColorText" [(ngModel)]="form.secondaryColor" style="flex: 1; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.9rem; width: 100%;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">Accent Color</label>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <input type="color" name="accentColor" [(ngModel)]="form.accentColor" style="width: 40px; height: 40px; border: 0; padding: 0; cursor: pointer; border-radius: 4px;" />
              <input type="text" name="accentColorText" [(ngModel)]="form.accentColor" style="flex: 1; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.9rem; width: 100%;" />
            </div>
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">Typography Font Family</label>
          <select name="fontFamily" [(ngModel)]="form.fontFamily" style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem; background: white;">
            <option value="Segoe UI">Segoe UI (Default)</option>
            <option value="Inter">Inter (Modern Sans)</option>
            <option value="Georgia">Georgia (Elegant Serif)</option>
            <option value="Courier New">Courier New (Monospace)</option>
          </select>
        </div>

        <!-- Tenant Admin Credentials Provisioning Block -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.25rem; border-radius: 8px; display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">
          <strong style="font-size: 0.9rem; color: #1e293b;">🔑 Provision Tenant Administrator Credentials</strong>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Admin Username</label>
              <input type="text" name="adminUsername" [(ngModel)]="form.adminUsername" required placeholder="e.g. oakridge_admin"
                style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.9rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Admin Password</label>
              <input type="password" name="adminPassword" [(ngModel)]="form.adminPassword" required placeholder="e.g. oak123"
                style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.9rem;" />
            </div>
          </div>
        </div>

        <button type="submit" [disabled]="!onboardForm.form.valid || isLoading()"
          style="background-color: #1e3a8a; color: white; border: 0; padding: 0.85rem 1.5rem; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s;"
          [style.opacity]="onboardForm.form.valid && !isLoading() ? '1' : '0.6'">
          {{ isLoading() ? 'Onboarding...' : 'Onboard & Initialize Branding' }}
        </button>
      </form>
    </div>
  `
})
export class TenantOnboardingComponent {
  @Output() tenantOnboarded = new EventEmitter<any>();

  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  form = {
    name: '',
    subdomain: '',
    primaryColor: '#1e3a8a',
    secondaryColor: '#3b82f6',
    accentColor: '#f59e0b',
    fontFamily: 'Segoe UI',
    adminUsername: '',
    adminPassword: ''
  };

  constructor(private readonly http: HttpClient) {}

  onSubmit() {
    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    if (!this.form.adminUsername) {
      this.form.adminUsername = this.form.subdomain.toLowerCase() + '_admin';
    }
    if (!this.form.adminPassword) {
      this.form.adminPassword = 'admin123';
    }

    this.http.post<any>('http://localhost:8080/api/admin/tenants', this.form)
      .subscribe({
        next: (tenantRes) => {
          // Now proceed to save tenant admin credentials
          const credentialPayload = {
            username: this.form.adminUsername,
            password: this.form.adminPassword,
            tenantId: tenantRes.id
          };

          this.http.post<any>('http://localhost:8080/api/auth/tenant-admins', credentialPayload)
            .subscribe({
              next: () => {
                this.isLoading.set(false);
                this.successMessage.set(`Successfully onboarded "${tenantRes.name}"! Credentials created for admin: "${this.form.adminUsername}".`);
                this.tenantOnboarded.emit(tenantRes);
                // Reset form fields
                this.form.name = '';
                this.form.subdomain = '';
                this.form.adminUsername = '';
                this.form.adminPassword = '';
              },
              error: (credErr) => {
                this.isLoading.set(false);
                this.errorMessage.set(`Tenant created but admin credentials failed: ${credErr.error?.message}`);
                console.error(credErr);
              }
            });
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to onboard school. Check connection or unique fields.');
          console.error(err);
        }
      });
  }
}
