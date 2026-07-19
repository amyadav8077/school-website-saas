import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface TransferCertificate {
  id?: number;
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
  selector: 'app-tc-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #1e293b; margin-top: 0; margin-bottom: 0.5rem; font-weight: 700;">Transfer Certificates Registry Office</h2>
      <p style="color: #64748b; font-size: 0.9rem; margin-top: 0; margin-bottom: 1.5rem;">Issue and verify legal Transfer Certificates (TC) for students of: <strong style="color: #0f172a;">{{ tenantName }}</strong></p>

      <!-- Issue New TC Form -->
      <form (ngSubmit)="issueTC()" #tcForm="ngForm" style="background: #f8fafc; padding: 1.25rem; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
        <h3 style="margin-top: 0; margin-bottom: 0.5rem; font-size: 1rem; color: #1e293b; font-weight: 700;">Issue Official Transfer Certificate</h3>
        
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Student Full Name</label>
            <input type="text" name="studentName" [(ngModel)]="newTC.studentName" required placeholder="e.g. Harry Potter" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Admission Number</label>
            <input type="text" name="admissionNo" [(ngModel)]="newTC.admissionNo" required placeholder="e.g. ADM-901" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Father's Name</label>
            <input type="text" name="fatherName" [(ngModel)]="newTC.fatherName" required placeholder="e.g. James Potter" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Aadhar Card Number</label>
            <input type="text" name="aadharNo" [(ngModel)]="newTC.aadharNo" required placeholder="e.g. 1234-5678-9012" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Class Level</label>
            <select name="classLevel" [(ngModel)]="newTC.classLevel" required style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
              <option value="Primary School (G1-5)">Primary School (G1-5)</option>
              <option value="Middle School (G6-8)">Middle School (G6-8)</option>
              <option value="High School (G9-12)">High School (G9-12)</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Section</label>
            <input type="text" name="section" [(ngModel)]="newTC.section" required placeholder="e.g. A" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">TC Certificate No.</label>
            <input type="text" name="tcNumber" [(ngModel)]="newTC.tcNumber" required placeholder="e.g. TC-2026-001" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
          </div>
        </div>

        <div style="text-align: right;">
          <button type="submit" [disabled]="!tcForm.form.valid" style="background: #1e3a8a; color: white; border: 0; padding: 0.65rem 1.25rem; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
            Issue & Publish Certificate
          </button>
        </div>
      </form>

      <!-- Issued TCs list -->
      <h3 style="margin-bottom: 0.75rem; color: #1e293b; font-weight: 700; font-size: 1.2rem;">Issued Transfer Certificates</h3>
      @if (certificates().length === 0) {
        <p style="color: #64748b; font-style: italic;">No Transfer Certificates issued currently.</p>
      } @else {
        <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: 600;">
                <th style="padding: 0.75rem 1rem;">TC Ref ID</th>
                <th style="padding: 0.75rem 1rem;">Student Details</th>
                <th style="padding: 0.75rem 1rem;">Parents / Aadhar</th>
                <th style="padding: 0.75rem 1rem;">Issue Date</th>
                <th style="padding: 0.75rem 1rem; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (tc of certificates(); track tc.id) {
                <tr style="border-bottom: 1px solid #e2e8f0; hover: background-color: #f8fafc;">
                  <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">{{ tc.tcNumber }}</td>
                  <td style="padding: 0.75rem 1rem;">
                    <strong style="color: #0f172a; display: block;">{{ tc.studentName }}</strong>
                    <span style="font-size: 0.75rem; color: #64748b;">Adm No: {{ tc.admissionNo }} • {{ tc.classLevel }} [{{ tc.section }}]</span>
                  </td>
                  <td style="padding: 0.75rem 1rem; color: #475569;">
                    <span style="display: block;">Father: <strong>{{ tc.fatherName }}</strong></span>
                    <span style="font-size: 0.75rem; color: #64748b;">Aadhar: {{ tc.aadharNo }}</span>
                  </td>
                  <td style="padding: 0.75rem 1rem; color: #64748b;">{{ tc.issueDate | date:'mediumDate' }}</td>
                  <td style="padding: 0.75rem 1rem; text-align: right;">
                    <button (click)="deleteTC(tc.id!)" style="background: none; border: 0; color: #ef4444; font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class TCManagerComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() tenantName!: string;
  @Input() refreshTrigger: number = 0;
  @Output() tcModified = new EventEmitter<void>();

  protected readonly certificates = signal<TransferCertificate[]>([]);

  newTC = {
    studentName: '',
    admissionNo: '',
    classLevel: 'High School (G9-12)',
    section: 'A',
    fatherName: '',
    aadharNo: '',
    tcNumber: 'TC-2026-001',
    pdfUrl: '/documents/tc-custom.pdf'
  };

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['tenantId'] && this.tenantId) || (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange)) {
      this.fetchTCs();
    }
  }

  fetchTCs() {
    this.http.get<TransferCertificate[]>(`http://localhost:8080/api/admin/sites/${this.tenantId}/tc`)
      .subscribe({
        next: (data) => this.certificates.set(data),
        error: (err) => console.error(err)
      });
  }

  issueTC() {
    this.http.post<TransferCertificate>(`http://localhost:8080/api/admin/sites/${this.tenantId}/tc`, this.newTC)
      .subscribe({
        next: () => {
          this.fetchTCs();
          this.tcModified.emit();
          // Reset form fields
          this.newTC.studentName = '';
          this.newTC.admissionNo = '';
          this.newTC.fatherName = '';
          this.newTC.aadharNo = '';
          this.newTC.tcNumber = 'TC-2026-' + (this.certificates().length + 1);
        },
        error: (err) => console.error(err)
      });
  }

  deleteTC(id: number) {
    this.http.delete(`http://localhost:8080/api/admin/tc/${id}`)
      .subscribe({
        next: () => {
          this.fetchTCs();
          this.tcModified.emit();
        },
        error: (err) => console.error(err)
      });
  }
}
