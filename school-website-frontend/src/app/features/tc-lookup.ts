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
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 2.5rem; max-width: 850px; margin: 2rem auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; margin-bottom: 2rem;">
        <span [style.color]="accentColor" style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.5rem;">Certificate Verification</span>
        <h3 [style.color]="primaryColor" style="font-size: 1.5rem; font-weight: 800; margin: 0; letter-spacing: -0.025em; line-height: 1.2;">Verify and Download Transfer Certificate</h3>
        <p style="color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; margin-bottom: 0;">
          To comply with CBSE board verification parameters, enter your child's Admission Number, Father's Name, and Aadhar details to verify and print their legal Transfer Certificate (TC).
        </p>
      </div>

      <!-- Verification Inquiry Form -->
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

      <!-- Verification Output -->
      @if (hasSearched()) {
        <div>
          @if (!certificate()) {
            <!-- Error Alert -->
            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 1.5rem; border-radius: 8px; text-align: center; color: #b91c1c;">
              <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">⚠️</span>
              <strong style="display: block; font-size: 1.05rem; margin-bottom: 0.25rem;">No Verification Record Found</strong>
              <p style="font-size: 0.85rem; line-height: 1.5; margin: 0;">
                The student credentials entered do not match any issued Transfer Certificates in our PostgreSQL ledger. 
                Please verify spelling, Admission Number formats, or contact our administrative campus office.
              </p>
            </div>
          } @else {
            
            <!-- Highly Official Printable TC Verification Docket -->
            <div style="border: 3px double #cbd5e1; border-radius: 10px; padding: 2rem; background: #fafafa; font-family: Georgia, serif; box-shadow: inset 0 0 15px rgba(0,0,0,0.02); position: relative;">
              
              <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                <span style="font-size: 2rem; display: block; margin-bottom: 0.25rem;">🇮🇳</span>
                <h4 style="font-size: 1.3rem; font-weight: 800; color: #1e3a8a; margin: 0; text-transform: uppercase; letter-spacing: 0.02em;">Central Board of Secondary Education</h4>
                <p style="font-size: 0.8rem; color: #475569; margin: 0.25rem 0 0 0; font-family: sans-serif; font-weight: 700;">STATUTORY TRANSFER CERTIFICATE VERIFICATION DESK</p>
              </div>

              <!-- TC Details grid -->
              <div style="font-size: 0.95rem; line-height: 1.8; color: #334155; margin-bottom: 2rem;">
                <div>Certificate Status: <strong style="color: #16a34a;">🟢 OFFICIALLY VERIFIED & ACTIVE</strong></div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem; border-top: 1px dashed #cbd5e1; padding-top: 1rem;">
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
  protected readonly hasSearched = signal(false);
  protected readonly isLoading = signal(false);

  form = {
    admissionNo: '',
    fatherName: '',
    aadharNo: ''
  };

  private readonly http = inject(HttpClient);

  verifyTC() {
    this.isLoading.set(true);
    this.hasSearched.set(false);
    this.certificate.set(null);

    const url = `http://localhost:8080/api/sites/${this.tenantId}/tc`
      + `?admissionNo=${this.form.admissionNo}`
      + `&fatherName=${this.form.fatherName}`
      + `&aadharNo=${this.form.aadharNo}`;

    this.http.get<TransferCertificate>(url)
      .subscribe({
        next: (data: TransferCertificate) => {
          this.isLoading.set(false);
          this.certificate.set(data);
          this.hasSearched.set(true);
        },
        error: (err: any) => {
          this.isLoading.set(false);
          this.certificate.set(null);
          this.hasSearched.set(true);
          console.error(err);
        }
      });
  }
}
