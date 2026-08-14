import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tenant-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ds-card ds-reveal to-card">
      <h2 class="ds-heading to-title">Onboard New School <span class="ds-heading-grad">(Tenant)</span></h2>
      
      @if (successMessage()) {
        <div class="ds-alert ds-alert-success">
          <span>✅</span> <span><strong>Success!</strong> {{ successMessage() }}</span>
        </div>
      }
      
      @if (errorMessage()) {
        <div class="ds-alert ds-alert-error ds-shake">
          <span>⚠️</span> <span><strong>Error:</strong> {{ errorMessage() }}</span>
        </div>
      }

      <form (ngSubmit)="onSubmit()" #onboardForm="ngForm" class="to-form">
        <div>
          <label class="to-label">School / Institution Name</label>
          <input type="text" name="name" [(ngModel)]="form.name" required placeholder="e.g. Oakridge International School"
            class="to-input" />
        </div>

        <div>
          <label class="to-label">Desired Subdomain</label>
          <div class="to-subdomain-row">
            <input type="text" name="subdomain" [(ngModel)]="form.subdomain" required placeholder="e.g. oakridge"
              class="to-subdomain-input" />
            <span class="to-subdomain-suffix">.schoolsaas.com</span>
          </div>
        </div>

        <div class="mobile-grid-1 to-color-grid">
          <div>
            <label class="to-label-sm">Primary Color</label>
            <div class="to-color-row">
              <input type="color" name="primaryColor" [(ngModel)]="form.primaryColor" class="to-color-swatch" />
              <input type="text" name="primaryColorText" [(ngModel)]="form.primaryColor" class="to-color-text" />
            </div>
          </div>

          <div>
            <label class="to-label-sm">Secondary Color</label>
            <div class="to-color-row">
              <input type="color" name="secondaryColor" [(ngModel)]="form.secondaryColor" class="to-color-swatch" />
              <input type="text" name="secondaryColorText" [(ngModel)]="form.secondaryColor" class="to-color-text" />
            </div>
          </div>

          <div>
            <label class="to-label-sm">Accent Color</label>
            <div class="to-color-row">
              <input type="color" name="accentColor" [(ngModel)]="form.accentColor" class="to-color-swatch" />
              <input type="text" name="accentColorText" [(ngModel)]="form.accentColor" class="to-color-text" />
            </div>
          </div>
        </div>

        <div>
          <label class="to-label">Typography Font Family</label>
          <select name="fontFamily" [(ngModel)]="form.fontFamily" class="to-select">
            <option value="Segoe UI">Segoe UI (Default)</option>
            <option value="Inter">Inter (Modern Sans)</option>
            <option value="Georgia">Georgia (Elegant Serif)</option>
            <option value="Courier New">Courier New (Monospace)</option>
          </select>
        </div>

        <!-- Tenant Admin Credentials Provisioning Block -->
        <div class="to-admin-block">
          <strong class="to-admin-title">🔑 Provision Tenant Administrator Credentials</strong>
          <div class="to-admin-grid">
            <div>
              <label class="to-label-xs">Admin Username</label>
              <input type="text" name="adminUsername" [(ngModel)]="form.adminUsername" required placeholder="e.g. oakridge_admin"
                class="to-admin-input" />
            </div>
            <div>
              <label class="to-label-xs">Admin Password</label>
              <input type="password" name="adminPassword" [(ngModel)]="form.adminPassword" required placeholder="e.g. oak123"
                class="to-admin-input" />
            </div>
          </div>
        </div>

        <button type="submit" [disabled]="!onboardForm.form.valid || isLoading()" class="ds-btn ds-btn-primary to-submit-btn">
          @if (isLoading()) { <span class="ds-spinner"></span> Onboarding... } @else { Onboard &amp; Initialize Branding }
        </button>
      </form>
    </div>
  `,
  styleUrl: './tenant-onboarding.component.scss'
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
