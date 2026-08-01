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

      <!-- Tab Selectors: Single Entry vs Bulk Excel Import -->
      <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
        <button (click)="managerMode.set('SINGLE')" 
          style="background: none; border: 0; padding: 0.4rem 0.8rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; font-size: 0.9rem;"
          [style.border-bottom-color]="managerMode() === 'SINGLE' ? '#1e3a8a' : 'transparent'"
          [style.color]="managerMode() === 'SINGLE' ? '#1e3a8a' : '#64748b'">
          👤 Single Entry Form
        </button>
        <button (click)="managerMode.set('BULK')" 
          style="background: none; border: 0; padding: 0.4rem 0.8rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; font-size: 0.9rem;"
          [style.border-bottom-color]="managerMode() === 'BULK' ? '#1e3a8a' : 'transparent'"
          [style.color]="managerMode() === 'BULK' ? '#1e3a8a' : '#64748b'">
          📋 Bulk Excel / Spreadsheet Importer
        </button>
      </div>

      <!-- Issue New TC Form -->
      @if (managerMode() === 'SINGLE') {
        <form (ngSubmit)="issueTC()" #tcForm="ngForm" style="background: #f8fafc; padding: 1.25rem; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
          <h3 style="margin-top: 0; margin-bottom: 0.5rem; font-size: 1rem; color: #1e293b; font-weight: 700;">Issue Official Transfer Certificate</h3>
          
          <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Student Full Name</label>
              <input type="text" name="studentName" [(ngModel)]="newTC.studentName" required placeholder="e.g. Harry Potter" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Admission Number</label>
              <input type="text" name="admissionNo" [(ngModel)]="newTC.admissionNo" required placeholder="e.g. ADM-901" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
          </div>

          <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Father's Name</label>
              <input type="text" name="fatherName" [(ngModel)]="newTC.fatherName" required placeholder="e.g. James Potter" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Aadhar Card Number</label>
              <input type="text" name="aadharNo" [(ngModel)]="newTC.aadharNo" required placeholder="e.g. 1234-5678-9012" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
          </div>

          <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Class Level</label>
              <select name="classLevel" [(ngModel)]="newTC.classLevel" required style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
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
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Section</label>
              <select name="section" [(ngModel)]="newTC.section" required style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
              </select>
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
      }

      <!-- Mode 2: Bulk Excel / Spreadsheet Importer -->
      @if (managerMode() === 'BULK') {
        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
          <h3 style="margin-top: 0; margin-bottom: 0.5rem; font-size: 1.15rem; color: #1e293b; font-weight: 700;">Excel / Spreadsheet Copy-Paste Importer</h3>
          
          <!-- Bulk Mode Switcher -->
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
            <button (click)="bulkUploadMode.set('CLASS'); parseSpreadsheet()" 
              [style.background]="bulkUploadMode() === 'CLASS' ? '#1e3a8a' : 'white'"
              [style.color]="bulkUploadMode() === 'CLASS' ? 'white' : '#475569'"
              style="border: 1px solid #cbd5e1; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.8rem;">
              🏫 Class-wise Excel Upload
            </button>
            <button (click)="bulkUploadMode.set('SCHOOL'); parseSpreadsheet()" 
              [style.background]="bulkUploadMode() === 'SCHOOL' ? '#1e3a8a' : 'white'"
              [style.color]="bulkUploadMode() === 'SCHOOL' ? 'white' : '#475569'"
              style="border: 1px solid #cbd5e1; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.8rem;">
              🌐 School-wide Master Excel Upload
            </button>
          </div>

          @if (bulkUploadMode() === 'CLASS') {
            <!-- Class Selection dropdowns for bulk -->
            <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; background: white; padding: 1rem; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Select Target Class</label>
                <select name="bulkClass" [(ngModel)]="bulkClass" (change)="parseSpreadsheet()" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white; font-weight: 600;">
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
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Select Target Section</label>
                <select name="bulkSection" [(ngModel)]="bulkSection" (change)="parseSpreadsheet()" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white; font-weight: 600;">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
            </div>

            <p style="color: #64748b; font-size: 0.8rem; margin-top: 0; margin-bottom: 1rem;">
              <strong>Class-wise Format columns (Tab-separated Excel copy):</strong><br />
              <code>Student Name [Tab] Admission No [Tab] Father Name [Tab] Aadhar No [Tab] TC Number [Tab] Issue Date</code>
            </p>
          } @else {
            <p style="color: #64748b; font-size: 0.8rem; margin-top: 0; margin-bottom: 1rem;">
              <strong>School-wide Format columns (Tab-separated Excel copy):</strong><br />
              <code>Student Name [Tab] Admission No [Tab] Father Name [Tab] Aadhar No [Tab] Class [Tab] Section [Tab] TC Number [Tab] Issue Date</code>
            </p>
          }

          <textarea [(ngModel)]="pasteAreaText" rows="6" (input)="parseSpreadsheet()"
            [placeholder]="bulkUploadMode() === 'CLASS' 
              ? 'Harry Potter\tADM-101\tJames Potter\t1234-5678-9012\tTC-2026-001\t2026-07-20T10:00\nHermione Granger\tADM-102\tMr. Granger\t9876-5432-1098\tTC-2026-002\t2026-07-20T10:00'
              : 'Harry Potter\tADM-101\tJames Potter\t1234-5678-9012\t1st\tA\tTC-2026-001\t2026-07-20T10:00\nHermione Granger\tADM-102\tMr. Granger\t9876-5432-1098\t2nd\tB\tTC-2026-002\t2026-07-20T10:00'"
            style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 0.85rem; box-sizing: border-box; resize: vertical; margin-bottom: 1rem;">
          </textarea>

          <!-- Parsed TC Preview Grid -->
          @if (parsedRows().length > 0) {
            <div style="margin-top: 1.5rem; border-top: 1px solid #cbd5e1; padding-top: 1rem;">
              <h4 style="margin-top: 0; margin-bottom: 0.75rem; font-size: 0.95rem; color: #0f172a; font-weight: 700;">📋 Parsed Verification Grid ({{ parsedRows().length }} rows)</h4>
              
              <div class="table-responsive-wrapper" style="background: white; margin-bottom: 1.25rem;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
                  <thead>
                    <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: 700;">
                      <th style="padding: 0.5rem 0.75rem;">Student Name</th>
                      <th style="padding: 0.5rem 0.75rem;">Admission No</th>
                      <th style="padding: 0.5rem 0.75rem;">Father\'s Name</th>
                      <th style="padding: 0.5rem 0.75rem;">Class (Section)</th>
                      <th style="padding: 0.5rem 0.75rem;">TC No</th>
                      <th style="padding: 0.5rem 0.75rem;">Issue Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of parsedRows(); track $index) {
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 0.5rem 0.75rem; font-weight: 700;">{{ row.studentName }}</td>
                        <td style="padding: 0.5rem 0.75rem;">{{ row.admissionNo }}</td>
                        <td style="padding: 0.5rem 0.75rem;">{{ row.fatherName }}</td>
                        <td style="padding: 0.5rem 0.75rem; color: #64748b;">{{ row.classLevel }} (Section {{ row.section }})</td>
                        <td style="padding: 0.5rem 0.75rem; font-weight: 700; color: #1e3a8a;">{{ row.tcNumber }}</td>
                        <td style="padding: 0.5rem 0.75rem;">{{ row.issueDate | date:\'mediumDate\' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button (click)="clearParsed()" style="background: white; border: 1px solid #cbd5e1; color: #475569; padding: 0.55rem 1.25rem; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
                  Clear All
                </button>
                <button (click)="importParsedRows()" [disabled]="isImporting()" style="background: #10b981; color: white; border: 0; padding: 0.55rem 1.25rem; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.85rem;">
                  {{ isImporting() ? \'Importing ledger...\' : \'Confirm Bulk Import to Database\' }}
                </button>
              </div>
            </div>
          }
        </div>
      }

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
  protected readonly managerMode = signal<string>('SINGLE'); // SINGLE, BULK
  protected readonly parsedRows = signal<TransferCertificate[]>([]);
  protected readonly isImporting = signal(false);

  // New bulk upload state variables
  protected readonly bulkUploadMode = signal<string>('CLASS'); // CLASS, SCHOOL
  bulkClass: string = '1st';
  bulkSection: string = 'A';

  pasteAreaText: string = '';

  newTC = {
    studentName: '',
    admissionNo: '',
    classLevel: '1st',
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

  parseSpreadsheet() {
    if (!this.pasteAreaText.trim()) return;

    const lines = this.pasteAreaText.split('\n');
    const rows: TransferCertificate[] = [];

    lines.forEach(line => {
      if (!line.trim()) return;

      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      
      if (this.bulkUploadMode() === 'CLASS') {
        // Format: Student Name [0], Admission No [1], Father Name [2], Aadhar No [3], TC Number [4], Issue Date [5]
        if (parts.length >= 5) {
          rows.push({
            studentName: parts[0]?.trim() || 'Unknown Student',
            admissionNo: parts[1]?.trim() || 'ADM-MOCK',
            fatherName: parts[2]?.trim() || 'Unknown Father',
            aadharNo: parts[3]?.trim() || 'MOCK-AADHAR',
            classLevel: this.bulkClass,
            section: this.bulkSection,
            tcNumber: parts[4]?.trim() || 'TC-MOCK',
            issueDate: parts[5]?.trim() || new Date().toISOString()
          });
        }
      } else {
        // Format: Student Name [0], Admission No [1], Father Name [2], Aadhar No [3], Class [4], Section [5], TC Number [6], Issue Date [7]
        if (parts.length >= 7) {
          rows.push({
            studentName: parts[0]?.trim() || 'Unknown Student',
            admissionNo: parts[1]?.trim() || 'ADM-MOCK',
            fatherName: parts[2]?.trim() || 'Unknown Father',
            aadharNo: parts[3]?.trim() || 'MOCK-AADHAR',
            classLevel: parts[4]?.trim() || '1st',
            section: parts[5]?.trim() || 'A',
            tcNumber: parts[6]?.trim() || 'TC-MOCK',
            issueDate: parts[7]?.trim() || new Date().toISOString()
          });
        }
      }
    });

    this.parsedRows.set(rows);
  }

  clearParsed() {
    this.parsedRows.set([]);
    this.pasteAreaText = '';
  }

  importParsedRows() {
    const list = this.parsedRows();
    if (list.length === 0) return;

    this.isImporting.set(true);
    let completedCount = 0;

    list.forEach(row => {
      this.http.post<TransferCertificate>(`http://localhost:8080/api/admin/sites/${this.tenantId}/tc`, row)
        .subscribe({
          next: () => {
            completedCount++;
            if (completedCount === list.length) {
              this.isImporting.set(false);
              this.clearParsed();
              this.fetchTCs();
              this.tcModified.emit();
            }
          },
          error: (err) => {
            console.error('Failed to import TC', row, err);
            completedCount++;
            if (completedCount === list.length) {
              this.isImporting.set(false);
              this.clearParsed();
              this.fetchTCs();
              this.tcModified.emit();
            }
          }
        });
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
