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
  dateOfBirth?: string;
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
          
          <!-- Class Mode Matching list (privacy-safe: name only) -->
          @if (lookupMode() === 'CLASS' && certificatesList().length > 0 && !certificate() && !verifyingTc()) {
            <div class="ds-card tl-match-card">
              <h4 class="ds-heading tl-match-heading">🔍 Transfer Certificates in {{ classForm.classLevel }} (Section {{ classForm.section }})</h4>
              <p class="tl-intro">For privacy, only names are shown. To view or download a certificate, verify the student's identity details.</p>

              <div class="tl-match-list">
                @for (tc of certificatesList(); track tc.id) {
                  <div class="ds-card ds-card-hover tl-match-row">
                    <div class="tl-match-info">
                      <strong class="tl-match-name">{{ tc.studentName }}</strong>
                      <span class="tl-match-meta">{{ tc.classLevel }} • Section {{ tc.section }}</span>
                    </div>
                    <button (click)="startVerification(tc)" class="ds-btn tl-btn-view" [style.background-color]="primaryColor">
                      🔒 Verify & Download
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Class Mode: identity verification gate before download -->
          @if (verifyingTc()) {
            <div class="ds-card tl-match-card">
              <button (click)="cancelVerification()" class="ds-btn ds-btn-ghost tl-back-btn">⬅️ Back to Search List</button>
              <h4 class="ds-heading tl-match-heading">🔒 Verify Identity to Download — {{ verifyingTc()?.studentName }}</h4>
              <p class="tl-intro">Enter the student's details exactly as recorded. All four must match to download the certificate.</p>

              <form (ngSubmit)="verifyAndDownload()" #dlForm="ngForm" class="tl-secure-form">
                <div class="tl-secure-grid">
                  <div>
                    <label class="tl-label">Admission Number</label>
                    <input type="text" name="dlAdmissionNo" [(ngModel)]="downloadForm.admissionNo" required placeholder="e.g. ADM-901" class="tl-input-secure" />
                  </div>
                  <div>
                    <label class="tl-label">Father's Full Name</label>
                    <input type="text" name="dlFatherName" [(ngModel)]="downloadForm.fatherName" required placeholder="e.g. James Potter" class="tl-input-secure" />
                  </div>
                </div>
                <div class="tl-secure-grid">
                  <div>
                    <label class="tl-label">Date of Birth</label>
                    <input type="date" name="dlDob" [(ngModel)]="downloadForm.dateOfBirth" required class="tl-input-secure" />
                  </div>
                  <div>
                    <label class="tl-label">Candidate's Aadhar Number</label>
                    <input type="text" name="dlAadhar" [(ngModel)]="downloadForm.aadharNo" required placeholder="e.g. 1234-5678-9012" class="tl-input-secure" />
                  </div>
                </div>

                @if (verifyError()) {
                  <div class="ds-alert ds-alert-error ds-shake tl-alert">
                    <span class="tl-alert-icon">⚠️</span>
                    <strong class="tl-alert-title">Verification Failed</strong>
                    <p class="tl-alert-text">{{ verifyError() }}</p>
                  </div>
                }

                <button type="submit" class="ds-btn tl-btn-verify" [disabled]="!dlForm.form.valid || isLoading()" [style.background-color]="primaryColor">
                  {{ isLoading() ? 'Verifying details...' : '⬇️ Verify & Download Certificate' }}
                </button>
              </form>
            </div>
          }

          @if (!certificate() && !verifyingTc() && (lookupMode() === 'SECURE' || (lookupMode() === 'CLASS' && certificatesList().length === 0))) {
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
            
            @if (lookupMode() === 'CLASS') {
              <button (click)="backToList()" class="ds-btn ds-btn-ghost tl-back-btn">
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
                <button type="button" (click)="downloadCertificate()" class="ds-btn tl-download-btn" [style.background-color]="primaryColor">
                  ⬇️ Download Verified Transfer Certificate (PDF)
                </button>
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
  protected readonly verifyingTc = signal<TransferCertificate | null>(null);
  protected readonly verifyError = signal<string>('');

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

  downloadForm = {
    admissionNo: '',
    fatherName: '',
    dateOfBirth: '',
    aadharNo: ''
  };

  private readonly http = inject(HttpClient);

  /** Opens the identity verification gate for a chosen (masked) list entry. */
  startVerification(tc: TransferCertificate) {
    this.verifyingTc.set(tc);
    this.verifyError.set('');
    this.certificate.set(null);
    this.downloadForm = { admissionNo: '', fatherName: '', dateOfBirth: '', aadharNo: '' };
  }

  cancelVerification() {
    this.verifyingTc.set(null);
    this.verifyError.set('');
  }

  backToList() {
    this.certificate.set(null);
    this.verifyingTc.set(null);
  }

  /** Verifies the four identity details against the backend, then downloads on success. */
  verifyAndDownload() {
    this.isLoading.set(true);
    this.verifyError.set('');

    const payload = {
      admissionNo: this.downloadForm.admissionNo.trim(),
      fatherName: this.downloadForm.fatherName.trim(),
      dateOfBirth: this.downloadForm.dateOfBirth.trim(),
      aadharNo: this.downloadForm.aadharNo.trim()
    };

    this.http.post<TransferCertificate>(`http://localhost:8080/api/sites/${this.tenantId}/tc/verify-download`, payload)
      .subscribe({
        next: (data) => {
          this.isLoading.set(false);
          this.verifyingTc.set(null);
          this.certificate.set(data);
          this.downloadCertificate();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.verifyError.set(err?.error?.message
            || 'The details provided do not match our records. Please check and try again.');
        }
      });
  }

  /**
   * Renders the verified certificate as a self-contained, print-ready HTML
   * document in a new window and triggers the browser print dialog so the user
   * can Save-as-PDF. This replaces the old dead `pdfUrl` link that downloaded
   * the SPA's index.html.
   */
  downloadCertificate() {
    const tc = this.certificate();
    if (!tc || typeof window === 'undefined') {
      return;
    }

    const esc = (v: unknown): string =>
      String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const issueDate = tc.issueDate ? new Date(tc.issueDate).toLocaleDateString(undefined,
      { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    const primary = esc(this.primaryColor);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Transfer Certificate ${esc(tc.tcNumber)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #0f172a; margin: 0; padding: 40px; background: #fff; }
  .cert { max-width: 800px; margin: 0 auto; border: 3px double ${primary}; padding: 40px 48px; }
  .head { text-align: center; border-bottom: 2px solid ${primary}; padding-bottom: 16px; margin-bottom: 24px; }
  .flag { font-size: 34px; }
  .board { color: ${primary}; font-size: 22px; margin: 8px 0 2px; letter-spacing: 0.5px; }
  .desk { font-size: 12px; letter-spacing: 2px; color: #475569; text-transform: uppercase; margin: 0; }
  .title { text-align: center; font-size: 18px; font-weight: bold; margin: 18px 0 24px; text-decoration: underline; }
  .status { text-align: center; color: #15803d; font-weight: bold; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 10px 8px; font-size: 14px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  td.label { color: #475569; width: 45%; }
  td.value { font-weight: bold; }
  .foot { margin-top: 40px; display: flex; justify-content: space-between; font-size: 13px; }
  .sign { text-align: center; }
  .sign .line { margin-top: 40px; border-top: 1px solid #0f172a; padding-top: 6px; }
  .note { margin-top: 28px; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print { body { padding: 0; } .cert { border-width: 3px; } }
</style>
</head>
<body>
  <div class="cert">
    <div class="head">
      <div class="flag">🇮🇳</div>
      <h1 class="board">Central Board of Secondary Education</h1>
      <p class="desk">Statutory Transfer Certificate Verification Desk</p>
    </div>
    <div class="title">TRANSFER CERTIFICATE</div>
    <div class="status">🟢 Officially Verified &amp; Active</div>
    <table>
      <tr><td class="label">Certificate Reference No.</td><td class="value">${esc(tc.tcNumber)}</td></tr>
      <tr><td class="label">Issue Date</td><td class="value">${esc(issueDate)}</td></tr>
      <tr><td class="label">Student Full Name</td><td class="value">${esc(tc.studentName)}</td></tr>
      <tr><td class="label">Admission Number</td><td class="value">${esc(tc.admissionNo)}</td></tr>
      <tr><td class="label">Class &amp; Section</td><td class="value">${esc(tc.classLevel)} (Section ${esc(tc.section)})</td></tr>
      <tr><td class="label">Father's Name</td><td class="value">${esc(tc.fatherName)}</td></tr>
      <tr><td class="label">Candidate Aadhar</td><td class="value">${esc(tc.aadharNo)}</td></tr>
    </table>
    <div class="foot">
      <div class="sign"><div class="line">Class Teacher</div></div>
      <div class="sign"><div class="line">Principal / Head of Institution</div></div>
    </div>
    <p class="note">This is a system-generated verification docket. Print or Save-as-PDF to retain a copy.</p>
  </div>
  <script>window.onload = function () { window.focus(); window.print(); };</script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) {
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  verifyTC() {
    this.isLoading.set(true);
    this.hasSearched.set(false);
    this.certificate.set(null);
    this.certificatesList.set([]);
    this.verifyingTc.set(null);
    this.verifyError.set('');

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
            this.certificatesList.set(data || []);
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
