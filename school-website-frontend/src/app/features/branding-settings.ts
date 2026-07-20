import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-branding-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #1e293b; margin-top: 0; margin-bottom: 0.5rem; font-weight: 700;">Edit School Branding Settings</h2>
      
      @if (userRole !== 'SCHOOL_ADMIN') {
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 2rem; text-align: center; border-radius: 8px; color: #64748b;">
          <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">🔒</span>
          <strong style="display: block; color: #334155; font-size: 0.95rem; margin-bottom: 0.25rem;">Branding Setup Terminal Restricted</strong>
          <span style="font-size: 0.85rem;">Please switch your user role context to "School Administrator (Staff)" to customize brand styles.</span>
        </div>
      } @else {
        <p style="color: #64748b; font-size: 0.9rem; margin-top: 0; margin-bottom: 1.5rem;">Editing configuration for: <strong style="color: #0f172a;">{{ tenantName }}</strong> (subdomain: <strong style="color: #0f172a;">{{ subdomain }}</strong>)</p>

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

        <form (ngSubmit)="onSubmit()" #settingsForm="ngForm" style="display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Theme Preset & School Crest Row -->
          <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 0.5rem;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">🎨 Select Theme Preset (One-Click Design)</label>
              <select name="themeName" [(ngModel)]="form.themeName" (change)="onThemePresetChanged($event)" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; background: white; font-weight: 600;">
                <option value="DEFAULT">Default Slate & Blue (Modern)</option>
                <option value="GURUKUL_MAROON">Gurukul Maroon & Gold (Traditional)</option>
                <option value="ROYAL_NAVY">Royal Navy & Crimson (Academic)</option>
                <option value="FOREST_GREEN">Forest Green & Emerald (Holistic)</option>
                <option value="SLATE_GREY">Slate Grey & Cyan (Tech Core)</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">🏰 Select School Logo / Emblem</label>
              <div style="display: flex; gap: 0.5rem; flex-direction: column;">
                <select name="logoUrl" [(ngModel)]="form.logoUrl" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; background: white; font-weight: 600;">
                  <option value="🏰">🏰 Academic Castle Crest</option>
                  <option value="🎓">🎓 Graduate Scholar Crest</option>
                  <option value="🦁">🦁 Royal Lion Crest</option>
                  <option value="📖">📖 Knowledge Book Crest</option>
                  <option value="☀️">☀️ Rising Sun Crest</option>
                  @if (form.logoUrl && form.logoUrl !== '🏰' && form.logoUrl !== '🎓' && form.logoUrl !== '🦁' && form.logoUrl !== '📖' && form.logoUrl !== '☀️') {
                    <option [value]="form.logoUrl" selected>Custom Logo (Uploaded)</option>
                  }
                </select>
                <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #475569;">
                  <span>Or Upload Custom Logo:</span>
                  <input type="file" (change)="onLogoUpload($event)" accept="image/*" style="font-size: 0.75rem;" />
                </div>
              </div>
            </div>
          </div>

          <!-- Color Customizer -->
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

          <!-- Custom Domain Settings Row -->
          <div style="background: #eff6ff; padding: 1.25rem; border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div>
              <strong style="font-size: 0.95rem; color: #1e3a8a; display: block; margin-bottom: 0.25rem;">🌐 Connect Custom External Domain</strong>
              <span style="font-size: 0.8rem; color: #475569; display: block; margin-bottom: 0.5rem;">Configure an external domain (e.g., purchased via GoDaddy) to mask your public portal link.</span>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span style="background: #cbd5e1; padding: 0.75rem; border: 1px solid #cbd5e1; border-right: 0; border-radius: 6px 0 0 6px; color: #475569; font-weight: 600; font-size: 0.9rem;">https://</span>
              <input type="text" name="customDomain" [(ngModel)]="customDomain" placeholder="e.g. www.mypioneeracademy.org"
                style="flex: 1; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0 6px 6px 0; box-sizing: border-box; font-size: 0.95rem; width: 100%;" />
            </div>
          </div>

          <!-- Typography & Contacts -->
          <div>
            <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">Typography Font Family</label>
            <select name="fontFamily" [(ngModel)]="form.fontFamily" style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem; background: white;">
              <option value="Segoe UI">Segoe UI (Default)</option>
              <option value="Inter">Inter (Modern Sans)</option>
              <option value="Georgia">Georgia (Elegant Serif)</option>
              <option value="Courier New">Courier New (Monospace)</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">Contact Email</label>
              <input type="email" name="contactEmail" [(ngModel)]="form.contactEmail" placeholder="e.g. info@oakridge.edu"
                style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">Contact Phone</label>
              <input type="text" name="contactPhone" [(ngModel)]="form.contactPhone" placeholder="e.g. +1 (555) 123-4567"
                style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem;" />
            </div>
          </div>

          <!-- Social Media & Google Map Settings -->
          <div style="background: #f0fdf4; padding: 1.25rem; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <strong style="font-size: 0.95rem; color: #15803d; display: block; margin-bottom: 0.25rem;">📱 Connect Social Channels & Google Map</strong>
              <span style="font-size: 0.8rem; color: #475569; display: block;">Add your school social links for the footer and Google Maps embed URL for the Contact page.</span>
            </div>
            
            <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">📘 Facebook URL</label>
                <input type="text" name="facebookUrl" [(ngModel)]="facebookUrl" placeholder="https://facebook.com/pioneer" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">📸 Instagram URL</label>
                <input type="text" name="instagramUrl" [(ngModel)]="instagramUrl" placeholder="https://instagram.com/pioneer" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
              </div>
            </div>

            <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">🐦 Twitter / X URL</label>
                <input type="text" name="twitterUrl" [(ngModel)]="twitterUrl" placeholder="https://twitter.com/pioneer" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">🎥 YouTube URL</label>
                <input type="text" name="youtubeUrl" [(ngModel)]="youtubeUrl" placeholder="https://youtube.com/pioneer" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">🗺️ Google Map Iframe Src Link</label>
              <input type="text" name="googleMapUrl" [(ngModel)]="googleMapUrl" placeholder="https://www.google.com/maps/embed?pb=..." style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
            </div>
          </div>

          <!-- Announcement Banner Settings -->
          <div style="background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 0.9rem; color: #1e293b;">📢 Live Announcement Header Banner</strong>
              <label style="display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 700; color: #475569;">
                <input type="checkbox" name="bannerEnabled" [(ngModel)]="bannerEnabled" style="width: 16px; height: 16px; cursor: pointer;" />
                Enable Banner
              </label>
            </div>
            
            @if (bannerEnabled) {
              <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Banner Announcement Message</label>
                  <input type="text" name="bannerText" [(ngModel)]="bannerText" required style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Animation Slide Direction</label>
                  <select name="bannerDirection" [(ngModel)]="bannerDirection" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white; font-size: 0.85rem;">
                    <option value="left">Scroll toward LEFT (Standard Marquee)</option>
                    <option value="right">Scroll toward RIGHT</option>
                  </select>
                </div>
              </div>

              <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Button Catchy Label</label>
                  <input type="text" name="bannerButtonText" [(ngModel)]="bannerButtonText" required style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Redirect Target Page / Tab</label>
                  <select name="bannerPageSlug" [(ngModel)]="bannerPageSlug" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white; font-size: 0.85rem;">
                    <option value="admissions">Admissions Inquiry Portal</option>
                    <option value="news">News bulletins & Circulars</option>
                    <option value="tc">Transfer Certificate verify Desk</option>
                    <option value="gallery">School Media Gallery</option>
                    <option value="careers">Careers recruitment office</option>
                    <option value="fees">Fees Desk payments portal</option>
                  </select>
                </div>
              </div>
            }
          </div>

          <button type="submit" [disabled]="!settingsForm.form.valid || isLoading()"
            style="background-color: #0f172a; color: white; border: 0; padding: 0.85rem 1.5rem; border-radius: 6px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s;"
            [style.opacity]="settingsForm.form.valid && !isLoading() ? '1' : '0.6'">
            {{ isLoading() ? 'Updating...' : 'Save & Propagate Brand Theme' }}
          </button>
        </form>
      }
    </div>
  `
})
export class BrandingSettingsComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() tenantName!: string;
  @Input() subdomain!: string;
  @Input() userRole: string = 'SCHOOL_ADMIN';
  @Output() brandingUpdated = new EventEmitter<any>();

  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  bannerEnabled = false;
  bannerText = 'Admission is officially open for the Academic Cohort of 2026-27!';
  bannerDirection = 'left';
  bannerButtonText = 'Apply Now!';
  bannerPageSlug = 'admissions';
  customDomain = '';
  facebookUrl = '';
  instagramUrl = '';
  twitterUrl = '';
  youtubeUrl = '';
  googleMapUrl = '';

  form = {
    primaryColor: '#1e3a8a',
    secondaryColor: '#3b82f6',
    accentColor: '#f59e0b',
    fontFamily: 'Segoe UI',
    themeName: 'DEFAULT',
    logoUrl: '🏰',
    faviconUrl: '',
    contactEmail: '',
    contactPhone: '',
    socialLinks: ''
  };

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['subdomain'] && this.subdomain) {
      this.fetchBranding();
    }
  }

  fetchBranding() {
    this.http.get<any>(`http://localhost:8080/api/sites/${this.subdomain}/config`)
      .subscribe({
        next: (data) => {
          this.form.primaryColor = data.primaryColor || '#1e3a8a';
          this.form.secondaryColor = data.secondaryColor || '#3b82f6';
          this.form.accentColor = data.accentColor || '#f59e0b';
          this.form.fontFamily = data.fontFamily || 'Segoe UI';
          this.form.themeName = data.themeName || 'DEFAULT';
          this.form.logoUrl = data.logoUrl || '🏰';
          this.form.faviconUrl = data.faviconUrl || '';
          this.form.contactEmail = data.contactEmail || '';
          this.form.contactPhone = data.contactPhone || '';
          this.form.socialLinks = data.socialLinks || '';
          if (data.socialLinks) {
            try {
              const banner = JSON.parse(data.socialLinks);
              this.bannerEnabled = banner.enabled || false;
              this.bannerText = banner.text || '';
              this.bannerDirection = banner.direction || 'left';
              this.bannerButtonText = banner.buttonText || 'Click Me!';
              this.bannerPageSlug = banner.pageSlug || 'admissions';
              this.facebookUrl = banner.facebookUrl || '';
              this.instagramUrl = banner.instagramUrl || '';
              this.twitterUrl = banner.twitterUrl || '';
              this.youtubeUrl = banner.youtubeUrl || '';
              this.googleMapUrl = banner.googleMapUrl || '';
            } catch (e) {
              this.bannerEnabled = false;
              this.facebookUrl = '';
              this.instagramUrl = '';
              this.twitterUrl = '';
              this.youtubeUrl = '';
              this.googleMapUrl = '';
            }
          } else {
            this.bannerEnabled = false;
            this.facebookUrl = '';
            this.instagramUrl = '';
            this.twitterUrl = '';
            this.youtubeUrl = '';
            this.googleMapUrl = '';
          }
        },
        error: (err) => {
          console.error('Failed to fetch branding', err);
        }
      });

    // Fetch tenant custom domain details
    this.http.get<any>(`http://localhost:8080/api/admin/tenants/${this.subdomain}`)
      .subscribe({
        next: (tenant) => {
          this.customDomain = tenant.customDomain || '';
        },
        error: (err) => {
          console.error('Failed to fetch tenant custom domain', err);
        }
      });
  }

  onThemePresetChanged(event: any) {
    const selected = event.target.value;
    if (selected === 'GURUKUL_MAROON') {
      this.form.primaryColor = '#7f1d1d'; // Deep Maroon
      this.form.secondaryColor = '#b91c1c'; // Bright Maroon
      this.form.accentColor = '#eab308'; // Royal Gold
    } else if (selected === 'ROYAL_NAVY') {
      this.form.primaryColor = '#1e3a8a'; // Deep Navy
      this.form.secondaryColor = '#991b1b'; // Crimson
      this.form.accentColor = '#fbbf24'; // Amber
    } else if (selected === 'FOREST_GREEN') {
      this.form.primaryColor = '#064e3b'; // Forest Green
      this.form.secondaryColor = '#059669'; // Emerald
      this.form.accentColor = '#34d399'; // Mint
    } else if (selected === 'SLATE_GREY') {
      this.form.primaryColor = '#334155'; // Slate Grey
      this.form.secondaryColor = '#0891b2'; // Cyan
      this.form.accentColor = '#22d3ee'; // Light Cyan
    } else {
      this.form.primaryColor = '#0f172a'; // Deep Slate
      this.form.secondaryColor = '#2563eb'; // Blue
      this.form.accentColor = '#f59e0b'; // Gold
    }
  }

  onSubmit() {
    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const bannerObj = {
      enabled: this.bannerEnabled,
      text: this.bannerText,
      direction: this.bannerDirection,
      buttonText: this.bannerButtonText,
      pageSlug: this.bannerPageSlug,
      facebookUrl: this.facebookUrl,
      instagramUrl: this.instagramUrl,
      twitterUrl: this.twitterUrl,
      youtubeUrl: this.youtubeUrl,
      googleMapUrl: this.googleMapUrl
    };
    this.form.socialLinks = JSON.stringify(bannerObj);

    this.http.put<any>(`http://localhost:8080/api/sites/${this.tenantId}/config`, this.form)
      .subscribe({
        next: (res) => {
          // Now update Custom Domain
          this.http.put<any>(`http://localhost:8080/api/admin/tenants/${this.tenantId}/custom-domain?customDomain=${this.customDomain || ''}`, {})
            .subscribe({
              next: () => {
                this.isLoading.set(false);
                this.successMessage.set('Branding and Custom Domain settings successfully updated!');
                this.brandingUpdated.emit(res);
              },
              error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err.error?.message || 'Failed to update custom domain settings.');
                console.error(err);
              }
            });
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to update branding settings.');
          console.error(err);
        }
      });
  }

  onLogoUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.form.logoUrl = e.target.result; // Base64 data URL
      };
      reader.readAsDataURL(file);
    }
  }
}
