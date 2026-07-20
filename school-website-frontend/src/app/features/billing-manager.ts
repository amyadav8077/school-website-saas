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
    <div style="background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #1e293b; margin-top: 0; margin-bottom: 0.5rem; font-weight: 700;">Financial Fee & Invoicing Office</h2>
      <p style="color: #64748b; font-size: 0.9rem; margin-top: 0; margin-bottom: 1.5rem;">Configure fee models and assign invoices to students of: <strong style="color: #0f172a;">{{ tenantName }}</strong></p>

      <!-- Tab Selectors: Single Invoice vs Bulk Importer -->
      <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
        <button (click)="managerMode.set('SINGLE')" 
          style="background: none; border: 0; padding: 0.4rem 0.8rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; font-size: 0.9rem;"
          [style.border-bottom-color]="managerMode() === 'SINGLE' ? '#1e3a8a' : 'transparent'"
          [style.color]="managerMode() === 'SINGLE' ? '#1e3a8a' : '#64748b'">
          👤 Single Invoice Office
        </button>
        <button (click)="managerMode.set('BULK')" 
          style="background: none; border: 0; padding: 0.4rem 0.8rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; font-size: 0.9rem;"
          [style.border-bottom-color]="managerMode() === 'BULK' ? '#1e3a8a' : 'transparent'"
          [style.color]="managerMode() === 'BULK' ? '#1e3a8a' : '#64748b'">
          📋 Bulk Invoices Spreadsheet Importer
        </button>
      </div>

      <!-- Invoicing Stats Summary Bar -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 6px; text-align: center;">
          <span style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Billing Issued</span>
          <strong style="display: block; font-size: 1.5rem; color: #0f172a; margin-top: 0.25rem;">\${{ totalBilled() }}</strong>
        </div>
        <div style="background: #ecfdf5; border: 1px solid #bbf7d0; padding: 1rem; border-radius: 6px; text-align: center;">
          <span style="font-size: 0.8rem; font-weight: 700; color: #15803d; text-transform: uppercase;">Total Fees Collected</span>
          <strong style="display: block; font-size: 1.5rem; color: #15803d; margin-top: 0.25rem;">\${{ totalPaid() }}</strong>
        </div>
        <div style="background: #fff7ed; border: 1px solid #ffedd5; padding: 1rem; border-radius: 6px; text-align: center;">
          <span style="font-size: 0.8rem; font-weight: 700; color: #b45309; text-transform: uppercase;">Total Outstanding</span>
          <strong style="display: block; font-size: 1.5rem; color: #b45309; margin-top: 0.25rem;">\${{ totalPending() }}</strong>
        </div>
      </div>

      @if (managerMode() === 'SINGLE') {
        <!-- Action Forms Row -->
        <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1.2fr 1.5fr; gap: 2rem; margin-bottom: 2rem;">
          
          <!-- Create Fee Item Category -->
          <div style="background: #f8fafc; padding: 1.25rem; border-radius: 6px; border: 1px solid #e2e8f0; align-self: start;">
            <h3 style="margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; color: #1e293b; font-weight: 700;">1. Add Fee Category</h3>
            <form (ngSubmit)="addFeeItem()" #feeForm="ngForm" style="display: flex; flex-direction: column; gap: 0.85rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Fee Name</label>
                <input type="text" name="name" [(ngModel)]="newFeeItem.name" required placeholder="e.g. Annual Tuition Fee" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <div>
                  <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Amount ($)</label>
                  <input type="number" name="amount" [(ngModel)]="newFeeItem.amount" required placeholder="500" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Grade Level</label>
                  <select name="gradeLevel" [(ngModel)]="newFeeItem.gradeLevel" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
                    <option value="All Grades">All Grades</option>
                    <option value="Primary School (G1-5)">Primary School (G1-5)</option>
                    <option value="Middle School (G6-8)">Middle School (G6-8)</option>
                    <option value="High School (G9-12)">High School (G9-12)</option>
                  </select>
                </div>
              </div>
              <button type="submit" [disabled]="!feeForm.form.valid" style="background: #1e3a8a; color: white; border: 0; padding: 0.6rem; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.85rem; margin-top: 0.25rem;">
                Create Fee Category
              </button>
            </form>
          </div>

          <!-- Generate Student Invoice -->
          <div style="background: #f8fafc; padding: 1.25rem; border-radius: 6px; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; color: #1e293b; font-weight: 700;">2. Generate Student Invoice</h3>
            <form (ngSubmit)="generateInvoice()" #invoiceForm="ngForm" style="display: flex; flex-direction: column; gap: 0.85rem;">
              
              <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 0.5rem;">
                <div>
                  <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Student Name</label>
                  <input type="text" name="studentName" [(ngModel)]="newInvoice.studentName" required placeholder="e.g. John Doe" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Admission Number</label>
                  <input type="text" name="admissionNo" [(ngModel)]="newInvoice.admissionNo" required placeholder="e.g. ADM-101" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
                </div>
              </div>

              <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 0.5rem;">
                <div>
                  <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Father's Name</label>
                  <input type="text" name="fatherName" [(ngModel)]="newInvoice.fatherName" required placeholder="e.g. Richard Doe" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
                </div>
                <div>
                  <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Aadhar Card Number</label>
                  <input type="text" name="aadharNo" [(ngModel)]="newInvoice.aadharNo" required placeholder="e.g. 1234-5678-9012" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
                </div>
              </div>

              <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 0.5rem;">
                <div>
                  <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Class Level</label>
                  <select name="gradeLevel" [(ngModel)]="newInvoice.gradeLevel" required style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
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
                  <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Section</label>
                  <select name="section" [(ngModel)]="newInvoice.section" required style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                  </select>
                </div>
                <div>
                  <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Select Fee Category</label>
                  <select name="feeItem" (change)="onFeeSelected($event)" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
                    <option [value]="null" disabled selected>-- Select Fee --</option>
                    @for (item of feeItems(); track item.id) {
                      <option [value]="item.id">{{ item.name }} (\${{ item.amount }})</option>
                    }
                  </select>
                </div>
              </div>

              <button type="submit" [disabled]="!invoiceForm.form.valid || !selectedFeeId" style="background: #10b981; color: white; border: 0; padding: 0.6rem; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.85rem; margin-top: 0.25rem;">
                Generate Invoice
              </button>
            </form>
          </div>

        </div>
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
              <code>Student Name [Tab] Admission No [Tab] Father Name [Tab] Aadhar No [Tab] Fee Item Description [Tab] Amount</code>
            </p>
          } @else {
            <p style="color: #64748b; font-size: 0.8rem; margin-top: 0; margin-bottom: 1rem;">
              <strong>School-wide Format columns (Tab-separated Excel copy):</strong><br />
              <code>Student Name [Tab] Admission No [Tab] Father Name [Tab] Aadhar No [Tab] Class [Tab] Section [Tab] Fee Item Description [Tab] Amount</code>
            </p>
          }

          <textarea [(ngModel)]="pasteAreaText" rows="6" (input)="parseSpreadsheet()"
            [placeholder]="bulkUploadMode() === 'CLASS' 
              ? 'John Doe\tADM-101\tRichard Doe\t1234-5678-9012\tTerm Tuition Fees\t250\nJane Smith\tADM-102\tRobert Smith\t9876-5432-1098\tTerm Bus Fees\t100'
              : 'John Doe\tADM-101\tRichard Doe\t1234-5678-9012\t1st\tA\tTerm Tuition Fees\t250\nJane Smith\tADM-102\tRobert Smith\t9876-5432-1098\t2nd\tB\tTerm Bus Fees\t100'"
            style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 0.85rem; box-sizing: border-box; resize: vertical; margin-bottom: 1rem;">
          </textarea>

          <!-- Parsed Invoice Preview Grid -->
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
                      <th style="padding: 0.5rem 0.75rem;">Fee Description</th>
                      <th style="padding: 0.5rem 0.75rem;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of parsedRows(); track $index) {
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 0.5rem 0.75rem; font-weight: 700;">{{ row.studentName }}</td>
                        <td style="padding: 0.5rem 0.75rem;">{{ row.admissionNo }}</td>
                        <td style="padding: 0.5rem 0.75rem;">{{ row.fatherName }}</td>
                        <td style="padding: 0.5rem 0.75rem; color: #64748b;">{{ row.gradeLevel }} (Section {{ row.section }})</td>
                        <td style="padding: 0.5rem 0.75rem;">{{ row.feeItemName }}</td>
                        <td style="padding: 0.5rem 0.75rem; font-weight: 700; color: #1e3a8a;">\${{ row.amount }}</td>
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

      <!-- Invoices Pipeline List -->
      <h3 style="margin-bottom: 0.75rem; color: #1e293b; font-weight: 700; font-size: 1.2rem;">All Student Invoices</h3>
      @if (invoices().length === 0) {
        <p style="color: #64748b; font-style: italic;">No student invoices have been generated yet. Use the panel above to issue fee bills.</p>
      } @else {
        <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: 600;">
                <th style="padding: 0.75rem 1rem;">Invoice Ref</th>
                <th style="padding: 0.75rem 1rem;">Student Details</th>
                <th style="padding: 0.75rem 1rem;">Fee Description</th>
                <th style="padding: 0.75rem 1rem;">Amount</th>
                <th style="padding: 0.75rem 1rem;">Status</th>
                <th style="padding: 0.75rem 1rem;">Payment Date</th>
              </tr>
            </thead>
            <tbody>
              @for (inq of invoices(); track inq.id) {
                <tr style="border-bottom: 1px solid #e2e8f0; hover: background-color: #f8fafc;">
                  <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">INV-400{{ inq.id }}</td>
                  <td style="padding: 0.75rem 1rem;">
                    <strong style="color: #0f172a; display: block;">{{ inq.studentName }}</strong>
                    @if (inq.gradeLevel || inq.section || inq.admissionNo) {
                      <span style="font-size: 0.75rem; color: #64748b; display: block; margin-top: 0.15rem;">
                        {{ inq.gradeLevel || '-' }} (Section {{ inq.section || '-' }}) • Adm No: {{ inq.admissionNo || '-' }}
                      </span>
                    }
                  </td>
                  <td style="padding: 0.75rem 1rem; color: #475569;">{{ inq.feeItemName }}</td>
                  <td style="padding: 0.75rem 1rem; font-weight: 700; color: #0f172a;">\${{ inq.amount }}</td>
                  <td style="padding: 0.75rem 1rem;">
                    @if (inq.status === 'PENDING') {
                      <span style="background: #ffedd5; color: #b45309; padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700;">PENDING</span>
                    } @else if (inq.status === 'PAID') {
                      <span style="background: #dcfce7; color: #15803d; padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700;">PAID</span>
                    }
                  </td>
                  <td style="padding: 0.75rem 1rem; color: #64748b;">
                    {{ inq.paymentDate ? (inq.paymentDate | date:'mediumDate') : 'Unpaid' }}
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
export class BillingManagerComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() tenantName!: string;
  @Input() refreshTrigger: number = 0;
  @Output() billingModified = new EventEmitter<void>();

  protected readonly feeItems = signal<FeeItem[]>([]);
  protected readonly invoices = signal<StudentInvoice[]>([]);

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
      this.fetchFeeItems();
      this.fetchInvoices();
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
    this.http.get<StudentInvoice[]>(`http://localhost:8080/api/sites/${this.tenantId}/invoices`)
      .subscribe({
        next: (data) => {
          this.invoices.set(data);
          this.calculateStats(data);
        },
        error: (err) => console.error(err)
      });
  }

  calculateStats(list: StudentInvoice[]) {
    let billed = 0;
    let paid = 0;
    let pending = 0;
    list.forEach(i => {
      billed += i.amount;
      if (i.status === 'PAID') paid += i.amount;
      else pending += i.amount;
    });
    this.totalBilled.set(billed);
    this.totalPaid.set(paid);
    this.totalPending.set(pending);
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
          this.fetchInvoices();
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
              this.fetchInvoices();
              this.billingModified.emit();
            }
          },
          error: (err) => {
            console.error('Failed to import invoice', row, err);
            completedCount++;
            if (completedCount === list.length) {
              this.isImporting.set(false);
              this.clearParsed();
              this.fetchInvoices();
              this.billingModified.emit();
            }
          }
        });
    });
  }
}
