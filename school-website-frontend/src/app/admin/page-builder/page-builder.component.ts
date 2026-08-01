import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface PageSection {
  id?: number;
  type: string;
  positionOrder: number;
  config: string; // JSON configuration string
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  status: string;
  sections: PageSection[];
}

@Component({
  selector: 'app-page-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #1e293b; margin-top: 0; margin-bottom: 0.5rem; font-weight: 700;">CMS School Page Builder</h2>
      <p style="color: #64748b; font-size: 0.9rem; margin-top: 0; margin-bottom: 1.5rem;">Create school pages and compile their structural sections for: <strong style="color: #0f172a;">{{ tenantName }}</strong></p>

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

      <!-- Page Selection / Creation Row -->
      <div style="display: grid; grid-template-columns: 1.2fr 1.5fr; gap: 2rem; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1.5rem;">
        
        <!-- Select Existing Page -->
        <div>
          <label style="display: block; font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">Select Page to Edit</label>
          <div style="display: flex; gap: 0.5rem;">
            <select [(ngModel)]="selectedPageId" (change)="onPageSelected()" style="flex: 1; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem; background: white;">
              <option [value]="null" disabled selected>-- Choose a Page --</option>
              @for (page of pages(); track page.id) {
                <option [value]="page.id">{{ page.title }} (/{{ page.slug }}) [{{ page.status }}]</option>
              }
            </select>
            @if (selectedPageId) {
              <button (click)="deleteSelectedPage()" style="background: #ef4444; color: white; border: 0; padding: 0.75rem; border-radius: 6px; font-weight: 600; cursor: pointer;">
                🗑️ Delete
              </button>
            }
          </div>
        </div>

        <!-- Add New Page with CBSE Templates -->
        <div>
          <label style="display: block; font-size: 0.9rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">CBSE Standard Page Templates</label>
          <select name="pageTemplate" [(ngModel)]="selectedTemplate" (change)="onTemplateSelected($event)" style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; margin-bottom: 0.5rem; background: white; font-weight: 600;">
            <option value="CUSTOM">-- Custom Blank Page --</option>
            <option value="HOME">Home Page (Pre-seeds Hero, Image Slider & Features)</option>
            <option value="ADMISSIONS">Admissions Page (Pre-seeds Hero & Disclosures)</option>
            <option value="ABOUT">About Us Page (Pre-seeds Vision & Management)</option>
            <option value="CONTACT">Contact Us Page (Pre-seeds Feedback Form)</option>
            <option value="CAREERS">Careers Portal (Pre-seeds Vacancies & ATS Board)</option>
            <option value="DISCLOSURES">Mandatory Disclosures Page (CBSE Appendix IX)</option>
            <option value="GRADES">Student Report Cards Lookup</option>
            <option value="FEES">Parents Payment Portal Desk</option>
            <option value="GALLERY">School Photo & Video Gallery</option>
            <option value="NEWS">Circular News & Events Calendars</option>
          </select>

          <form (ngSubmit)="createNewPage()" style="display: flex; gap: 0.5rem;">
            <input type="text" name="newPageTitle" [(ngModel)]="newPageForm.title" placeholder="Page Title" required style="flex: 1; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;" />
            <input type="text" name="newPageSlug" [(ngModel)]="newPageForm.slug" placeholder="slug" required style="width: 80px; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;" />
            <button type="submit" style="background: #1e3a8a; color: white; border: 0; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.9rem;">
              + Create
            </button>
          </form>
        </div>

      </div>

      <!-- Editor Panel for Selected Page -->
      @if (selectedPage()) {
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="margin: 0; font-size: 1.25rem; color: #1e293b; font-weight: 700;">
              Composition Sections for: <span style="color: #2563eb;">{{ selectedPage()?.title }}</span>
            </h3>
            <span style="background: #dbeafe; color: #1e40af; font-size: 0.8rem; padding: 0.25rem 0.5rem; border-radius: 9999px; font-weight: 600;">
              {{ activeSections().length }} section(s)
            </span>
          </div>

          <!-- Section Composition List -->
          @if (activeSections().length === 0) {
            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; padding: 3rem; text-align: center; border-radius: 8px; margin-bottom: 1.5rem; color: #64748b;">
              <p style="font-size: 1.1rem; margin-top: 0;">This page is currently empty.</p>
              <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Use the palette below to add structural section blocks to this page!</p>
            </div>
          } @else {
            <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
              @for (sec of activeSections(); track $index; let idx = $index) {
                <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
                  <!-- Section Header Controls -->
                  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="font-size: 0.85rem; font-weight: 700; color: #1e3a8a; background: #dbeafe; padding: 0.15rem 0.5rem; border-radius: 4px;">#{{ idx + 1 }}</span>
                      <strong style="color: #0f172a; text-transform: uppercase; font-size: 0.95rem;">{{ sec.type }} SECTION</strong>
                    </div>
                    <!-- Order & Delete Controls -->
                    <div style="display: flex; gap: 0.35rem;">
                      <button (click)="moveSection(idx, -1)" [disabled]="idx === 0" style="padding: 0.25rem 0.5rem; background: white; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">▲</button>
                      <button (click)="moveSection(idx, 1)" [disabled]="idx === activeSections().length - 1" style="padding: 0.25rem 0.5rem; background: white; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">▼</button>
                      <button (click)="removeSection(idx)" style="padding: 0.25rem 0.5rem; background: #fee2e2; color: #ef4444; border: 1px solid #fca5a5; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">🗑️ Remove</button>
                    </div>
                  </div>

                  <!-- Dynamic Config Fields for Section -->
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    @if (sec.type === 'HERO') {
                      <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Hero Main Title</label>
                        <input type="text" [(ngModel)]="parsedConfigs[idx].title" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px;" />
                      </div>
                      <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Hero Subtitle</label>
                        <input type="text" [(ngModel)]="parsedConfigs[idx].subtitle" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px;" />
                      </div>
                    } @else if (sec.type === 'FEATURES') {
                      <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Feature 1 Title</label>
                        <input type="text" [(ngModel)]="parsedConfigs[idx].f1_title" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px;" />
                      </div>
                      <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Feature 2 Title</label>
                        <input type="text" [(ngModel)]="parsedConfigs[idx].f2_title" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px;" />
                      </div>
                    } @else if (sec.type === 'NOTICES') {
                      <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Notice Header Title</label>
                        <input type="text" [(ngModel)]="parsedConfigs[idx].title" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px;" />
                      </div>
                      <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Notice Content Snippet</label>
                        <input type="text" [(ngModel)]="parsedConfigs[idx].notice_body" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px;" />
                      </div>
                    } @else if (sec.type === 'DISCLOSURES') {
                      <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Disclosure Card Header</label>
                        <input type="text" [(ngModel)]="parsedConfigs[idx].title" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px;" />
                      </div>
                      <div>
                        <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">First Compliance Link Text</label>
                        <input type="text" [(ngModel)]="parsedConfigs[idx].link1_text" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px;" />
                      </div>
                    } @else if (sec.type === 'CAROUSEL') {
                      <div style="grid-column: span 2; display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <strong style="font-size: 0.85rem; color: #475569;">Carousel Slides (No Limit)</strong>
                          <button (click)="addCarouselImage(idx)" style="background: #2563eb; color: white; border: 0; padding: 0.35rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; cursor: pointer;">
                            ➕ Add Slide Image
                          </button>
                        </div>
                        @for (img of getCarouselImages(idx); track $index; let imgIdx = $index) {
                          <div style="background: white; border: 1px solid #cbd5e1; padding: 0.75rem; border-radius: 6px; display: flex; flex-direction: column; gap: 0.5rem; position: relative;">
                            <div style="display: flex; gap: 1rem; align-items: center;">
                              <div style="width: 60px; height: 60px; background: #f1f5f9; border-radius: 4px; border: 1px solid #cbd5e1; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <img [src]="img.url" style="width: 100%; height: 100%; object-fit: cover;" alt="preview" />
                              </div>
                              <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 0.25rem;">
                                <label style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Slide Image URL or Upload</label>
                                <input type="text" [(ngModel)]="img.url" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem;" />
                                <input type="file" (change)="onCarouselImageUpload($event, idx, imgIdx)" accept="image/*" style="font-size: 0.75rem; margin-top: 0.25rem;" />
                              </div>
                            </div>
                            <div>
                              <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Slide Caption</label>
                              <input type="text" [(ngModel)]="img.caption" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem;" />
                            </div>
                            <button (click)="removeCarouselImage(idx, imgIdx)" [disabled]="getCarouselImages(idx).length <= 1" style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: 0; color: #ef4444; font-weight: 700; cursor: pointer; font-size: 0.8rem;">
                              Remove ❌
                            </button>
                          </div>
                        }
                      </div>
                    } @else if (sec.type === 'VIDEO') {
                      <div style="grid-column: span 2; display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <strong style="font-size: 0.85rem; color: #475569;">School Video Items (No Limit)</strong>
                          <button (click)="addVideoItem(idx)" style="background: #2563eb; color: white; border: 0; padding: 0.35rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; cursor: pointer;">
                            ➕ Add Video
                          </button>
                        </div>
                        @for (vid of getVideoList(idx); track $index; let vidIdx = $index) {
                          <div style="background: white; border: 1px solid #cbd5e1; padding: 0.75rem; border-radius: 6px; display: flex; flex-direction: column; gap: 0.5rem; position: relative;">
                            <div>
                              <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Video Title</label>
                              <input type="text" [(ngModel)]="vid.title" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem;" />
                            </div>
                            <div>
                              <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Embedded Video URL (YouTube embed or Upload file)</label>
                              <input type="text" [(ngModel)]="vid.url" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem;" />
                              <input type="file" (change)="onVideoUpload($event, idx, vidIdx)" accept="video/*" style="font-size: 0.75rem; margin-top: 0.25rem;" />
                            </div>
                            <button (click)="removeVideoItem(idx, vidIdx)" [disabled]="getVideoList(idx).length <= 1" style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: 0; color: #ef4444; font-weight: 700; cursor: pointer; font-size: 0.8rem;">
                              Remove ❌
                            </button>
                          </div>
                        }
                      </div>
                    } @else if (sec.type === 'INTRO') {
                      <div style="grid-column: span 2; display: flex; flex-direction: column; gap: 1rem;">
                        <div>
                          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Intro Title</label>
                          <input type="text" [(ngModel)]="parsedConfigs[idx].title" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px;" />
                        </div>
                        <div>
                          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Intro Body Paragraph</label>
                          <textarea [(ngModel)]="parsedConfigs[idx].body" rows="4" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit; font-size: 0.85rem; resize: vertical; box-sizing: border-box;"></textarea>
                        </div>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                          <div style="width: 80px; height: 80px; background: #f1f5f9; border-radius: 6px; border: 1px solid #cbd5e1; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                            <img [src]="parsedConfigs[idx].imgUrl" style="width: 100%; height: 100%; object-fit: cover;" alt="intro preview" />
                          </div>
                          <div style="flex-grow: 1;">
                            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Intro Feature Image URL or Upload</label>
                            <input type="text" [(ngModel)]="parsedConfigs[idx].imgUrl" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem; box-sizing: border-box;" />
                            <input type="file" (change)="onIntroPhotoUpload($event, idx)" accept="image/*" style="font-size: 0.75rem; margin-top: 0.25rem;" />
                          </div>
                        </div>
                      </div>
                    } @else if (sec.type === 'FOUNDERS') {
                      <div style="grid-column: span 2; display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <strong style="font-size: 0.85rem; color: #475569;">Founders List (No Limit)</strong>
                          <button (click)="addFounder(idx)" style="background: #2563eb; color: white; border: 0; padding: 0.35rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; cursor: pointer;">
                            ➕ Add Founder
                          </button>
                        </div>
                        @for (f of getFoundersList(idx); track $index; let fIdx = $index) {
                          <div style="background: white; border: 1px solid #cbd5e1; padding: 1rem; border-radius: 6px; display: flex; flex-direction: column; gap: 0.50rem; position: relative;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                              <div>
                                <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Founder Name</label>
                                <input type="text" [(ngModel)]="f.name" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem; box-sizing: border-box;" />
                              </div>
                              <div>
                                <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Role / Designation</label>
                                <input type="text" [(ngModel)]="f.role" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem; box-sizing: border-box;" />
                              </div>
                            </div>
                            <div>
                              <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Founder Bio / Narrative</label>
                              <textarea [(ngModel)]="f.bio" rows="2" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit; font-size: 0.8rem; resize: vertical; box-sizing: border-box;"></textarea>
                            </div>
                            <div style="display: flex; gap: 1rem; align-items: center;">
                              <div style="width: 50px; height: 50px; background: #f1f5f9; border-radius: 50%; border: 1px solid #cbd5e1; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <img [src]="f.photoUrl" style="width: 100%; height: 100%; object-fit: cover;" alt="founder portrait" />
                              </div>
                              <div style="flex-grow: 1;">
                                <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Portrait Photo URL or Upload</label>
                                <input type="text" [(ngModel)]="f.photoUrl" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem; box-sizing: border-box;" />
                                <input type="file" (change)="onFounderPhotoUpload($event, idx, fIdx)" accept="image/*" style="font-size: 0.75rem; margin-top: 0.25rem;" />
                              </div>
                            </div>
                            <button (click)="removeFounder(idx, fIdx)" [disabled]="getFoundersList(idx).length <= 1" style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: 0; color: #ef4444; font-weight: 700; cursor: pointer; font-size: 0.8rem;">
                              Remove ❌
                            </button>
                          </div>
                        }
                      </div>
                    } @else if (sec.type === 'FACILITIES') {
                      <div style="grid-column: span 2; display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <strong style="font-size: 0.85rem; color: #475569;">Facilities Catalog (No Limit)</strong>
                          <button (click)="addFacility(idx)" style="background: #2563eb; color: white; border: 0; padding: 0.35rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; cursor: pointer;">
                            ➕ Add Facility
                          </button>
                        </div>
                        @for (f of getFacilitiesList(idx); track $index; let fIdx = $index) {
                          <div style="background: white; border: 1px solid #cbd5e1; padding: 1rem; border-radius: 6px; display: flex; flex-direction: column; gap: 0.50rem; position: relative;">
                            <div>
                              <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Facility Name</label>
                              <input type="text" [(ngModel)]="f.title" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem; box-sizing: border-box;" />
                            </div>
                            <div>
                              <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Facility Description</label>
                              <textarea [(ngModel)]="f.description" rows="2" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-family: inherit; font-size: 0.8rem; resize: vertical; box-sizing: border-box;"></textarea>
                            </div>
                            <div style="display: flex; gap: 1rem; align-items: center;">
                              <div style="width: 70px; height: 50px; background: #f1f5f9; border-radius: 4px; border: 1px solid #cbd5e1; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <img [src]="f.photoUrl" style="width: 100%; height: 100%; object-fit: cover;" alt="facility feature" />
                              </div>
                              <div style="flex-grow: 1;">
                                <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Feature Image URL or Upload</label>
                                <input type="text" [(ngModel)]="f.photoUrl" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem; box-sizing: border-box;" />
                                <input type="file" (change)="onFacilityPhotoUpload($event, idx, fIdx)" accept="image/*" style="font-size: 0.75rem; margin-top: 0.25rem;" />
                              </div>
                            </div>
                            <button (click)="removeFacility(idx, fIdx)" [disabled]="getFacilitiesList(idx).length <= 1" style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: 0; color: #ef4444; font-weight: 700; cursor: pointer; font-size: 0.8rem;">
                              Remove ❌
                            </button>
                          </div>
                        }
                      </div>
                    } @else if (sec.type === 'PHOTO_GRID') {
                      <div style="grid-column: span 2; display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <strong style="font-size: 0.85rem; color: #475569;">Photo Grid Images (No Limit)</strong>
                          <button (click)="addPhotoGridItem(idx)" style="background: #2563eb; color: white; border: 0; padding: 0.35rem 0.75rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem; cursor: pointer;">
                            ➕ Add Photo Grid Item
                          </button>
                        </div>
                        @for (p of getPhotoGridList(idx); track $index; let pIdx = $index) {
                          <div style="background: white; border: 1px solid #cbd5e1; padding: 1rem; border-radius: 6px; display: flex; flex-direction: column; gap: 0.50rem; position: relative;">
                            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1rem;">
                              <div>
                                <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Photo Caption</label>
                                <input type="text" [(ngModel)]="p.caption" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem; box-sizing: border-box;" />
                              </div>
                              <div>
                                <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Category Filter (Caps)</label>
                                <select [(ngModel)]="p.category" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem; background: white;">
                                  <option value="ACADEMICS">ACADEMICS</option>
                                  <option value="SPORTS">SPORTS</option>
                                  <option value="CULTURAL">CULTURAL</option>
                                  <option value="CAMPUS">CAMPUS</option>
                                </select>
                              </div>
                            </div>
                            <div style="display: flex; gap: 1rem; align-items: center;">
                              <div style="width: 70px; height: 50px; background: #f1f5f9; border-radius: 4px; border: 1px solid #cbd5e1; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <img [src]="p.url" style="width: 100%; height: 100%; object-fit: cover;" alt="grid preview" />
                              </div>
                              <div style="flex-grow: 1;">
                                <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #64748b; margin-bottom: 0.15rem;">Photo URL or Upload</label>
                                <input type="text" [(ngModel)]="p.url" style="width: 100%; padding: 0.35rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem; box-sizing: border-box;" />
                                <input type="file" (change)="onPhotoGridUpload($event, idx, pIdx)" accept="image/*" style="font-size: 0.75rem; margin-top: 0.25rem;" />
                              </div>
                            </div>
                            <button (click)="removePhotoGridItem(idx, pIdx)" [disabled]="getPhotoGridList(idx).length <= 1" style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: 0; color: #ef4444; font-weight: 700; cursor: pointer; font-size: 0.8rem;">
                              Remove ❌
                            </button>
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <!-- Save Layout / Save Settings -->
          <div style="display: flex; gap: 1rem; border-top: 1px solid #cbd5e1; padding-top: 1.5rem; justify-content: flex-end; margin-bottom: 2rem;">
            <button (click)="savePageLayout()" [disabled]="isSaving()" style="background: #10b981; color: white; border: 0; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer;">
              {{ isSaving() ? 'Saving...' : '💾 Save Page Sections' }}
            </button>
          </div>

          <!-- Section Palette -->
          <div style="background: #f1f5f9; padding: 1.5rem; border-radius: 8px; border: 1px solid #cbd5e1;">
            <h4 style="margin-top: 0; margin-bottom: 0.75rem; color: #1e293b; font-size: 1rem; font-weight: 700;">Section Palette</h4>
            <p style="color: #64748b; font-size: 0.8rem; margin-top: 0; margin-bottom: 1rem;">Click to append a predefined template section block to this page:</p>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button (click)="addSectionToPage('HERO')" style="background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; color: #334155; font-size: 0.85rem;">
                ➕ Hero Banner Block
              </button>
              <button (click)="addSectionToPage('FEATURES')" style="background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; color: #334155; font-size: 0.85rem;">
                ➕ Highlighting Features
              </button>
              <button (click)="addSectionToPage('NOTICES')" style="background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; color: #334155; font-size: 0.85rem;">
                ➕ School Notice Board
              </button>
              <button (click)="addSectionToPage('DISCLOSURES')" style="background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; color: #334155; font-size: 0.85rem;">
                ➕ Compliance Disclosures
              </button>
              <button (click)="addSectionToPage('CAROUSEL')" style="background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; color: #334155; font-size: 0.85rem;">
                ➕ Image Slider Block
              </button>
              <button (click)="addSectionToPage('VIDEO')" style="background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; color: #334155; font-size: 0.85rem;">
                ➕ Video Player Block
              </button>
              <button (click)="addSectionToPage('INTRO')" style="background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; color: #334155; font-size: 0.85rem;">
                ➕ School Intro Block
              </button>
              <button (click)="addSectionToPage('FOUNDERS')" style="background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; color: #334155; font-size: 0.85rem;">
                ➕ Founders Board Block
              </button>
              <button (click)="addSectionToPage('FACILITIES')" style="background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; color: #334155; font-size: 0.85rem;">
                ➕ Facilities Grid Block
              </button>
              <button (click)="addSectionToPage('PHOTO_GRID')" style="background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 600; color: #334155; font-size: 0.85rem;">
                ➕ Photos Grid Gallery
              </button>
            </div>
          </div>

        </div>
      }
    </div>
  `
})
export class PageBuilderComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() tenantName!: string;
  @Output() contentModified = new EventEmitter<void>();

  protected readonly pages = signal<Page[]>([]);
  protected readonly selectedPage = signal<Page | null>(null);
  protected readonly activeSections = signal<PageSection[]>([]);
  
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isSaving = signal(false);

  selectedPageId: number | null = null;
  selectedTemplate: string = 'CUSTOM';
  parsedConfigs: any[] = []; // Config JSON parsed to JS object array

  newPageForm = {
    title: '',
    slug: ''
  };

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantId'] && this.tenantId) {
      this.fetchPages();
      this.selectedPageId = null;
      this.selectedPage.set(null);
      this.activeSections.set([]);
      this.parsedConfigs = [];
      this.selectedTemplate = 'CUSTOM';
    }
  }

  fetchPages() {
    this.http.get<Page[]>(`http://localhost:8080/api/sites/${this.tenantId}/pages`)
      .subscribe({
        next: (data) => {
          this.pages.set(data);
          if (this.selectedPageId) {
            const current = data.find(p => p.id === Number(this.selectedPageId));
            if (current) {
              this.selectedPage.set(current);
              this.loadPageSections(current);
            }
          }
        },
        error: (err) => {
          console.error('Failed to fetch pages', err);
        }
      });
  }

  onPageSelected() {
    this.successMessage.set('');
    this.errorMessage.set('');
    const page = this.pages().find(p => p.id === Number(this.selectedPageId));
    if (page) {
      this.selectedPage.set(page);
      this.loadPageSections(page);
    }
  }

  loadPageSections(page: Page) {
    this.activeSections.set(page.sections || []);
    this.parsedConfigs = this.activeSections().map(sec => {
      try {
        return JSON.parse(sec.config);
      } catch (e) {
        return {};
      }
    });
  }

  onTemplateSelected(event: any) {
    const selected = event.target.value;
    if (selected === 'HOME') {
      this.newPageForm.title = 'Home';
      this.newPageForm.slug = 'home';
    } else if (selected === 'ABOUT') {
      this.newPageForm.title = 'About Us';
      this.newPageForm.slug = 'about';
    } else if (selected === 'ADMISSIONS') {
      this.newPageForm.title = 'Admissions';
      this.newPageForm.slug = 'admissions';
    } else if (selected === 'CONTACT') {
      this.newPageForm.title = 'Contact Us';
      this.newPageForm.slug = 'contact';
    } else if (selected === 'CAREERS') {
      this.newPageForm.title = 'Careers';
      this.newPageForm.slug = 'careers';
    } else if (selected === 'DISCLOSURES') {
      this.newPageForm.title = 'Mandatory Disclosures';
      this.newPageForm.slug = 'disclosures';
    } else if (selected === 'GRADES') {
      this.newPageForm.title = 'Student Grades';
      this.newPageForm.slug = 'grades';
    } else if (selected === 'FEES') {
      this.newPageForm.title = 'Fees & Payments';
      this.newPageForm.slug = 'fees';
    } else if (selected === 'GALLERY') {
      this.newPageForm.title = 'Campus Gallery';
      this.newPageForm.slug = 'gallery';
    } else if (selected === 'NEWS') {
      this.newPageForm.title = 'News & Events';
      this.newPageForm.slug = 'news';
    } else {
      this.newPageForm.title = '';
      this.newPageForm.slug = '';
    }
  }

  createNewPage() {
    this.successMessage.set('');
    this.errorMessage.set('');
    const payload = {
      title: this.newPageForm.title,
      slug: this.newPageForm.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      status: 'PUBLISHED'
    };

    this.http.post<Page>(`http://localhost:8080/api/sites/${this.tenantId}/pages`, payload)
      .subscribe({
        next: (res) => {
          // Pre-seed layout sections based on selected template context in real-time!
          if (this.selectedTemplate !== 'CUSTOM') {
            this.seedTemplateSections(res.id, this.selectedTemplate);
          } else {
            this.successMessage.set(`Successfully created page "${res.title}"!`);
            this.newPageForm.title = '';
            this.newPageForm.slug = '';
            this.selectedPageId = res.id;
            this.fetchPages();
            this.contentModified.emit();
          }
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to create page. Slug must be unique.');
          console.error(err);
        }
      });
  }

  seedTemplateSections(pageId: number, template: string) {
    let sections: PageSection[] = [];
    if (template === 'HOME') {
      sections = [
        {
          type: 'HERO',
          positionOrder: 1,
          config: JSON.stringify({
            title: 'Welcome to Our New Portal',
            subtitle: 'Empowering dreams, nurturing academic excellence, and modeling leaders.'
          })
        },
        {
          type: 'CAROUSEL',
          positionOrder: 2,
          config: JSON.stringify({
            images: [
              { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80', caption: 'World-Class Campus Landscapes & Infrastructure' },
              { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80', caption: 'High-Tech Interactive STEM Laboratories' }
            ]
          })
        },
        {
          type: 'FEATURES',
          positionOrder: 3,
          config: JSON.stringify({
            f1_title: 'Qualified Pedagogy',
            f2_title: 'Advanced Computer & Chemistry Labs'
          })
        },
        {
          type: 'INTRO',
          positionOrder: 4,
          config: JSON.stringify({
            title: 'About Our School',
            body: 'SaaS Pioneer Academy has been a leader in holistic, concept-driven learning. Combining certified mentors, top board curricula, and comprehensive development systems, we provide an unparalleled environment for prospective achievers to thrive and lead.',
            imgUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80'
          })
        },
        {
          type: 'FOUNDERS',
          positionOrder: 5,
          config: JSON.stringify({
            title: 'Our Illustrious Founders',
            founders: [
              { name: 'Dr. Arthur Pendragon', role: 'Founder & Managing Director', bio: 'With over 25 years in secondary pedagogy, Arthur envisions a learning architecture where concept clarity comes first.', photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' },
              { name: 'Prof. Guinevere Vance', role: 'Co-Founder & Academic Dean', bio: 'Guinevere designs the core logic curriculum and rank acceleration models across all sister branch campuses.', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' }
            ]
          })
        },
        {
          type: 'FACILITIES',
          positionOrder: 6,
          config: JSON.stringify({
            title: 'World-Class Infrastructure',
            facilities: [
              { title: 'STEM & Robotics Hub', description: 'Featuring high-tech microprocessors, 3D printing labs, and interactive programming kits.', photoUrl: 'https://images.unsplash.com/photo-1564069114354-d1a6e0e1cf2e?auto=format&fit=crop&w=500&q=80' },
              { title: 'Championship Athletics Arena', description: 'State-of-the-art synthetic tracks, multi-sport courts, and professional training coaches.', photoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=500&q=80' },
              { title: 'Smart Digitized Classrooms', description: 'Fully climate-controlled spaces with responsive touch screens and high-fidelity sound.', photoUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=500&q=80' }
            ]
          })
        },
        {
          type: 'PHOTO_GRID',
          positionOrder: 7,
          config: JSON.stringify({
            title: 'Campus Life & Moments Grid',
            photos: [
              { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80', caption: 'Science Fair Project Exhibition', category: 'ACADEMICS' },
              { url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80', caption: 'Inter-Branch Football Finals', category: 'SPORTS' },
              { url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80', caption: 'Annual Day Instrumental Symphony', category: 'CULTURAL' },
              { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80', caption: 'Graduation Ceremony Group Portrait', category: 'CAMPUS' }
            ]
          })
        }
      ];
    } else if (template === 'ADMISSIONS') {
      sections = [
        {
          type: 'HERO',
          positionOrder: 1,
          config: JSON.stringify({
            title: 'Express Enrollment & Admissions Interest',
            subtitle: 'Admissions for the cohort of 2026-27 are officially open. Submit the form below.'
          })
        },
        {
          type: 'DISCLOSURES',
          positionOrder: 2,
          config: JSON.stringify({
            title: 'Syllabus Affiliations & Board Compliances',
            link1_text: 'Download Mandatory Affiliation certificate (PDF)'
          })
        }
      ];
    } else {
      sections = [
        {
          type: 'HERO',
          positionOrder: 1,
          config: JSON.stringify({
            title: this.newPageForm.title,
            subtitle: 'Explore active features and details below.'
          })
        }
      ];
    }

    this.http.put<any>(`http://localhost:8080/api/sites/pages/${pageId}/sections`, sections)
      .subscribe({
        next: () => {
          this.successMessage.set(`Successfully created and seeded "${this.newPageForm.title}" template!`);
          this.newPageForm.title = '';
          this.newPageForm.slug = '';
          this.selectedTemplate = 'CUSTOM';
          this.selectedPageId = pageId;
          this.fetchPages();
          this.contentModified.emit();
        },
        error: (err) => {
          this.errorMessage.set('Failed to seed template default sections.');
          console.error(err);
        }
      });
  }

  deleteSelectedPage() {
    if (!this.selectedPageId) return;
    this.successMessage.set('');
    this.errorMessage.set('');

    this.http.delete(`http://localhost:8080/api/sites/pages/${this.selectedPageId}`)
      .subscribe({
        next: () => {
          this.successMessage.set('Page successfully deleted.');
          this.selectedPageId = null;
          this.selectedPage.set(null);
          this.activeSections.set([]);
          this.parsedConfigs = [];
          this.fetchPages();
          this.contentModified.emit();
        },
        error: (err) => {
          this.errorMessage.set('Failed to delete page.');
          console.error(err);
        }
      });
  }

  addSectionToPage(type: string) {
    let defaultConfig = '{}';
    if (type === 'HERO') {
      defaultConfig = JSON.stringify({
        title: 'Outstanding Education for Future Leaders',
        subtitle: 'Admissions are open for the academic year 2026-27.'
      });
    } else if (type === 'FEATURES') {
      defaultConfig = JSON.stringify({
        f1_title: 'World-Class Faculty',
        f2_title: 'Interactive Labs & Sports Centers'
      });
    } else if (type === 'NOTICES') {
      defaultConfig = JSON.stringify({
        title: 'Admissions and Assessment Calendars',
        notice_body: 'Standard assessments begin from August 1st, 2026.'
      });
    } else if (type === 'DISCLOSURES') {
      defaultConfig = JSON.stringify({
        title: 'Statutory Board Approvals & Disclosures',
        link1_text: 'Download Mandatory Affiliation File (PDF)'
      });
    } else if (type === 'CAROUSEL') {
      defaultConfig = JSON.stringify({
        images: [
          { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80', caption: 'World-Class Campus Landscapes & Infrastructure' },
          { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80', caption: 'High-Tech Interactive STEM Laboratories' }
        ]
      });
    } else if (type === 'VIDEO') {
      defaultConfig = JSON.stringify({
        videos: [
          { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Pioneer Academy Virtual Tour Highlights' }
        ]
      });
    } else if (type === 'INTRO') {
      defaultConfig = JSON.stringify({
        title: 'About Our School',
        body: 'SaaS Pioneer Academy has been a leader in holistic, concept-driven learning. Combining certified mentors, top board curricula, and comprehensive development systems, we provide an unparalleled environment for prospective achievers to thrive and lead.',
        imgUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80'
      });
    } else if (type === 'FOUNDERS') {
      defaultConfig = JSON.stringify({
        title: 'Our Illustrious Founders',
        founders: [
          { name: 'Dr. Arthur Pendragon', role: 'Founder & Managing Director', bio: 'With over 25 years in secondary pedagogy, Arthur envisions a learning architecture where concept clarity comes first.', photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' },
          { name: 'Prof. Guinevere Vance', role: 'Co-Founder & Academic Dean', bio: 'Guinevere designs the core logic curriculum and rank acceleration models across all sister branch campuses.', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' }
        ]
      });
    } else if (type === 'FACILITIES') {
      defaultConfig = JSON.stringify({
        title: 'World-Class Infrastructure',
        facilities: [
          { title: 'STEM & Robotics Hub', description: 'Featuring high-tech microprocessors, 3D printing labs, and interactive programming kits.', photoUrl: 'https://images.unsplash.com/photo-1564069114354-d1a6e0e1cf2e?auto=format&fit=crop&w=500&q=80' },
          { title: 'Championship Athletics Arena', description: 'State-of-the-art synthetic tracks, multi-sport courts, and professional training coaches.', photoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=500&q=80' },
          { title: 'Smart Digitized Classrooms', description: 'Fully climate-controlled spaces with responsive touch screens and high-fidelity sound.', photoUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=500&q=80' }
        ]
      });
    } else if (type === 'PHOTO_GRID') {
      defaultConfig = JSON.stringify({
        title: 'Campus Life & Moments Grid',
        photos: [
          { url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80', caption: 'Science Fair Project Exhibition', category: 'ACADEMICS' },
          { url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80', caption: 'Inter-Branch Football Finals', category: 'SPORTS' },
          { url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80', caption: 'Annual Day Instrumental Symphony', category: 'CULTURAL' },
          { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80', caption: 'Graduation Ceremony Group Portrait', category: 'CAMPUS' }
        ]
      });
    }

    const newSec: PageSection = {
      type,
      positionOrder: this.activeSections().length + 1,
      config: defaultConfig
    };

    this.activeSections.set([...this.activeSections(), newSec]);
    this.parsedConfigs.push(JSON.parse(defaultConfig));
  }

  removeSection(index: number) {
    const list = [...this.activeSections()];
    list.splice(index, 1);
    this.activeSections.set(list);
    this.parsedConfigs.splice(index, 1);
  }

  moveSection(index: number, direction: number) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= this.activeSections().length) return;

    // Swap active sections
    const list = [...this.activeSections()];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    this.activeSections.set(list);

    // Swap parsed configs
    const configs = [...this.parsedConfigs];
    const tempConfig = configs[index];
    configs[index] = configs[targetIdx];
    configs[targetIdx] = tempConfig;
    this.parsedConfigs = configs;
  }

  savePageLayout() {
    if (!this.selectedPageId) return;
    this.isSaving.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    // Serialize parsed configs back to string payload
    const payload: PageSection[] = this.activeSections().map((sec, idx) => {
      return {
        type: sec.type,
        positionOrder: idx + 1,
        config: JSON.stringify(this.parsedConfigs[idx])
      };
    });

    this.http.put<any>(`http://localhost:8080/api/sites/pages/${this.selectedPageId}/sections`, payload)
      .subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.successMessage.set('Page sections successfully saved & compiled!');
          this.contentModified.emit();
          this.fetchPages();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set('Failed to save page sections.');
          console.error(err);
        }
      });
  }

  getCarouselImages(idx: number): any[] {
    const config = this.parsedConfigs[idx];
    if (!config) return [];
    if (!config.images) {
      config.images = [];
      if (config.img1) {
        config.images.push({ url: config.img1, caption: 'World-Class Campus Landscapes & Infrastructure' });
        delete config.img1;
      }
      if (config.img2) {
        config.images.push({ url: config.img2, caption: 'High-Tech Interactive STEM Laboratories' });
        delete config.img2;
      }
    }
    return config.images;
  }

  addCarouselImage(idx: number) {
    const images = this.getCarouselImages(idx);
    images.push({ url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80', caption: 'New Campus Highlight' });
  }

  removeCarouselImage(idx: number, imgIdx: number) {
    const images = this.getCarouselImages(idx);
    if (images.length > 1) {
      images.splice(imgIdx, 1);
    }
  }

  onCarouselImageUpload(event: any, idx: number, imgIdx: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const images = this.getCarouselImages(idx);
        images[imgIdx].url = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getVideoList(idx: number): any[] {
    const config = this.parsedConfigs[idx];
    if (!config) return [];
    if (!config.videos) {
      config.videos = [];
      if (config.video_url) {
        config.videos.push({ url: config.video_url, title: config.title || 'Experience Our School Virtual Tour' });
        delete config.video_url;
        delete config.title;
      }
    }
    return config.videos;
  }

  addVideoItem(idx: number) {
    const videos = this.getVideoList(idx);
    videos.push({ url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'New Video Tour Highlights' });
  }

  removeVideoItem(idx: number, vidIdx: number) {
    const videos = this.getVideoList(idx);
    if (videos.length > 1) {
      videos.splice(vidIdx, 1);
    }
  }

  onVideoUpload(event: any, idx: number, vidIdx: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const videos = this.getVideoList(idx);
        videos[vidIdx].url = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getFoundersList(idx: number): any[] {
    const config = this.parsedConfigs[idx];
    if (!config) return [];
    if (!config.founders) {
      config.founders = [];
    }
    return config.founders;
  }

  addFounder(idx: number) {
    const founders = this.getFoundersList(idx);
    founders.push({ name: 'Founder Name', role: 'Chairman / President', bio: 'Short bio of the founder illustrating dedication to education...', photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' });
  }

  removeFounder(idx: number, founderIdx: number) {
    const founders = this.getFoundersList(idx);
    if (founders.length > 1) {
      founders.splice(founderIdx, 1);
    }
  }

  onFounderPhotoUpload(event: any, idx: number, founderIdx: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const founders = this.getFoundersList(idx);
        founders[founderIdx].photoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getFacilitiesList(idx: number): any[] {
    const config = this.parsedConfigs[idx];
    if (!config) return [];
    if (!config.facilities) {
      config.facilities = [];
    }
    return config.facilities;
  }

  addFacility(idx: number) {
    const facilities = this.getFacilitiesList(idx);
    facilities.push({ title: 'New Facility', description: 'Detailed description of the world-class campus facility...', photoUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80' });
  }

  removeFacility(idx: number, facIdx: number) {
    const facilities = this.getFacilitiesList(idx);
    if (facilities.length > 1) {
      facilities.splice(facIdx, 1);
    }
  }

  onFacilityPhotoUpload(event: any, idx: number, facIdx: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const facilities = this.getFacilitiesList(idx);
        facilities[facIdx].photoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getPhotoGridList(idx: number): any[] {
    const config = this.parsedConfigs[idx];
    if (!config) return [];
    if (!config.photos) {
      config.photos = [];
    }
    return config.photos;
  }

  addPhotoGridItem(idx: number) {
    const photos = this.getPhotoGridList(idx);
    photos.push({ url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80', caption: 'Academic Highlights', category: 'ACADEMICS' });
  }

  removePhotoGridItem(idx: number, itemIdx: number) {
    const photos = this.getPhotoGridList(idx);
    if (photos.length > 1) {
      photos.splice(itemIdx, 1);
    }
  }

  onPhotoGridUpload(event: any, idx: number, itemIdx: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const photos = this.getPhotoGridList(idx);
        photos[itemIdx].url = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onIntroPhotoUpload(event: any, idx: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.parsedConfigs[idx].imgUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
