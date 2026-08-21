import { Component, Input, Output, EventEmitter, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { PhoneInputComponent } from '../../shared/components/phone-input.component';

type FooterColumnKey = 'explore' | 'studentResources' | 'academics' | 'admissions';

@Component({
  selector: 'app-branding-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PhoneInputComponent],
  template: `
    <div class="ds-card ds-reveal" style="padding: 2rem; margin-bottom: 2rem;">
      <h2 class="ds-heading" style="font-size: 1.5rem; margin-top: 0; margin-bottom: 0.5rem;">Edit School <span class="ds-heading-grad">Branding Settings</span></h2>
      
      @if (userRole !== 'SCHOOL_ADMIN') {
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 2rem; text-align: center; border-radius: 8px; color: #64748b;">
          <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">🔒</span>
          <strong style="display: block; color: #334155; font-size: 0.95rem; margin-bottom: 0.25rem;">Branding Setup Terminal Restricted</strong>
          <span style="font-size: 0.85rem;">Please switch your user role context to "School Administrator (Staff)" to customize brand styles.</span>
        </div>
      } @else {
        <p style="color: #64748b; font-size: 0.9rem; margin-top: 0; margin-bottom: 1.5rem;">Editing configuration for: <strong style="color: #0f172a;">{{ tenantName }}</strong> (subdomain: <strong style="color: #0f172a;">{{ subdomain }}</strong>)</p>

        @if (successMessage()) {
          <div class="ds-alert ds-alert-success">
            <strong>Success!</strong> {{ successMessage() }}
          </div>
        }
        
        @if (errorMessage()) {
          <div class="ds-alert ds-alert-error ds-shake">
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
                <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #475569; flex-wrap: wrap;">
                  <span>Or Attach Custom Logo:</span>
                  <input type="file" (change)="onLogoUpload($event)" accept="image/*" style="font-size: 0.75rem;" />
                  <button type="button" (click)="saveLogoOnly()" [disabled]="isLogoSaving()"
                    style="background: #16a34a; color: white; border: 0; padding: 0.4rem 0.85rem; border-radius: 6px; font-weight: 700; font-size: 0.75rem; cursor: pointer;"
                    [style.opacity]="isLogoSaving() ? '0.6' : '1'">
                    @if (isLogoSaving()) { ⏳ Saving… } @else { ⬆️ Upload & Save Logo }
                  </button>
                </div>

                <!-- Live preview of the currently selected/uploaded logo -->
                @if (isCustomLogo()) {
                  <div style="display: flex; align-items: center; gap: 0.6rem; margin-top: 0.35rem; padding: 0.5rem 0.6rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
                    <img [src]="form.logoUrl" alt="Logo preview" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%; border: 1px solid #cbd5e1;" />
                    <span style="font-size: 0.72rem; color: #166534; font-weight: 700;">
                      ✅ Custom logo attached{{ uploadedFileName() ? ' — ' + uploadedFileName() : '' }}. Click “Upload &amp; Save Logo” to apply it directly.
                    </span>
                    <button type="button" (click)="clearCustomLogo()" style="margin-left: auto; background: transparent; border: 0; color: #dc2626; font-weight: 800; cursor: pointer; font-size: 0.9rem;" title="Remove uploaded logo">✕</button>
                  </div>
                } @else {
                  <div style="display: flex; align-items: center; gap: 0.6rem; margin-top: 0.35rem;">
                    <span style="font-size: 1.6rem;">{{ form.logoUrl }}</span>
                    <span style="font-size: 0.72rem; color: #64748b;">Current emblem preview — click “Upload &amp; Save Logo” to apply a change.</span>
                  </div>
                }

                @if (logoMessage()) {
                  <div style="margin-top: 0.35rem; font-size: 0.72rem; font-weight: 700; color: #166534;">{{ logoMessage() }}</div>
                }
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

          <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">Contact Email</label>
              <input type="email" name="contactEmail" [(ngModel)]="form.contactEmail" placeholder="e.g. info@oakridge.edu"
                style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 1rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">Contact Phone</label>
              <app-phone-input name="contactPhone" [(ngModel)]="form.contactPhone" placeholder="Contact number"></app-phone-input>
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
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">💼 LinkedIn URL</label>
              <input type="text" name="linkedinUrl" [(ngModel)]="linkedinUrl" placeholder="https://linkedin.com/school/pioneer" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">🗺️ Google Map Iframe Src Link</label>
              <input type="text" name="googleMapUrl" [(ngModel)]="googleMapUrl" placeholder="https://www.google.com/maps/embed?pb=..." style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
            </div>
          </div>

          <!-- Footer Content Settings -->
          <div style="background: #f5f3ff; padding: 1.25rem; border-radius: 8px; border: 1px solid #ddd6fe; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 1rem;">
            <div>
               <strong style="font-size: 0.95rem; color: #6d28d9; display: block; margin-bottom: 0.25rem;">🏛️ Footer Content</strong>
               <span style="font-size: 0.8rem; color: #475569; display: block;">School motto, address, office hours, and downloadable documents shown in the site footer.</span>
             </div>


            <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">School Motto</label>
                <input type="text" name="footerMotto" [(ngModel)]="footerMotto" placeholder="e.g. Knowledge · Character · Service" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
              </div>
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Office Hours</label>
                <input type="text" name="footerOfficeHours" [(ngModel)]="footerOfficeHours" placeholder="e.g. Mon – Fri · 8:00 AM – 4:00 PM" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Campus Address</label>
              <input type="text" name="footerAddress" [(ngModel)]="footerAddress" placeholder="e.g. 123 Campus Avenue, Education City, 560001" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
            </div>

            <!-- SECTION CARD: Downloads -->
            <div style="border: 1px solid #ddd6fe; border-radius: 8px; padding: 0.9rem 1rem; background: #ffffff;">
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 800; color: #6d28d9; cursor: pointer; margin-bottom: 0.35rem;">
                <input type="checkbox" name="showFooterDownloads" [(ngModel)]="showFooterDownloads" style="width: 16px; height: 16px;" />
                📥 Downloads Section
              </label>
              <span style="font-size: 0.76rem; color: #64748b; display: block; margin-bottom: 0.75rem;">Downloadable documents shown in the footer: Prospectus, Student Handbook, Academic Calendar. Each link shows only when a URL is set.</span>
              @if (showFooterDownloads) {
              <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">📄 Prospectus URL</label>
                  <input type="text" name="prospectusUrl" [(ngModel)]="prospectusUrl" placeholder="https://…/prospectus.pdf" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">📘 Student Handbook URL</label>
                  <input type="text" name="handbookUrl" [(ngModel)]="handbookUrl" placeholder="https://…/handbook.pdf" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">🗓️ Academic Calendar URL</label>
                  <input type="text" name="academicCalendarUrl" [(ngModel)]="academicCalendarUrl" placeholder="https://…/calendar.pdf" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
                </div>
              </div>
              }
            </div>

            <!-- SECTION CARD: Student Resources -->
            <div style="border: 1px solid #ddd6fe; border-radius: 8px; padding: 0.9rem 1rem; background: #ffffff;">
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 800; color: #6d28d9; cursor: pointer; margin-bottom: 0.35rem;">
                <input type="checkbox" name="showFooterResources" [(ngModel)]="showFooterResources" style="width: 16px; height: 16px;" />
                🎒 Student Resources Section
              </label>
              <span style="font-size: 0.76rem; color: #64748b; display: block; margin-bottom: 0.75rem;">Quick links to your portals and services. Paste the URL for each (e.g. your LMS, library catalog, transport info). A link appears only when its URL is provided. You can also add custom page links below.</span>
              @if (showFooterResources) {
              <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">🎓 Student Portal URL</label>
                  <input type="text" name="studentPortalUrl" [(ngModel)]="studentPortalUrl" placeholder="https://…" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">👪 Parent Portal URL</label>
                  <input type="text" name="parentPortalUrl" [(ngModel)]="parentPortalUrl" placeholder="https://…" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">📚 Library URL</label>
                  <input type="text" name="libraryUrl" [(ngModel)]="libraryUrl" placeholder="https://…" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">🚌 Transport URL</label>
                  <input type="text" name="transportUrl" [(ngModel)]="transportUrl" placeholder="https://…" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">🗓️ Calendar URL</label>
                  <input type="text" name="calendarUrl" [(ngModel)]="calendarUrl" placeholder="https://…" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;" />
                </div>
              </div>

              <!-- Custom Student Resources page links -->
              <div style="border-top: 1px dashed #ddd6fe; padding-top: 0.85rem; margin-top: 0.85rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <span style="font-size: 0.8rem; font-weight: 700; color: #6d28d9;">Custom page links</span>
                  <button type="button" (click)="addFooterLink('studentResources')" [disabled]="availablePages.length === 0"
                    style="background: #7c3aed; color: white; border: 0; padding: 0.35rem 0.7rem; border-radius: 5px; font-weight: 700; font-size: 0.75rem; cursor: pointer;">+ Add Link</button>
                </div>
                @for (link of footerResourceLinks; track $index) {
                  <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                    <input type="text" [name]="'resLabel' + $index" [(ngModel)]="link.label" placeholder="Label"
                      style="flex: 1; min-width: 0; padding: 0.45rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.82rem;" />
                    <select [name]="'resSlug' + $index" [(ngModel)]="link.slug" (ngModelChange)="onFooterLinkSlugChange(link)"
                      style="flex: 1; min-width: 0; padding: 0.45rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.82rem; background: white;">
                      @for (p of availablePages; track p.slug) {
                        <option [value]="p.slug">{{ p.title }}</option>
                      }
                    </select>
                    <button type="button" (click)="moveFooterLink('studentResources', $index, -1)" title="Move up" style="border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer; padding: 0.3rem 0.5rem;">↑</button>
                    <button type="button" (click)="moveFooterLink('studentResources', $index, 1)" title="Move down" style="border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer; padding: 0.3rem 0.5rem;">↓</button>
                    <button type="button" (click)="removeFooterLink('studentResources', $index)" title="Remove" style="border: 0; background: transparent; color: #dc2626; font-weight: 800; cursor: pointer; font-size: 1rem;">✕</button>
                  </div>
                }
              </div>
              }
            </div>
          </div>

          <!-- Configurable Footer Navigation Columns -->
          <div style="background: #ecfeff; padding: 1.25rem; border-radius: 8px; border: 1px solid #a5f3fc; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
            <div>
              <strong style="font-size: 0.95rem; color: #0e7490; display: block; margin-bottom: 0.25rem;">🔗 Footer Navigation Links</strong>
              <span style="font-size: 0.8rem; color: #475569; display: block;">Choose which of your site pages appear in the footer's link columns. Each link points to a page you've created (e.g. Student Corner, Parent Corner). Leave a column empty to use the built-in defaults.</span>
            </div>

            @if (availablePages.length === 0) {
              <span style="font-size: 0.8rem; color: #b45309;">No pages found yet. Create pages in the Page Builder first, then return here to add them to the footer.</span>
            }

            <!-- Explore column -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.82rem; font-weight: 700; color: #0e7490;">🧭 "Explore the School" Column</span>
                <button type="button" (click)="addFooterLink('explore')" [disabled]="availablePages.length === 0"
                  style="background: #0891b2; color: white; border: 0; padding: 0.35rem 0.7rem; border-radius: 5px; font-weight: 700; font-size: 0.75rem; cursor: pointer;">+ Add Link</button>
              </div>
              @for (link of footerExploreLinks; track $index) {
                <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                  <input type="text" [name]="'exploreLabel' + $index" [(ngModel)]="link.label" placeholder="Label"
                    style="flex: 1; min-width: 0; padding: 0.45rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.82rem;" />
                  <select [name]="'exploreSlug' + $index" [(ngModel)]="link.slug" (ngModelChange)="onFooterLinkSlugChange(link)"
                    style="flex: 1; min-width: 0; padding: 0.45rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.82rem; background: white;">
                    @for (p of availablePages; track p.slug) {
                      <option [value]="p.slug">{{ p.title }}</option>
                    }
                  </select>
                  <button type="button" (click)="moveFooterLink('explore', $index, -1)" title="Move up" style="border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer; padding: 0.3rem 0.5rem;">↑</button>
                  <button type="button" (click)="moveFooterLink('explore', $index, 1)" title="Move down" style="border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer; padding: 0.3rem 0.5rem;">↓</button>
                  <button type="button" (click)="removeFooterLink('explore', $index)" title="Remove" style="border: 0; background: transparent; color: #dc2626; font-weight: 800; cursor: pointer; font-size: 1rem;">✕</button>
                </div>
              }
              @if (footerExploreLinks.length === 0) {
                <span style="font-size: 0.75rem; color: #64748b;">Using default links (About, Academics, Admissions, Campus Life, News, Contact).</span>
              }
            </div>

            <!-- SECTION CARD: Academics (custom link editor + enable toggle) -->
            <div style="border: 1px solid #a5f3fc; border-radius: 8px; padding: 0.9rem 1rem; background: #ffffff;">
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 800; color: #0e7490; cursor: pointer; margin-bottom: 0.35rem;">
                <input type="checkbox" name="showFooterAcademics" [(ngModel)]="showFooterAcademics" style="width: 16px; height: 16px;" />
                🎓 Academics Section
              </label>
              <span style="font-size: 0.76rem; color: #64748b; display: block; margin-bottom: 0.75rem;">Links under the footer "Academics" heading. Add your own pages, or leave empty to use the defaults (Departments, Curriculum, Faculty, Examination Results).</span>
              @if (showFooterAcademics) {
              <div style="display: flex; justify-content: flex-end; align-items: center; margin-bottom: 0.5rem;">
                <button type="button" (click)="addFooterLink('academics')" [disabled]="availablePages.length === 0"
                  style="background: #0891b2; color: white; border: 0; padding: 0.35rem 0.7rem; border-radius: 5px; font-weight: 700; font-size: 0.75rem; cursor: pointer;">+ Add Link</button>
              </div>
              @for (link of footerAcademicsLinks; track $index) {
                <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                  <input type="text" [name]="'acaLabel' + $index" [(ngModel)]="link.label" placeholder="Label"
                    style="flex: 1; min-width: 0; padding: 0.45rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.82rem;" />
                  <select [name]="'acaSlug' + $index" [(ngModel)]="link.slug" (ngModelChange)="onFooterLinkSlugChange(link)"
                    style="flex: 1; min-width: 0; padding: 0.45rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.82rem; background: white;">
                    @for (p of availablePages; track p.slug) {
                      <option [value]="p.slug">{{ p.title }}</option>
                    }
                  </select>
                  <button type="button" (click)="moveFooterLink('academics', $index, -1)" title="Move up" style="border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer; padding: 0.3rem 0.5rem;">↑</button>
                  <button type="button" (click)="moveFooterLink('academics', $index, 1)" title="Move down" style="border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer; padding: 0.3rem 0.5rem;">↓</button>
                  <button type="button" (click)="removeFooterLink('academics', $index)" title="Remove" style="border: 0; background: transparent; color: #dc2626; font-weight: 800; cursor: pointer; font-size: 1rem;">✕</button>
                </div>
              }
              @if (footerAcademicsLinks.length === 0) {
                <span style="font-size: 0.75rem; color: #64748b;">Using default links (Departments, Curriculum, Faculty, Examination Results).</span>
              }
              }
            </div>

            <!-- Admissions column -->
            <div style="border-top: 1px dashed #a5f3fc; padding-top: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.82rem; font-weight: 700; color: #0e7490;">📝 "Admissions" Column</span>
                <button type="button" (click)="addFooterLink('admissions')" [disabled]="availablePages.length === 0"
                  style="background: #0891b2; color: white; border: 0; padding: 0.35rem 0.7rem; border-radius: 5px; font-weight: 700; font-size: 0.75rem; cursor: pointer;">+ Add Link</button>
              </div>
              @for (link of footerAdmissionsLinks; track $index) {
                <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                  <input type="text" [name]="'admLabel' + $index" [(ngModel)]="link.label" placeholder="Label"
                    style="flex: 1; min-width: 0; padding: 0.45rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.82rem;" />
                  <select [name]="'admSlug' + $index" [(ngModel)]="link.slug" (ngModelChange)="onFooterLinkSlugChange(link)"
                    style="flex: 1; min-width: 0; padding: 0.45rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.82rem; background: white;">
                    @for (p of availablePages; track p.slug) {
                      <option [value]="p.slug">{{ p.title }}</option>
                    }
                  </select>
                  <button type="button" (click)="moveFooterLink('admissions', $index, -1)" title="Move up" style="border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer; padding: 0.3rem 0.5rem;">↑</button>
                  <button type="button" (click)="moveFooterLink('admissions', $index, 1)" title="Move down" style="border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer; padding: 0.3rem 0.5rem;">↓</button>
                  <button type="button" (click)="removeFooterLink('admissions', $index)" title="Remove" style="border: 0; background: transparent; color: #dc2626; font-weight: 800; cursor: pointer; font-size: 1rem;">✕</button>
                </div>
              }
              @if (footerAdmissionsLinks.length === 0) {
                <span style="font-size: 0.75rem; color: #64748b;">Using default links (Apply Now, Visit Campus, Fee Structure, Important Dates).</span>
              }
            </div>

            <!-- SECTION CARD: Newsletter -->
            <div style="border: 1px solid #a5f3fc; border-radius: 8px; padding: 0.9rem 1rem; background: #ffffff;">
              <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; font-weight: 800; color: #0e7490; cursor: pointer; margin-bottom: 0.35rem;">
                <input type="checkbox" name="showFooterNewsletter" [(ngModel)]="showFooterNewsletter" style="width: 16px; height: 16px;" />
                ✉️ Newsletter Section ("Stay Updated")
              </label>
              <span style="font-size: 0.76rem; color: #64748b; display: block;">Shows a "Stay Updated" email sign-up box in the footer with a Subscribe button. No fields to configure — turn it off if your school doesn't run a newsletter.</span>
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

          <!-- Admissions Promo Popup Settings -->
          <div style="background: #fff7ed; padding: 1.25rem; border-radius: 8px; border: 1px solid #fed7aa; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 0.9rem; color: #9a3412;">🎬 Admissions Promo Popup (Splash Overlay)</strong>
              <label style="display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 700; color: #9a3412;">
                <input type="checkbox" name="promoEnabled" [(ngModel)]="promoEnabled" style="width: 16px; height: 16px; cursor: pointer;" />
                Enable Popup
              </label>
            </div>

            @if (promoEnabled) {
              <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #7c2d12; margin-bottom: 0.25rem;">Hero Background Video URL (MP4)</label>
                  <input type="text" name="promoVideoUrl" [(ngModel)]="promoVideoUrl" placeholder="https://…/video.mp4" style="width: 100%; padding: 0.5rem; border: 1px solid #fdba74; border-radius: 4px; font-size: 0.85rem;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #7c2d12; margin-bottom: 0.25rem;">Fallback Poster Image URL</label>
                  <input type="text" name="promoPosterUrl" [(ngModel)]="promoPosterUrl" placeholder="https://…/poster.jpg" style="width: 100%; padding: 0.5rem; border: 1px solid #fdba74; border-radius: 4px; font-size: 0.85rem;" />
                </div>
              </div>

              <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #7c2d12; margin-bottom: 0.25rem;">Main Title</label>
                  <input type="text" name="promoTitle" [(ngModel)]="promoTitle" style="width: 100%; padding: 0.5rem; border: 1px solid #fdba74; border-radius: 4px; font-size: 0.85rem;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #7c2d12; margin-bottom: 0.25rem;">Subtitle</label>
                  <input type="text" name="promoSubtitle" [(ngModel)]="promoSubtitle" style="width: 100%; padding: 0.5rem; border: 1px solid #fdba74; border-radius: 4px; font-size: 0.85rem;" />
                </div>
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #7c2d12; margin-bottom: 0.25rem;">Admission Process Text</label>
                <textarea name="promoProcessText" [(ngModel)]="promoProcessText" rows="2" style="width: 100%; padding: 0.5rem; border: 1px solid #fdba74; border-radius: 4px; font-size: 0.85rem; resize: vertical;"></textarea>
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #7c2d12; margin-bottom: 0.25rem;">Requirements Intro Text</label>
                <input type="text" name="promoRequirementsText" [(ngModel)]="promoRequirementsText" style="width: 100%; padding: 0.5rem; border: 1px solid #fdba74; border-radius: 4px; font-size: 0.85rem;" />
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #7c2d12; margin-bottom: 0.25rem;">Requirements Checklist (one per line)</label>
                <textarea name="promoRequirementsRaw" [(ngModel)]="promoRequirementsRaw" rows="4" style="width: 100%; padding: 0.5rem; border: 1px solid #fdba74; border-radius: 4px; font-size: 0.85rem; resize: vertical;"></textarea>
              </div>

              <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #7c2d12; margin-bottom: 0.25rem;">Phone</label>
                  <app-phone-input name="promoPhone" [(ngModel)]="promoPhone" placeholder="Phone"></app-phone-input>
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #7c2d12; margin-bottom: 0.25rem;">Website</label>
                  <input type="text" name="promoWebsite" [(ngModel)]="promoWebsite" style="width: 100%; padding: 0.5rem; border: 1px solid #fdba74; border-radius: 4px; font-size: 0.85rem;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #7c2d12; margin-bottom: 0.25rem;">Accent Color</label>
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input type="color" name="promoAccent" [(ngModel)]="promoAccent" style="width: 40px; height: 38px; border: 0; padding: 0; cursor: pointer; border-radius: 4px;" />
                    <input type="text" name="promoAccentText" [(ngModel)]="promoAccent" style="flex: 1; padding: 0.5rem; border: 1px solid #fdba74; border-radius: 4px; font-size: 0.85rem; width: 100%;" />
                  </div>
                </div>
              </div>

              <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #7c2d12; margin-bottom: 0.25rem;">CTA Button Label</label>
                  <input type="text" name="promoCtaText" [(ngModel)]="promoCtaText" style="width: 100%; padding: 0.5rem; border: 1px solid #fdba74; border-radius: 4px; font-size: 0.85rem;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #7c2d12; margin-bottom: 0.25rem;">CTA Target Page</label>
                  <select name="promoCtaSlug" [(ngModel)]="promoCtaSlug" style="width: 100%; padding: 0.55rem; border: 1px solid #fdba74; border-radius: 4px; background: white; font-size: 0.85rem;">
                    <option value="admissions">Admissions Inquiry Portal</option>
                    <option value="news">News bulletins &amp; Circulars</option>
                    <option value="fees">Fees Desk payments portal</option>
                    <option value="gallery">School Media Gallery</option>
                    <option value="careers">Careers recruitment office</option>
                  </select>
                </div>
              </div>

              <p style="font-size: 0.72rem; color: #9a3412; margin: 0;">The 5 feature boxes use built-in defaults (Smart Technology, Team Work, Best Quality Education, Creative Learning, Advanced Program).</p>
            }
          </div>

          <button type="submit" [disabled]="!settingsForm.form.valid || isLoading()"
            class="ds-btn ds-btn-success">
            @if (isLoading()) { <span class="ds-spinner"></span> Updating... } @else { Save & Propagate Brand Theme }
          </button>
         </form>
      }
    </div>
  `,
  styleUrl: './branding-settings.component.scss',
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
  protected readonly uploadedFileName = signal('');
  protected readonly isLogoSaving = signal(false);
  protected readonly logoMessage = signal('');

  private static readonly EMOJI_LOGOS = ['🏰', '🎓', '🦁', '📖', '☀️'];

  protected isCustomLogo(): boolean {
    const v = this.form.logoUrl;
    return !!v && !BrandingSettingsComponent.EMOJI_LOGOS.includes(v);
  }

  protected clearCustomLogo(): void {
    this.form.logoUrl = '🏰';
    this.uploadedFileName.set('');
  }

  /**
   * Builds the JSON object stored in `socialLinks`, carrying banner, social,
   * and admissions-promo popup configuration together.
   */
  private buildBannerObj(): any {
    const requirements = this.promoRequirementsRaw
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    return {
      enabled: this.bannerEnabled,
      text: this.bannerText,
      direction: this.bannerDirection,
      buttonText: this.bannerButtonText,
      pageSlug: this.bannerPageSlug,
      facebookUrl: this.facebookUrl,
      instagramUrl: this.instagramUrl,
      twitterUrl: this.twitterUrl,
      youtubeUrl: this.youtubeUrl,
      linkedinUrl: this.linkedinUrl,
      googleMapUrl: this.googleMapUrl,
      // Footer content
      footerMotto: this.footerMotto,
      footerAddress: this.footerAddress,
      footerOfficeHours: this.footerOfficeHours,
      prospectusUrl: this.prospectusUrl,
      handbookUrl: this.handbookUrl,
      academicCalendarUrl: this.academicCalendarUrl,
      // Footer student-resource links
      studentPortalUrl: this.studentPortalUrl,
      parentPortalUrl: this.parentPortalUrl,
      libraryUrl: this.libraryUrl,
      transportUrl: this.transportUrl,
      calendarUrl: this.calendarUrl,
      // Configurable footer link columns (internal page links)
      footerColumns: {
        explore: this.footerExploreLinks.filter(l => l.slug && l.label.trim()),
        studentResources: this.footerResourceLinks.filter(l => l.slug && l.label.trim()),
        academics: this.footerAcademicsLinks.filter(l => l.slug && l.label.trim()),
        admissions: this.footerAdmissionsLinks.filter(l => l.slug && l.label.trim())
      },
      // Per-school footer section visibility toggles
      footerSections: {
        academics: this.showFooterAcademics,
        studentResources: this.showFooterResources,
        downloads: this.showFooterDownloads,
        newsletter: this.showFooterNewsletter
      },
      // Admissions promo popup
      promoEnabled: this.promoEnabled,
      promoVideoUrl: this.promoVideoUrl,
      promoPosterUrl: this.promoPosterUrl,
      promoTitle: this.promoTitle,
      promoSubtitle: this.promoSubtitle,
      promoProcessText: this.promoProcessText,
      promoRequirementsText: this.promoRequirementsText,
      promoRequirements: requirements,
      promoPhone: this.promoPhone,
      promoWebsite: this.promoWebsite,
      promoAccent: this.promoAccent,
      promoCtaText: this.promoCtaText,
      promoCtaSlug: this.promoCtaSlug
    };
  }

  /**
   * Saves ONLY the logo without submitting the whole branding form. It reuses
   * the current form values (colors, fonts, banner, etc.) so nothing else is
   * overwritten, then persists immediately and refreshes the live preview.
   */
  saveLogoOnly(): void {
    if (!this.tenantId) {
      return;
    }
    this.isLogoSaving.set(true);
    this.logoMessage.set('');
    this.errorMessage.set('');

    // Preserve the current banner/social/promo config exactly as the full save does.
    const payload = { ...this.form, socialLinks: JSON.stringify(this.buildBannerObj()) };

    this.http.put<any>(`http://localhost:8080/api/sites/${this.tenantId}/config`, payload)
      .subscribe({
        next: (res) => {
          this.isLogoSaving.set(false);
          this.uploadedFileName.set('');
          this.logoMessage.set('✅ Logo saved and applied to your website.');
          this.brandingUpdated.emit(res);
        },
        error: (err) => {
          this.isLogoSaving.set(false);
          this.errorMessage.set(err.error?.message || 'Failed to save logo. Please try again.');
          console.error(err);
        }
      });
  }

  bannerEnabled = false;
  bannerText = 'Admission is officially open for the Academic Cohort of 2026-27!';
  bannerDirection = 'left';
  bannerButtonText = 'Apply Now!';
  bannerPageSlug = 'admissions';

  // Admissions promo popup (rich splash overlay) config
  promoEnabled = false;
  promoVideoUrl = '';
  promoPosterUrl = '';
  promoTitle = 'Admission';
  promoSubtitle = 'Open For 2026';
  promoProcessText = 'Begin your journey with us. Our streamlined admission process makes it simple to join our community of learners.';
  promoRequirementsText = 'Please ensure the following documents are ready before you apply.';
  promoRequirementsRaw = 'Completed application form\nBirth certificate copy\nPrevious academic records\nPassport-size photographs';
  promoPhone = '+1 555 019 9000';
  promoWebsite = 'www.ourschool.edu';
  promoAccent = '#d95d41';
  promoCtaText = 'Apply Now';
  promoCtaSlug = 'admissions';

  customDomain = '';
  facebookUrl = '';
  instagramUrl = '';
  twitterUrl = '';
  youtubeUrl = '';
  linkedinUrl = '';
  googleMapUrl = '';

  // Footer content
  footerMotto = '';
  footerAddress = '';
  footerOfficeHours = '';
  prospectusUrl = '';
  handbookUrl = '';
  academicCalendarUrl = '';

  // Footer student-resource links
  studentPortalUrl = '';
  parentPortalUrl = '';
  libraryUrl = '';
  transportUrl = '';
  calendarUrl = '';

  // Configurable footer link columns (internal page links)
  availablePages: { slug: string; title: string }[] = [];
  footerExploreLinks: { label: string; slug: string }[] = [];
  footerResourceLinks: { label: string; slug: string }[] = [];
  footerAcademicsLinks: { label: string; slug: string }[] = [];
  footerAdmissionsLinks: { label: string; slug: string }[] = [];

  // Per-school footer section visibility toggles (default ON for backward compat)
  showFooterAcademics = true;
  showFooterResources = true;
  showFooterDownloads = true;
  showFooterNewsletter = true;

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
    if (changes['tenantId'] && this.tenantId) {
      this.fetchAvailablePages();
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
              this.linkedinUrl = banner.linkedinUrl || '';
              this.googleMapUrl = banner.googleMapUrl || '';
              // Footer content
              this.footerMotto = banner.footerMotto || '';
              this.footerAddress = banner.footerAddress || '';
              this.footerOfficeHours = banner.footerOfficeHours || '';
              this.prospectusUrl = banner.prospectusUrl || '';
              this.handbookUrl = banner.handbookUrl || '';
              this.academicCalendarUrl = banner.academicCalendarUrl || '';
              // Footer student-resource links
              this.studentPortalUrl = banner.studentPortalUrl || '';
              this.parentPortalUrl = banner.parentPortalUrl || '';
              this.libraryUrl = banner.libraryUrl || '';
              this.transportUrl = banner.transportUrl || '';
              this.calendarUrl = banner.calendarUrl || '';
              // Configurable footer link columns
              const cols = banner.footerColumns || {};
              this.footerExploreLinks = Array.isArray(cols.explore) ? cols.explore : [];
              this.footerResourceLinks = Array.isArray(cols.studentResources) ? cols.studentResources : [];
              this.footerAcademicsLinks = Array.isArray(cols.academics) ? cols.academics : [];
              this.footerAdmissionsLinks = Array.isArray(cols.admissions) ? cols.admissions : [];
              // Footer section visibility toggles (absent = shown)
              const fsec = banner.footerSections || {};
              this.showFooterAcademics = fsec.academics !== false;
              this.showFooterResources = fsec.studentResources !== false;
              this.showFooterDownloads = fsec.downloads !== false;
              this.showFooterNewsletter = fsec.newsletter !== false;
              // Admissions promo popup
              this.promoEnabled = banner.promoEnabled || false;
              this.promoVideoUrl = banner.promoVideoUrl || '';
              this.promoPosterUrl = banner.promoPosterUrl || '';
              this.promoTitle = banner.promoTitle || 'Admission';
              this.promoSubtitle = banner.promoSubtitle || 'Open For 2026';
              this.promoProcessText = banner.promoProcessText || this.promoProcessText;
              this.promoRequirementsText = banner.promoRequirementsText || this.promoRequirementsText;
              if (banner.promoRequirements && Array.isArray(banner.promoRequirements)) {
                this.promoRequirementsRaw = banner.promoRequirements.join('\n');
              }
              this.promoPhone = banner.promoPhone || this.promoPhone;
              this.promoWebsite = banner.promoWebsite || this.promoWebsite;
              this.promoAccent = banner.promoAccent || '#d95d41';
              this.promoCtaText = banner.promoCtaText || 'Apply Now';
              this.promoCtaSlug = banner.promoCtaSlug || 'admissions';
            } catch (e) {
              this.bannerEnabled = false;
              this.facebookUrl = '';
              this.instagramUrl = '';
              this.twitterUrl = '';
              this.youtubeUrl = '';
              this.linkedinUrl = '';
              this.googleMapUrl = '';
              this.footerMotto = '';
              this.footerAddress = '';
              this.footerOfficeHours = '';
              this.prospectusUrl = '';
              this.handbookUrl = '';
              this.academicCalendarUrl = '';
              this.studentPortalUrl = '';
              this.parentPortalUrl = '';
              this.libraryUrl = '';
              this.transportUrl = '';
              this.calendarUrl = '';
              this.footerExploreLinks = [];
              this.footerResourceLinks = [];
              this.footerAcademicsLinks = [];
              this.footerAdmissionsLinks = [];
            }
          } else {
            this.bannerEnabled = false;
            this.facebookUrl = '';
            this.instagramUrl = '';
            this.twitterUrl = '';
            this.youtubeUrl = '';
            this.linkedinUrl = '';
            this.googleMapUrl = '';
            this.footerMotto = '';
            this.footerAddress = '';
            this.footerOfficeHours = '';
            this.prospectusUrl = '';
            this.handbookUrl = '';
            this.academicCalendarUrl = '';
            this.studentPortalUrl = '';
            this.parentPortalUrl = '';
            this.libraryUrl = '';
            this.transportUrl = '';
            this.calendarUrl = '';
            this.footerExploreLinks = [];
            this.footerResourceLinks = [];
            this.footerAcademicsLinks = [];
            this.footerAdmissionsLinks = [];
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

  /** Loads the tenant's pages so footer links can target them via a picker. */
  fetchAvailablePages() {
    if (!this.tenantId) return;
    this.http.get<any[]>(`http://localhost:8080/api/sites/${this.tenantId}/pages`)
      .subscribe({
        next: (pages) => {
          this.availablePages = (pages || []).map(p => ({ slug: p.slug, title: p.title }));
        },
        error: (err) => console.error('Failed to fetch pages for footer links', err)
      });
  }

  private getFooterColumn(column: FooterColumnKey): { label: string; slug: string }[] {
    switch (column) {
      case 'explore': return this.footerExploreLinks;
      case 'studentResources': return this.footerResourceLinks;
      case 'academics': return this.footerAcademicsLinks;
      case 'admissions': return this.footerAdmissionsLinks;
    }
  }

  private setFooterColumn(column: FooterColumnKey, value: { label: string; slug: string }[]) {
    switch (column) {
      case 'explore': this.footerExploreLinks = value; break;
      case 'studentResources': this.footerResourceLinks = value; break;
      case 'academics': this.footerAcademicsLinks = value; break;
      case 'admissions': this.footerAdmissionsLinks = value; break;
    }
  }

  addFooterLink(column: FooterColumnKey) {
    const first = this.availablePages[0];
    const link = { label: first ? first.title : '', slug: first ? first.slug : '' };
    this.setFooterColumn(column, [...this.getFooterColumn(column), link]);
  }

  removeFooterLink(column: FooterColumnKey, index: number) {
    this.setFooterColumn(column, this.getFooterColumn(column).filter((_, i) => i !== index));
  }

  moveFooterLink(column: FooterColumnKey, index: number, dir: -1 | 1) {
    const arr = [...this.getFooterColumn(column)];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    this.setFooterColumn(column, arr);
  }

  /** When a link's target page changes, default its label to that page's title if empty. */
  onFooterLinkSlugChange(link: { label: string; slug: string }) {
    const page = this.availablePages.find(p => p.slug === link.slug);
    if (page && !link.label.trim()) link.label = page.title;
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

    this.form.socialLinks = JSON.stringify(this.buildBannerObj());

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
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    // Guard against oversized images — logo is stored inline as Base64.
    const MAX_BYTES = 1024 * 1024; // 1 MB
    if (file.size > MAX_BYTES) {
      this.errorMessage.set('Logo image is too large. Please upload an image under 1 MB.');
      event.target.value = '';
      return;
    }
    this.errorMessage.set('');
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.form.logoUrl = e.target.result; // Base64 data URL
      this.uploadedFileName.set(file.name);
    };
    reader.readAsDataURL(file);
  }
}
