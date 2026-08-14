import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface TransferCertificate {
  id: number;
  studentName: string;
  admissionNo: string;
  classLevel: string;
  section: string;
  fatherName: string;
  aadharNo: string;
  tcNumber: string;
  issueDate: string;
  pdfUrl?: string;
}

@Component({
  selector: 'app-tc-lookup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ds-card ds-reveal tl-card">
      
      <div class="tl-header">
        <span [style.color]="accentColor" class="tl-eyebrow">Certificate Verification</span>
        <h3 [style.color]="primaryColor" class="ds-heading tl-title">Verify and Download Transfer Certificate</h3>
        <p class="tl-intro">
          To comply with CBSE board verification parameters, search for active student records class-wise or verify using credentials.
        </p>
      </div>

      <!-- Mode Tab Selectors -->
      <div class="tl-tabs">
        <button (click)="lookupMode.set('CLASS')" 
          class="tl-tab-btn"
          [style.border-bottom-color]="lookupMode() === 'CLASS' ? primaryColor : 'transparent'"
          [style.color]="lookupMode() === 'CLASS' ? primaryColor : '#64748b'">
          🏫 Class & Section Search
        </button>
        <button (click)="lookupMode.set('SECURE')" 
          class="tl-tab-btn"
          [style.border-bottom-color]="lookupMode() === 'SECURE' ? primaryColor : 'transparent'"
          [style.color]="lookupMode() === 'SECURE' ? primaryColor : '#64748b'">
          🔒 Secured Verify ID Look
        </button>
      </div>

      <!-- Mode 1: Class and Section Lookup Form -->
      @if (lookupMode() === 'CLASS') {
        <form (ngSubmit)="verifyTC()" #classSearchForm="ngForm" class="tl-class-form">
          <div class="tl-field-flex1">
            <label class="tl-label">Select Class</label>
            <select name="classLevel" [(ngModel)]="classForm.classLevel" required class="tl-select">
              <option value="Pre-Nursery">Pre-Nursery</option>
              <option value="Nursery">Nursery</option>
              <option value="LKG">LKG</option>
              <option value="UKG">UKG</option>
              <option value="1st">1st Grade</option>
              <option value="2nd">2nd Grade</option>
              <option value="3rd">3rd Grade</option>
              <option value="4th">4th Grade</option>
              <option value="5th">5th Grade</option>
              <option value="6th">6th Grade</option>
              <option value="7th">7th Grade</option>
              <option value="8th">8th Grade</option>
              <option value="9th">9th Grade</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
              <option value="12th">12th Grade</option>
            </select>
          </div>
          <div class="tl-field-flex1-sm">
            <label class="tl-label">Select Section</label>
            <select name="section" [(ngModel)]="classForm.section" required class="tl-select">
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
          </div>
          <div class="tl-field-flex2">
            <label class="tl-label">Student Name (Optional)</label>
            <input type="text" name="studentName" [(ngModel)]="classForm.studentName" placeholder="Enter name or leave empty to list all" 
              class="tl-input-text" />
          </div>
          <div class="tl-submit-wrap">
            <button type="submit" class="ds-btn tl-btn-block" [disabled]="!classSearchForm.form.valid || isLoading()" [style.background-color]="primaryColor">
              {{ isLoading() ? 'Searching TC registry...' : '🔍 Find Certificates' }}
            </button>
          </div>
        </form>
      }

      <!-- Mode 2: Verification Inquiry Form -->
      @if (lookupMode() === 'SECURE') {
        <form (ngSubmit)="verifyTC()" #verifyForm="ngForm" class="tl-secure-form">
          
          <div class="tl-secure-grid">
            <div>
              <label class="tl-label">Admission Number</label>
              <input type="text" name="admissionNo" [(ngModel)]="form.admissionNo" required placeholder="e.g. ADM-901" 
                class="tl-input-secure" />
            </div>
            <div>
              <label class="tl-label">Father's Full Name</label>
              <input type="text" name="fatherName" [(ngModel)]="form.fatherName" required placeholder="e.g. James Potter" 
                class="tl-input-secure" />
            </div>
          </div>

          <div>
            <label class="tl-label">Candidate's Aadhar Card Number</label>
            <input type="text" name="aadharNo" [(ngModel)]="form.aadharNo" required placeholder="e.g. 1234-5678-9012" 
              class="tl-input-secure" />
          </div>

          <button type="submit" class="ds-btn tl-btn-verify" [disabled]="!verifyForm.form.valid || isLoading()" [style.background-color]="primaryColor">
            {{ isLoading() ? 'Searching compliance records...' : '🔍 Verify Transfer Certificate' }}
          </button>
        </form>
      }

      <!-- Verification Output -->
      @if (hasSearched()) {
        <div>
          
          <!-- Class Mode Matching list -->
          @if (lookupMode() === 'CLASS' && certificatesList().length > 0 && !certificate()) {
            <div class="ds-card tl-match-card">
              <h4 class="ds-heading tl-match-heading">🔍 Matching Transfer Certificates in {{ classForm.classLevel }} (Section {{ classForm.section }})</h4>
              
              <div class="tl-match-list">
                @for (tc of certificatesList(); track tc.id) {
                  <div class="ds-card ds-card-hover tl-match-row">
                    <div class="tl-match-info">
                      <strong class="tl-match-name">{{ tc.studentName }}</strong>
                      <span class="tl-match-meta">Adm No: {{ tc.admissionNo }} • Father: {{ tc.fatherName }}</span>
                    </div>
                    <button (click)="selectTC(tc)" class="ds-btn tl-btn-view" [style.background-color]="primaryColor">
                      📜 View Certificate
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          @if (!certificate() && (lookupMode() === 'SECURE' || (lookupMode() === 'CLASS' && certificatesList().length === 0))) {
            <!-- Error Alert -->
            <div class="ds-alert ds-alert-error ds-shake tl-alert">
              <span class="tl-alert-icon">⚠️</span>
              <strong class="tl-alert-title">No Verification Record Found</strong>
              <p class="tl-alert-text">
                The student credentials entered do not match any issued Transfer Certificates in our PostgreSQL ledger. 
                Please verify spelling, Admission Number formats, or contact our administrative campus office.
              </p>
            </div>
          } @else if (certificate()) {
            
            @if (lookupMode() === 'CLASS' && certificatesList().length > 1) {
              <button (click)="certificate.set(null)" class="ds-btn ds-btn-ghost tl-back-btn">
                ⬅️ Back to Search List
              </button>
            }

            <!-- Highly Official Printable TC Verification Docket -->
            <div class="tl-docket">
              
              <div class="tl-docket-header">
                <span class="tl-docket-flag">🇮🇳</span>
                <h4 class="tl-docket-board">Central Board of Secondary Education</h4>
                <p class="tl-docket-desk">STATUTORY TRANSFER CERTIFICATE VERIFICATION DESK</p>
              </div>

              <!-- TC Details grid -->
              <div class="tl-docket-details">
                <div>Certificate Status: <strong class="tl-status-active">🟢 OFFICIALLY VERIFIED & ACTIVE</strong></div>
                <div class="mobile-grid-1 tl-details-grid">
                  <div>1. Certificate Ref No: <strong>{{ certificate()?.tcNumber }}</strong></div>
                  <div>2. Issue Date: <strong>{{ certificate()?.issueDate | date:'mediumDate' }}</strong></div>
                  <div>3. Student Full Name: <strong>{{ certificate()?.studentName }}</strong></div>
                  <div>4. Admission Number: <strong>{{ certificate()?.admissionNo }}</strong></div>
                  <div>5. Class & Section: <strong>{{ certificate()?.classLevel }} (Section {{ certificate()?.section }})</strong></div>
                  <div>6. Father's Name: <strong>{{ certificate()?.fatherName }}</strong></div>
                  <div>7. Candidate Aadhar: <strong>{{ certificate()?.aadharNo }}</strong></div>
                </div>
              </div>

              <!-- Download Button -->
              <div class="tl-download-wrap">
                <a [href]="certificate()?.pdfUrl" download class="ds-btn tl-download-btn" [style.background-color]="primaryColor">
                  ⬇️ Download Verified Transfer Certificate (PDF)
                </a>
              </div>

            </div>

          }
        </div>
      }

    </div>
  `,
  styleUrl: './tc-lookup.component.scss'
})
export class TCLookupComponent {
  @Input() tenantId!: number;
  @Input() primaryColor: string = '#1e3a8a';
  @Input() accentColor: string = '#f59e0b';

  protected readonly certificate = signal<TransferCertificate | null>(null);
  protected readonly certificatesList = signal<TransferCertificate[]>([]);
  protected readonly hasSearched = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly lookupMode = signal<string>('CLASS'); // CLASS, SECURE

  form = {
    admissionNo: '',
    fatherName: '',
    aadharNo: ''
  };

  classForm = {
    classLevel: '1st',
    section: 'A',
    studentName: ''
  };

  private readonly http = inject(HttpClient);

  selectTC(tc: TransferCertificate) {
    this.certificate.set(tc);
  }

  verifyTC() {
    this.isLoading.set(true);
    this.hasSearched.set(false);
    this.certificate.set(null);
    this.certificatesList.set([]);

    if (this.lookupMode() === 'SECURE') {
      const url = `http://localhost:8080/api/sites/${this.tenantId}/tc`
        + `?admissionNo=${encodeURIComponent(this.form.admissionNo)}`
        + `&fatherName=${encodeURIComponent(this.form.fatherName)}`
        + `&aadharNo=${encodeURIComponent(this.form.aadharNo)}`;

      this.http.get<TransferCertificate[]>(url)
        .subscribe({
          next: (data) => {
            this.isLoading.set(false);
            if (data && data.length > 0) {
              this.certificate.set(data[0]);
            } else {
              this.certificate.set(null);
            }
            this.hasSearched.set(true);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.certificate.set(null);
            this.hasSearched.set(true);
            console.error(err);
          }
        });
    } else {
      let url = `http://localhost:8080/api/sites/${this.tenantId}/tc`
        + `?classLevel=${encodeURIComponent(this.classForm.classLevel)}`
        + `&section=${encodeURIComponent(this.classForm.section)}`;
      if (this.classForm.studentName.trim()) {
        url += `&studentName=${encodeURIComponent(this.classForm.studentName.trim())}`;
      }

      this.http.get<TransferCertificate[]>(url)
        .subscribe({
          next: (data) => {
            this.isLoading.set(false);
            this.certificatesList.set(data);
            if (data.length === 1) {
              this.certificate.set(data[0]);
            }
            this.hasSearched.set(true);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.certificatesList.set([]);
            this.hasSearched.set(true);
            console.error(err);
          }
        });
    }
  }
}
