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
  gradeLevel: string;
  feeItemName: string;
  amount: number;
  status: string; // PENDING, PAID
  dueDate: string;
  paymentDate?: string;
}

@Component({
  selector: 'app-billing-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #1e293b; margin-top: 0; margin-bottom: 0.5rem; font-weight: 700;">Financial Fee & Invoicing Office</h2>
      <p style="color: #64748b; font-size: 0.9rem; margin-top: 0; margin-bottom: 1.5rem;">Configure fee models and assign invoices to students of: <strong style="color: #0f172a;">{{ tenantName }}</strong></p>

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

      <!-- Action Forms Row -->
      <div style="display: grid; grid-template-columns: 1.2fr 1.5fr; gap: 2rem; margin-bottom: 2rem;">
        
        <!-- Create Fee Item Category -->
        <div style="background: #f8fafc; padding: 1.25rem; border-radius: 6px; border: 1px solid #e2e8f0;">
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
            <div>
              <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Student Name</label>
              <input type="text" name="studentName" [(ngModel)]="newInvoice.studentName" required placeholder="e.g. John Doe" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Grade Level</label>
                <select name="gradeLevel" [(ngModel)]="newInvoice.gradeLevel" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="Primary School (G1-5)">Primary School (G1-5)</option>
                  <option value="Middle School (G6-8)">Middle School (G6-8)</option>
                  <option value="High School (G9-12)">High School (G9-12)</option>
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
                    <span style="font-size: 0.75rem; color: #64748b;">{{ inq.gradeLevel }}</span>
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

  newFeeItem = {
    name: '',
    amount: 250,
    description: 'Standard term fee',
    gradeLevel: 'All Grades'
  };

  newInvoice = {
    studentName: '',
    gradeLevel: 'High School (G9-12)',
    feeItemName: '',
    amount: 0
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
        },
        error: (err) => console.error(err)
      });
  }
}
