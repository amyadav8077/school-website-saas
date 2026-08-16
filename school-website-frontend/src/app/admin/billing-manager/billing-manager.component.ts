import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface FeeItem {
  id?: number;
  name: string;
  amount: number;
  description: string;
  gradeLevel: string;
}

export interface StudentInvoice {
  id?: number;
  studentName: string;
  gradeLevel: string; // (classLevel)
  feeItemName: string;
  amount: number;
  status: string; // PENDING, PAID
  dueDate: string;
  paymentDate?: string;
  admissionNo?: string;
  section?: string;
  fatherName?: string;
  aadharNo?: string;
}

@Component({
  selector: 'app-billing-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ds-card ds-reveal bm-card">
      <h2 class="ds-heading bm-heading-main">Financial Fee & <span class="ds-heading-grad">Invoicing Office</span></h2>
      <p class="bm-intro">Configure fee models and assign invoices to students of: <strong class="bm-intro-strong">{{ tenantName }}</strong></p>

      <!-- Tab Selectors: Single Invoice vs Bulk Importer -->
      <div class="bm-tab-bar">
        <button (click)="managerMode.set('SINGLE')" 
          class="bm-tab-btn"
          [style.border-bottom-color]="managerMode() === 'SINGLE' ? '#1e3a8a' : 'transparent'"
          [style.color]="managerMode() === 'SINGLE' ? '#1e3a8a' : '#64748b'">
          👤 Single Invoice Office
        </button>
        <button (click)="managerMode.set('BULK')" 
          class="bm-tab-btn"
          [style.border-bottom-color]="managerMode() === 'BULK' ? '#1e3a8a' : 'transparent'"
          [style.color]="managerMode() === 'BULK' ? '#1e3a8a' : '#64748b'">
          📋 Bulk Invoices Spreadsheet Importer
        </button>
      </div>

      <!-- Invoicing Stats Summary Bar -->
      <div class="mobile-grid-1 bm-stats-grid">
        <div class="bm-stat-card">
          <span class="bm-stat-label">Total Billing Issued</span>
          <strong class="bm-stat-value">\${{ totalBilled() }}</strong>
        </div>
        <div class="bm-stat-card-green">
          <span class="bm-stat-label-green">Total Fees Collected</span>
          <strong class="bm-stat-value-green">\${{ totalPaid() }}</strong>
        </div>
        <div class="bm-stat-card-orange">
          <span class="bm-stat-label-orange">Total Outstanding</span>
          <strong class="bm-stat-value-orange">\${{ totalPending() }}</strong>
        </div>
      </div>

      @if (managerMode() === 'SINGLE') {
        <!-- Action Forms Row -->
        <div class="mobile-grid-1 bm-forms-row">
          
          <!-- Create Fee Item Category -->
          <div class="bm-panel-start">
            <h3 class="ds-heading bm-panel-heading">1. Add Fee Category</h3>
            <form (ngSubmit)="addFeeItem()" #feeForm="ngForm" class="bm-form-col">
              <div>
                <label class="bm-field-label">Fee Name</label>
                <input type="text" name="name" [(ngModel)]="newFeeItem.name" required placeholder="e.g. Annual Tuition Fee" class="bm-input" />
              </div>
              <div class="bm-grid-2">
                <div>
                  <label class="bm-field-label">Amount ($)</label>
                  <input type="number" name="amount" [(ngModel)]="newFeeItem.amount" required placeholder="500" class="bm-input" />
                </div>
                <div>
                  <label class="bm-field-label">Grade Level</label>
                  <select name="gradeLevel" [(ngModel)]="newFeeItem.gradeLevel" class="bm-select">
                    <option value="All Grades">All Grades</option>
                    <option value="Primary School (G1-5)">Primary School (G1-5)</option>
                    <option value="Middle School (G6-8)">Middle School (G6-8)</option>
                    <option value="High School (G9-12)">High School (G9-12)</option>
                  </select>
                </div>
              </div>
              <button type="submit" [disabled]="!feeForm.form.valid" class="ds-btn ds-btn-primary bm-submit-btn">
                Create Fee Category
              </button>
            </form>
          </div>

          <!-- Generate Student Invoice -->
          <div class="bm-panel">
            <h3 class="ds-heading bm-panel-heading">2. Generate Student Invoice</h3>
            <form (ngSubmit)="generateInvoice()" #invoiceForm="ngForm" class="bm-form-col">
              
              <div class="mobile-grid-1 bm-grid-2-wide">
                <div>
                  <label class="bm-field-label">Student Name</label>
                  <input type="text" name="studentName" [(ngModel)]="newInvoice.studentName" required placeholder="e.g. John Doe" class="bm-input" />
                </div>
                <div>
                  <label class="bm-field-label">Admission Number</label>
                  <input type="text" name="admissionNo" [(ngModel)]="newInvoice.admissionNo" required placeholder="e.g. ADM-101" class="bm-input" />
                </div>
              </div>

              <div class="mobile-grid-1 bm-grid-2-wide">
                <div>
                  <label class="bm-field-label">Father's Name</label>
                  <input type="text" name="fatherName" [(ngModel)]="newInvoice.fatherName" required placeholder="e.g. Richard Doe" class="bm-input" />
                </div>
                <div>
                  <label class="bm-field-label">Aadhar Card Number</label>
                  <input type="text" name="aadharNo" [(ngModel)]="newInvoice.aadharNo" required placeholder="e.g. 1234-5678-9012" class="bm-input" />
                </div>
              </div>

              <div class="mobile-grid-1 bm-grid-3">
                <div>
                  <label class="bm-field-label">Class Level</label>
                  <select name="gradeLevel" [(ngModel)]="newInvoice.gradeLevel" required class="bm-select">
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
                  <label class="bm-field-label">Section</label>
                  <select name="section" [(ngModel)]="newInvoice.section" required class="bm-select">
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
                <div>
                  <label class="bm-field-label">Select Fee Category</label>
                  <select name="feeItem" (change)="onFeeSelected($event)" class="bm-select">
                    <option [value]="null" disabled selected>-- Select Fee --</option>
                    @for (item of feeItems(); track item.id) {
                      <option [value]="item.id">{{ item.name }} (\${{ item.amount }})</option>
                    }
                  </select>
                </div>
              </div>

              <button type="submit" [disabled]="!invoiceForm.form.valid || !selectedFeeId" class="ds-btn ds-btn-success bm-submit-btn">
                Generate Invoice
              </button>
            </form>
          </div>

        </div>
      }

      <!-- Mode 2: Bulk Excel / Spreadsheet Importer -->
      @if (managerMode() === 'BULK') {
        <div class="bm-bulk-panel">
          <h3 class="ds-heading bm-bulk-heading">Excel / Spreadsheet Copy-Paste Importer</h3>
          
          <!-- Bulk Mode Switcher -->
          <div class="bm-bulk-switcher">
            <button (click)="bulkUploadMode.set('CLASS'); parseSpreadsheet()" 
              [style.background]="bulkUploadMode() === 'CLASS' ? '#1e3a8a' : 'white'"
              [style.color]="bulkUploadMode() === 'CLASS' ? 'white' : '#475569'"
              class="bm-bulk-switch-btn">
              🏫 Class-wise Excel Upload
            </button>
            <button (click)="bulkUploadMode.set('SCHOOL'); parseSpreadsheet()" 
              [style.background]="bulkUploadMode() === 'SCHOOL' ? '#1e3a8a' : 'white'"
              [style.color]="bulkUploadMode() === 'SCHOOL' ? 'white' : '#475569'"
              class="bm-bulk-switch-btn">
              🌐 School-wide Master Excel Upload
            </button>
          </div>

          @if (bulkUploadMode() === 'CLASS') {
            <!-- Class Selection dropdowns for bulk -->
            <div class="mobile-grid-1 bm-bulk-class-grid">
              <div>
                <label class="bm-field-label-sm">Select Target Class</label>
                <select name="bulkClass" [(ngModel)]="bulkClass" (change)="parseSpreadsheet()" class="bm-select-bold">
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
                <label class="bm-field-label-sm">Select Target Section</label>
                <select name="bulkSection" [(ngModel)]="bulkSection" (change)="parseSpreadsheet()" class="bm-select-bold">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
            </div>

            <p class="bm-format-note">
              <strong>Class-wise Format columns (Tab-separated Excel copy):</strong><br />
              <code>Student Name [Tab] Admission No [Tab] Father Name [Tab] Aadhar No [Tab] Fee Item Description [Tab] Amount</code>
            </p>
          } @else {
            <p class="bm-format-note">
              <strong>School-wide Format columns (Tab-separated Excel copy):</strong><br />
              <code>Student Name [Tab] Admission No [Tab] Father Name [Tab] Aadhar No [Tab] Class [Tab] Section [Tab] Fee Item Description [Tab] Amount</code>
            </p>
          }

          <textarea [(ngModel)]="pasteAreaText" rows="6" (input)="parseSpreadsheet()"
            [placeholder]="bulkUploadMode() === 'CLASS' 
              ? 'John Doe\tADM-101\tRichard Doe\t1234-5678-9012\tTerm Tuition Fees\t250\nJane Smith\tADM-102\tRobert Smith\t9876-5432-1098\tTerm Bus Fees\t100'
              : 'John Doe\tADM-101\tRichard Doe\t1234-5678-9012\t1st\tA\tTerm Tuition Fees\t250\nJane Smith\tADM-102\tRobert Smith\t9876-5432-1098\t2nd\tB\tTerm Bus Fees\t100'"
            class="bm-textarea">
          </textarea>

          <!-- Parsed Invoice Preview Grid -->
          @if (parsedRows().length > 0) {
            <div class="bm-preview-block">
              <h4 class="bm-preview-heading">📋 Parsed Verification Grid ({{ parsedRows().length }} rows)</h4>
              
              <div class="table-responsive-wrapper bm-preview-table-wrap">
                <table class="bm-preview-table">
                  <thead>
                    <tr class="bm-preview-thead-row">
                      <th class="bm-preview-th">Student Name</th>
                      <th class="bm-preview-th">Admission No</th>
                      <th class="bm-preview-th">Father\'s Name</th>
                      <th class="bm-preview-th">Class (Section)</th>
                      <th class="bm-preview-th">Fee Description</th>
                      <th class="bm-preview-th">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of parsedRows(); track $index) {
                      <tr class="bm-preview-body-row">
                        <td class="bm-preview-td-bold">{{ row.studentName }}</td>
                        <td class="bm-preview-td">{{ row.admissionNo }}</td>
                        <td class="bm-preview-td">{{ row.fatherName }}</td>
                        <td class="bm-preview-td-muted">{{ row.gradeLevel }} (Section {{ row.section }})</td>
                        <td class="bm-preview-td">{{ row.feeItemName }}</td>
                        <td class="bm-preview-td-amount">\${{ row.amount }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="bm-preview-actions">
                <button (click)="clearParsed()" class="ds-btn ds-btn-ghost bm-action-btn">
                  Clear All
                </button>
                <button (click)="importParsedRows()" [disabled]="isImporting()" class="ds-btn ds-btn-success bm-action-btn">
                  @if (isImporting()) { <span class="ds-spinner"></span> Importing ledger... } @else { Confirm Bulk Import to Database }
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Invoices Pipeline List -->
      <h3 class="ds-heading bm-list-heading">All Student Invoices</h3>
      @if (invoices().length === 0) {
        <p class="bm-empty-note">No student invoices have been generated yet. Use the panel above to issue fee bills.</p>
      } @else {
        <div class="bm-list-table-wrap">
          <table class="bm-list-table">
            <thead>
              <tr class="bm-list-thead-row">
                <th class="bm-list-th">Invoice Ref</th>
                <th class="bm-list-th">Student Details</th>
                <th class="bm-list-th">Fee Description</th>
                <th class="bm-list-th">Amount</th>
                <th class="bm-list-th">Status</th>
                <th class="bm-list-th">Payment Date</th>
              </tr>
            </thead>
            <tbody>
              @for (inq of invoices(); track inq.id) {
                <tr class="bm-list-body-row">
                  <td class="bm-list-td-ref">INV-400{{ inq.id }}</td>
                  <td class="bm-list-td">
                    <strong class="bm-list-student-name">{{ inq.studentName }}</strong>
                    @if (inq.gradeLevel || inq.section || inq.admissionNo) {
                      <span class="bm-list-student-meta">
                        {{ inq.gradeLevel || '-' }} (Section {{ inq.section || '-' }}) • Adm No: {{ inq.admissionNo || '-' }}
                      </span>
                    }
                  </td>
                  <td class="bm-list-td-desc">{{ inq.feeItemName }}</td>
                  <td class="bm-list-td-amount">\${{ inq.amount }}</td>
                  <td class="bm-list-td">
                    @if (inq.status === 'PENDING') {
                      <span class="ds-chip bm-chip-pending">PENDING</span>
                    } @else if (inq.status === 'PAID') {
                      <span class="ds-chip bm-chip-paid">PAID</span>
                    }
                  </td>
                  <td class="bm-list-td-muted">
                    {{ inq.paymentDate ? (inq.paymentDate | date:'mediumDate') : 'Unpaid' }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (invoiceTotalPages() > 1) {
          <div class="sw-pager">
            <button class="sw-pager-btn" [disabled]="invoicePage() === 0" (click)="goToInvoicePage(invoicePage() - 1)">← Prev</button>
            <span class="sw-pager-info">Page {{ invoicePage() + 1 }} of {{ invoiceTotalPages() }} · {{ invoiceTotalElements() }} invoices</span>
            <button class="sw-pager-btn" [disabled]="invoicePage() + 1 >= invoiceTotalPages()" (click)="goToInvoicePage(invoicePage() + 1)">Next →</button>
          </div>
        }
      }
    </div>
  `,
  styleUrl: './billing-manager.component.scss'
})
export class BillingManagerComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() tenantName!: string;
  @Input() refreshTrigger: number = 0;
  @Output() billingModified = new EventEmitter<void>();

  protected readonly feeItems = signal<FeeItem[]>([]);
  protected readonly invoices = signal<StudentInvoice[]>([]);
  protected readonly invoicePage = signal<number>(0);
  protected readonly invoiceTotalPages = signal<number>(0);
  protected readonly invoiceTotalElements = signal<number>(0);
  protected readonly invoicePageSize = 25;

  // Stats signals
  protected readonly totalBilled = signal<number>(0);
  protected readonly totalPaid = signal<number>(0);
  protected readonly totalPending = signal<number>(0);

  selectedFeeId: number | null = null;
  protected readonly managerMode = signal<string>('SINGLE'); // SINGLE, BULK
  protected readonly parsedRows = signal<StudentInvoice[]>([]);
  protected readonly isImporting = signal(false);

  // New bulk upload state variables
  protected readonly bulkUploadMode = signal<string>('CLASS'); // CLASS, SCHOOL
  bulkClass: string = '1st';
  bulkSection: string = 'A';

  pasteAreaText: string = '';

  newFeeItem = {
    name: '',
    amount: 250,
    description: 'Standard term fee',
    gradeLevel: 'All Grades'
  };

  newInvoice: StudentInvoice = {
    studentName: '',
    gradeLevel: '1st',
    feeItemName: '',
    amount: 0,
    status: 'PENDING',
    dueDate: '',
    admissionNo: '',
    section: 'A',
    fatherName: '',
    aadharNo: ''
  };

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['tenantId'] && this.tenantId) || (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange)) {
      this.invoicePage.set(0);
      this.fetchFeeItems();
      this.fetchInvoices();
      this.fetchInvoiceStats();
    }
  }

  fetchFeeItems() {
    this.http.get<FeeItem[]>(`http://localhost:8080/api/sites/${this.tenantId}/fees`)
      .subscribe({
        next: (data) => this.feeItems.set(data),
        error: (err) => console.error(err)
      });
  }

  fetchInvoices() {
    const page = this.invoicePage();
    this.http.get<any>(`http://localhost:8080/api/sites/${this.tenantId}/invoices/paged?page=${page}&size=${this.invoicePageSize}`)
      .subscribe({
        next: (res) => {
          this.invoices.set(res?.content || []);
          this.invoiceTotalPages.set(res?.totalPages || 0);
          this.invoiceTotalElements.set(res?.totalElements || 0);
        },
        error: (err) => console.error(err)
      });
  }

  /** Totals are computed in the DB so they stay accurate across all pages. */
  fetchInvoiceStats() {
    this.http.get<any>(`http://localhost:8080/api/sites/${this.tenantId}/invoices/stats`)
      .subscribe({
        next: (s) => {
          this.totalBilled.set(s?.totalBilled || 0);
          this.totalPaid.set(s?.totalPaid || 0);
          this.totalPending.set(s?.totalPending || 0);
        },
        error: (err) => console.error(err)
      });
  }

  goToInvoicePage(page: number) {
    if (page < 0 || page >= this.invoiceTotalPages()) {
      return;
    }
    this.invoicePage.set(page);
    this.fetchInvoices();
  }

  addFeeItem() {
    this.http.post<FeeItem>(`http://localhost:8080/api/admin/sites/${this.tenantId}/fees`, this.newFeeItem)
      .subscribe({
        next: () => {
          this.fetchFeeItems();
          this.newFeeItem = {
            name: '',
            amount: 250,
            description: 'Standard term fee',
            gradeLevel: 'All Grades'
          };
        },
        error: (err) => console.error(err)
      });
  }

  onFeeSelected(event: any) {
    const feeId = Number(event.target.value);
    const fee = this.feeItems().find(f => f.id === feeId);
    if (fee) {
      this.selectedFeeId = feeId;
      this.newInvoice.feeItemName = fee.name;
      this.newInvoice.amount = fee.amount;
    }
  }

  generateInvoice() {
    this.http.post<StudentInvoice>(`http://localhost:8080/api/admin/sites/${this.tenantId}/invoices`, this.newInvoice)
      .subscribe({
        next: () => {
          this.invoicePage.set(0);
          this.fetchInvoices();
          this.fetchInvoiceStats();
          this.billingModified.emit();
          this.newInvoice.studentName = '';
          this.newInvoice.admissionNo = '';
          this.newInvoice.fatherName = '';
          this.newInvoice.aadharNo = '';
        },
        error: (err) => console.error(err)
      });
  }

  parseSpreadsheet() {
    if (!this.pasteAreaText.trim()) return;

    const lines = this.pasteAreaText.split('\n');
    const rows: StudentInvoice[] = [];

    lines.forEach(line => {
      if (!line.trim()) return;

      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      
      if (this.bulkUploadMode() === 'CLASS') {
        // Format: Student Name [0], Admission No [1], Father Name [2], Aadhar No [3], Fee Description [4], Amount [5]
        if (parts.length >= 5) {
          rows.push({
            studentName: parts[0]?.trim() || 'Unknown Student',
            admissionNo: parts[1]?.trim() || 'ADM-MOCK',
            fatherName: parts[2]?.trim() || 'Unknown Father',
            aadharNo: parts[3]?.trim() || 'MOCK-AADHAR',
            gradeLevel: this.bulkClass,
            section: this.bulkSection,
            feeItemName: parts[4]?.trim() || 'Tuition Fee',
            amount: parseFloat(parts[5]?.trim()) || 0,
            status: 'PENDING',
            dueDate: new Date().toISOString()
          });
        }
      } else {
        // Format: Student Name [0], Admission No [1], Father Name [2], Aadhar No [3], Class [4], Section [5], Fee Description [6], Amount [7]
        if (parts.length >= 7) {
          rows.push({
            studentName: parts[0]?.trim() || 'Unknown Student',
            admissionNo: parts[1]?.trim() || 'ADM-MOCK',
            fatherName: parts[2]?.trim() || 'Unknown Father',
            aadharNo: parts[3]?.trim() || 'MOCK-AADHAR',
            gradeLevel: parts[4]?.trim() || '1st',
            section: parts[5]?.trim() || 'A',
            feeItemName: parts[6]?.trim() || 'Tuition Fee',
            amount: parseFloat(parts[7]?.trim()) || 0,
            status: 'PENDING',
            dueDate: new Date().toISOString()
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
      this.http.post<StudentInvoice>(`http://localhost:8080/api/admin/sites/${this.tenantId}/invoices`, row)
        .subscribe({
          next: () => {
            completedCount++;
            if (completedCount === list.length) {
              this.isImporting.set(false);
              this.clearParsed();
              this.invoicePage.set(0);
              this.fetchInvoices();
              this.fetchInvoiceStats();
              this.billingModified.emit();
            }
          },
          error: (err) => {
            console.error('Failed to import invoice', row, err);
            completedCount++;
            if (completedCount === list.length) {
              this.isImporting.set(false);
              this.clearParsed();
              this.invoicePage.set(0);
              this.fetchInvoices();
              this.fetchInvoiceStats();
              this.billingModified.emit();
            }
          }
        });
    });
  }
}
