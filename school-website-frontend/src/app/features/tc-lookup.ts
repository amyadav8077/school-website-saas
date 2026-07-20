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
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 2.5rem; max-width: 850px; margin: 2rem auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05); box-sizing: border-box; width: 100%;">
      
      <div style="text-align: center; margin-bottom: 2rem;">
        <span [style.color]="accentColor" style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.5rem;">Certificate Verification</span>
        <h3 [style.color]="primaryColor" style="font-size: 1.5rem; font-weight: 800; margin: 0; letter-spacing: -0.025em; line-height: 1.2;">Verify and Download Transfer Certificate</h3>
        <p style="color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; margin-bottom: 1.5rem;">
          To comply with CBSE board verification parameters, search for active student records class-wise or verify using credentials.
        </p>
      </div>

      <!-- Mode Tab Selectors -->
      <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
        <button (click)="lookupMode.set('CLASS')" 
          style="background: none; border: 0; padding: 0.4rem 0.8rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; font-size: 0.9rem;"
          [style.border-bottom-color]="lookupMode() === 'CLASS' ? primaryColor : 'transparent'"
          [style.color]="lookupMode() === 'CLASS' ? primaryColor : '#64748b'">
          🏫 Class & Section Search
        </button>
        <button (click)="lookupMode.set('SECURE')" 
          style="background: none; border: 0; padding: 0.4rem 0.8rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; font-size: 0.9rem;"
          [style.border-bottom-color]="lookupMode() === 'SECURE' ? primaryColor : 'transparent'"
          [style.color]="lookupMode() === 'SECURE' ? primaryColor : '#64748b'">
          🔒 Secured Verify ID Look
        </button>
      </div>

      <!-- Mode 1: Class and Section Lookup Form -->
      @if (lookupMode() === 'CLASS') {
        <form (ngSubmit)="verifyTC()" #classSearchForm="ngForm" style="display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #cbd5e1;">
          <div style="flex: 1; min-width: 150px;">
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Select Class</label>
            <select name="classLevel" [(ngModel)]="classForm.classLevel" required style="width: 100%; padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; background: white; font-weight: 600;">
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
          <div style="flex: 1; min-width: 100px;">
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Select Section</label>
            <select name="section" [(ngModel)]="classForm.section" required style="width: 100%; padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; background: white; font-weight: 600;">
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
          </div>
          <div style="flex: 2; min-width: 200px;">
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Student Name (Optional)</label>
            <input type="text" name="studentName" [(ngModel)]="classForm.studentName" placeholder="Enter name or leave empty to list all" 
              style="width: 100%; padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; box-sizing: border-box;" />
          </div>
          <div style="width: 100%; display: flex; align-items: flex-end; margin-top: 0.5rem;">
            <button type="submit" [disabled]="!classSearchForm.form.valid || isLoading()" [style.background-color]="primaryColor" style="width: 100%; border: 0; color: white; padding: 0.75rem; border-radius: 6px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;">
              {{ isLoading() ? 'Searching TC registry...' : '🔍 Find Certificates' }}
            </button>
          </div>
        </form>
      }

      <!-- Mode 2: Verification Inquiry Form -->
      @if (lookupMode() === 'SECURE') {
        <form (ngSubmit)="verifyTC()" #verifyForm="ngForm" style="display: flex; flex-direction: column; gap: 1.25rem; background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
          
          <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Admission Number</label>
              <input type="text" name="admissionNo" [(ngModel)]="form.admissionNo" required placeholder="e.g. ADM-901" 
                style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem; background: white;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Father's Full Name</label>
              <input type="text" name="fatherName" [(ngModel)]="form.fatherName" required placeholder="e.g. James Potter" 
                style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem; background: white;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Candidate's Aadhar Card Number</label>
            <input type="text" name="aadharNo" [(ngModel)]="form.aadharNo" required placeholder="e.g. 1234-5678-9012" 
              style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem; background: white;" />
          </div>

          <button type="submit" [disabled]="!verifyForm.form.valid || isLoading()" [style.background-color]="primaryColor"
            style="border: 0; color: white; padding: 0.75rem; border-radius: 6px; font-size: 0.95rem; font-weight: 700; cursor: pointer; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: background 0.2s;">
            {{ isLoading() ? 'Searching compliance records...' : '🔍 Verify Transfer Certificate' }}
          </button>
        </form>
      }

      <!-- Verification Output -->
      @if (hasSearched()) {
        <div>
          
          <!-- Class Mode Matching list -->
          @if (lookupMode() === 'CLASS' && certificatesList().length > 0 && !certificate()) {
            <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
              <h4 style="color: #0f172a; font-size: 1.1rem; font-weight: 700; margin-top: 0; margin-bottom: 1rem;">🔍 Matching Transfer Certificates in {{ classForm.classLevel }} (Section {{ classForm.section }})</h4>
              
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                @for (tc of certificatesList(); track tc.id) {
                  <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 1rem; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; flex-wrap: wrap; gap: 0.75rem;">
                    <div style="text-align: left;">
                      <strong style="color: #0f172a; font-size: 1rem; display: block;">{{ tc.studentName }}</strong>
                      <span style="font-size: 0.8rem; color: #64748b;">Adm No: {{ tc.admissionNo }} • Father: {{ tc.fatherName }}</span>
                    </div>
                    <button (click)="selectTC(tc)" [style.background-color]="primaryColor" style="border: 0; color: white; padding: 0.45rem 1rem; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.85rem;">
                      📜 View Certificate
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          @if (!certificate() && (lookupMode() === 'SECURE' || (lookupMode() === 'CLASS' && certificatesList().length === 0))) {
            <!-- Error Alert -->
            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 1.5rem; border-radius: 8px; text-align: center; color: #b91c1c;">
              <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">⚠️</span>
              <strong style="display: block; font-size: 1.05rem; margin-bottom: 0.25rem;">No Verification Record Found</strong>
              <p style="font-size: 0.85rem; line-height: 1.5; margin: 0;">
                The student credentials entered do not match any issued Transfer Certificates in our PostgreSQL ledger. 
                Please verify spelling, Admission Number formats, or contact our administrative campus office.
              </p>
            </div>
          } @else if (certificate()) {
            
            @if (lookupMode() === 'CLASS' && certificatesList().length > 1) {
              <button (click)="certificate.set(null)" style="background: none; border: 1px solid #cbd5e1; color: #475569; padding: 0.45rem 1rem; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.85rem; margin-bottom: 1rem; display: block;">
                ⬅️ Back to Search List
              </button>
            }

            <!-- Highly Official Printable TC Verification Docket -->
            <div style="border: 3px double #cbd5e1; border-radius: 10px; padding: 2rem; background: #fafafa; font-family: Georgia, serif; box-shadow: inset 0 0 15px rgba(0,0,0,0.02); position: relative; box-sizing: border-box; width: 100%;">
              
              <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                <span style="font-size: 2rem; display: block; margin-bottom: 0.25rem;">🇮🇳</span>
                <h4 style="font-size: 1.3rem; font-weight: 800; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: 0.02em;">Central Board of Secondary Education</h4>
                <p style="font-size: 0.8rem; color: #475569; margin: 0.25rem 0 0 0; font-family: sans-serif; font-weight: 700;">STATUTORY TRANSFER CERTIFICATE VERIFICATION DESK</p>
              </div>

              <!-- TC Details grid -->
              <div style="font-size: 0.95rem; line-height: 1.8; color: #334155; margin-bottom: 2rem; text-align: left;">
                <div>Certificate Status: <strong style="color: #16a34a;">🟢 OFFICIALLY VERIFIED & ACTIVE</strong></div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem; border-top: 1px dashed #cbd5e1; padding-top: 1rem;" class="mobile-grid-1">
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
              <div style="text-align: center; border-top: 1px solid #cbd5e1; padding-top: 1.5rem;">
                <a [href]="certificate()?.pdfUrl" download [style.background-color]="primaryColor" style="display: inline-flex; align-items: center; gap: 0.5rem; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-family: sans-serif; font-size: 0.95rem; box-shadow: 0 4px 6px rgba(0,0,0,0.15); transition: background 0.2s; cursor: pointer;">
                  ⬇️ Download Verified Transfer Certificate (PDF)
                </a>
              </div>

            </div>

          }
        </div>
      }

    </div>
  `
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
