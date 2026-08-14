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
  styleUrl: './tc-manager.component.scss',
  template: `
    <div class="ds-card ds-reveal tm-card">
      <h2 class="ds-heading tm-heading">Transfer Certificates <span class="ds-heading-grad">Registry Office</span></h2>
      <p class="tm-subtitle">Issue and verify legal Transfer Certificates (TC) for students of: <strong class="tm-tenant-name">{{ tenantName }}</strong></p>

      <!-- Tab Selectors: Single Entry vs Bulk Excel Import -->
      <div class="tm-tabs">
        <button (click)="managerMode.set('SINGLE')" 
          class="tm-tab-btn"
          [style.border-bottom-color]="managerMode() === 'SINGLE' ? '#1e3a8a' : 'transparent'"
          [style.color]="managerMode() === 'SINGLE' ? '#1e3a8a' : '#64748b'">
          👤 Single Entry Form
        </button>
        <button (click)="managerMode.set('BULK')" 
          class="tm-tab-btn"
          [style.border-bottom-color]="managerMode() === 'BULK' ? '#1e3a8a' : 'transparent'"
          [style.color]="managerMode() === 'BULK' ? '#1e3a8a' : '#64748b'">
          📋 Bulk Excel / Spreadsheet Importer
        </button>
      </div>

      <!-- Issue New TC Form -->
      @if (managerMode() === 'SINGLE') {
        <form (ngSubmit)="issueTC()" #tcForm="ngForm" class="tm-form">
          <h3 class="ds-heading tm-form-heading">Issue Official Transfer Certificate</h3>
          
          <div class="mobile-grid-1 tm-grid-2">
            <div>
              <label class="tm-label">Student Full Name</label>
              <input type="text" name="studentName" [(ngModel)]="newTC.studentName" required placeholder="e.g. Harry Potter" class="tm-input" />
            </div>
            <div>
              <label class="tm-label">Admission Number</label>
              <input type="text" name="admissionNo" [(ngModel)]="newTC.admissionNo" required placeholder="e.g. ADM-901" class="tm-input" />
            </div>
          </div>

          <div class="mobile-grid-1 tm-grid-2">
            <div>
              <label class="tm-label">Father's Name</label>
              <input type="text" name="fatherName" [(ngModel)]="newTC.fatherName" required placeholder="e.g. James Potter" class="tm-input" />
            </div>
            <div>
              <label class="tm-label">Aadhar Card Number</label>
              <input type="text" name="aadharNo" [(ngModel)]="newTC.aadharNo" required placeholder="e.g. 1234-5678-9012" class="tm-input" />
            </div>
          </div>

          <div class="mobile-grid-1 tm-grid-3">
            <div>
              <label class="tm-label">Class Level</label>
              <select name="classLevel" [(ngModel)]="newTC.classLevel" required class="tm-select">
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
              <label class="tm-label">Section</label>
              <select name="section" [(ngModel)]="newTC.section" required class="tm-select">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
              </select>
            </div>
            <div>
              <label class="tm-label">TC Certificate No.</label>
              <input type="text" name="tcNumber" [(ngModel)]="newTC.tcNumber" required placeholder="e.g. TC-2026-001" class="tm-input" />
            </div>
          </div>

          <div class="tm-form-actions">
            <button type="submit" [disabled]="!tcForm.form.valid" class="ds-btn ds-btn-primary tm-submit-btn">
              Issue & Publish Certificate
            </button>
          </div>
        </form>
      }

      <!-- Mode 2: Bulk Excel / Spreadsheet Importer -->
      @if (managerMode() === 'BULK') {
        <div class="tm-bulk-panel">
          <h3 class="ds-heading tm-bulk-heading">Excel / Spreadsheet Copy-Paste Importer</h3>
          
          <!-- Bulk Mode Switcher -->
          <div class="tm-bulk-switcher">
            <button (click)="bulkUploadMode.set('CLASS'); parseSpreadsheet()" 
              [style.background]="bulkUploadMode() === 'CLASS' ? '#1e3a8a' : 'white'"
              [style.color]="bulkUploadMode() === 'CLASS' ? 'white' : '#475569'"
              class="tm-bulk-mode-btn">
              🏫 Class-wise Excel Upload
            </button>
            <button (click)="bulkUploadMode.set('SCHOOL'); parseSpreadsheet()" 
              [style.background]="bulkUploadMode() === 'SCHOOL' ? '#1e3a8a' : 'white'"
              [style.color]="bulkUploadMode() === 'SCHOOL' ? 'white' : '#475569'"
              class="tm-bulk-mode-btn">
              🌐 School-wide Master Excel Upload
            </button>
          </div>

          @if (bulkUploadMode() === 'CLASS') {
            <!-- Class Selection dropdowns for bulk -->
            <div class="mobile-grid-1 tm-bulk-select-grid">
              <div>
                <label class="tm-label">Select Target Class</label>
                <select name="bulkClass" [(ngModel)]="bulkClass" (change)="parseSpreadsheet()" class="tm-bulk-select">
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
                <label class="tm-label">Select Target Section</label>
                <select name="bulkSection" [(ngModel)]="bulkSection" (change)="parseSpreadsheet()" class="tm-bulk-select">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
            </div>

            <p class="tm-format-note">
              <strong>Class-wise Format columns (Tab-separated Excel copy):</strong><br />
              <code>Student Name [Tab] Admission No [Tab] Father Name [Tab] Aadhar No [Tab] TC Number [Tab] Issue Date</code>
            </p>
          } @else {
            <p class="tm-format-note">
              <strong>School-wide Format columns (Tab-separated Excel copy):</strong><br />
              <code>Student Name [Tab] Admission No [Tab] Father Name [Tab] Aadhar No [Tab] Class [Tab] Section [Tab] TC Number [Tab] Issue Date</code>
            </p>
          }

          <textarea [(ngModel)]="pasteAreaText" rows="6" (input)="parseSpreadsheet()"
            [placeholder]="bulkUploadMode() === 'CLASS' 
              ? 'Harry Potter\tADM-101\tJames Potter\t1234-5678-9012\tTC-2026-001\t2026-07-20T10:00\nHermione Granger\tADM-102\tMr. Granger\t9876-5432-1098\tTC-2026-002\t2026-07-20T10:00'
              : 'Harry Potter\tADM-101\tJames Potter\t1234-5678-9012\t1st\tA\tTC-2026-001\t2026-07-20T10:00\nHermione Granger\tADM-102\tMr. Granger\t9876-5432-1098\t2nd\tB\tTC-2026-002\t2026-07-20T10:00'"
            class="tm-textarea">
          </textarea>

          <!-- Parsed TC Preview Grid -->
          @if (parsedRows().length > 0) {
            <div class="tm-preview-section">
              <h4 class="tm-preview-heading">📋 Parsed Verification Grid ({{ parsedRows().length }} rows)</h4>
              
              <div class="table-responsive-wrapper tm-preview-table-wrapper">
                <table class="tm-preview-table">
                  <thead>
                    <tr class="tm-preview-thead-row">
                      <th class="tm-preview-th">Student Name</th>
                      <th class="tm-preview-th">Admission No</th>
                      <th class="tm-preview-th">Father\'s Name</th>
                      <th class="tm-preview-th">Class (Section)</th>
                      <th class="tm-preview-th">TC No</th>
                      <th class="tm-preview-th">Issue Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of parsedRows(); track $index) {
                      <tr class="tm-preview-body-row">
                        <td class="tm-preview-td-bold">{{ row.studentName }}</td>
                        <td class="tm-preview-td">{{ row.admissionNo }}</td>
                        <td class="tm-preview-td">{{ row.fatherName }}</td>
                        <td class="tm-preview-td-muted">{{ row.classLevel }} (Section {{ row.section }})</td>
                        <td class="tm-preview-td-tc">{{ row.tcNumber }}</td>
                        <td class="tm-preview-td">{{ row.issueDate | date:\'mediumDate\' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="tm-preview-actions">
                <button (click)="clearParsed()" class="ds-btn ds-btn-ghost tm-btn-sm">
                  Clear All
                </button>
                <button (click)="importParsedRows()" [disabled]="isImporting()" class="ds-btn ds-btn-success tm-btn-sm">
                  @if (isImporting()) { <span class="ds-spinner"></span> Importing ledger... } @else { Confirm Bulk Import to Database }
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Issued TCs list -->
      <h3 class="ds-heading tm-list-heading">Issued Transfer Certificates</h3>
      @if (certificates().length === 0) {
        <p class="tm-empty-note">No Transfer Certificates issued currently.</p>
      } @else {
        <div class="tm-list-scroll">
          <table class="tm-list-table">
            <thead>
              <tr class="tm-list-thead-row">
                <th class="tm-list-th">TC Ref ID</th>
                <th class="tm-list-th">Student Details</th>
                <th class="tm-list-th">Parents / Aadhar</th>
                <th class="tm-list-th">Issue Date</th>
                <th class="tm-list-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (tc of certificates(); track tc.id) {
                <tr class="tm-list-body-row">
                  <td class="tm-list-td-tc">{{ tc.tcNumber }}</td>
                  <td class="tm-list-td">
                    <strong class="tm-student-name">{{ tc.studentName }}</strong>
                    <span class="tm-student-sub">Adm No: {{ tc.admissionNo }} • {{ tc.classLevel }} [{{ tc.section }}]</span>
                  </td>
                  <td class="tm-list-td-parents">
                    <span class="tm-parent-line">Father: <strong>{{ tc.fatherName }}</strong></span>
                    <span class="tm-aadhar-sub">Aadhar: {{ tc.aadharNo }}</span>
                  </td>
                  <td class="tm-list-td-muted">{{ tc.issueDate | date:'mediumDate' }}</td>
                  <td class="tm-list-td-actions">
                    <button (click)="deleteTC(tc.id!)" class="ds-btn ds-btn-danger tm-delete-btn">
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
