import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface StudentInvoice {
  id: number;
  studentName: string;
  admissionNo?: string;
  gradeLevel: string;
  feeItemName: string;
  amount: number;
  status: string; // PENDING, PAID
  dueDate: string;
  paymentDate?: string;
}

@Component({
  selector: 'app-payment-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ds-card ds-reveal pp-card">
      <h3 [style.color]="primaryColor" class="ds-heading pp-heading">
        Parent & Student Fee Payment Portal
      </h3>
      <p class="pp-subtitle">
        Search for your child's student record to view issued fee invoices and complete secure online payments.
      </p>

      <!-- Student Record Lookup Bar -->
      <form (ngSubmit)="searchStudentInvoices()" class="pp-search-form">
        <div class="pp-field-flex1">
          <label class="pp-label">Select Class</label>
          <select name="searchClass" [(ngModel)]="searchClass" required class="pp-select">
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
        <div class="pp-field-flex1-100">
          <label class="pp-label">Select Section</label>
          <select name="searchSection" [(ngModel)]="searchSection" required class="pp-select">
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
        </div>
        <div class="pp-field-flex2">
          <label class="pp-label">Student Name (Optional)</label>
          <input type="text" name="studentSearchName" [(ngModel)]="searchName" placeholder="Enter name or leave empty to list all" 
            class="pp-input-text" />
        </div>
        <div class="pp-search-btn-wrap">
          <button type="submit" class="ds-btn pp-search-btn" [style.background-color]="primaryColor">
            🔍 Find Issued Bills (Class-wise)
          </button>
        </div>
      </form>

      <!-- Search Results -->
      @if (hasSearched()) {
        <div>
          @if (invoices().length === 0) {
            <div class="pp-empty">
              <span class="pp-empty-icon">🔍</span>
              <p class="pp-empty-title">No invoices found for student: "{{ searchName }}"</p>
              <p class="pp-empty-hint">Verify spelling or generate a student invoice in the Admin panel above!</p>
            </div>
          } @else {
            <h4 class="pp-results-heading">
              Issued Bills found matching search criteria:
            </h4>
            
            <div class="pp-results-list">
              @for (inv of invoices(); track inv.id) {
                <div class="ds-card ds-card-hover pp-invoice-card">
                  <div>
                    <div class="pp-invoice-title-row">
                      <span class="ds-chip">INV-400{{ inv.id }}</span>
                      <strong class="pp-invoice-fee-name">{{ inv.feeItemName }}</strong>
                    </div>
                    <span class="pp-invoice-due">Due Date: {{ inv.dueDate | date:'mediumDate' }}</span>
                    @if (inv.status === 'PAID') {
                      <span class="pp-invoice-paid">Paid on: {{ inv.paymentDate | date:'medium' }}</span>
                    }
                  </div>
                  
                  <div class="pp-invoice-right">
                    <span class="pp-invoice-amount">\${{ inv.amount }}</span>
                    
                    @if (inv.status === 'PENDING') {
                      <button (click)="openCheckoutModal(inv)" class="ds-btn pp-pay-btn" [style.background-color]="accentColor">
                        💳 Pay Fees Now
                      </button>
                    } @else {
                      <span class="ds-chip pp-chip-paid">🟢 PAID</span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Simulated Stripe Checkout Modal -->
      @if (showCheckoutModal()) {
        <div class="pp-modal-overlay">
          <div class="pp-modal">
            
            @if (checkoutState() === 'FORM') {
              <div>
                <div class="pp-modal-head">
                  <span class="pp-modal-icon">🔒</span>
                  <h4 class="ds-heading pp-modal-title">Secure Student Payment Gateway</h4>
                  <p class="pp-modal-subtitle">Checkout Sandbox with simulated processing</p>
                </div>

                <div class="pp-summary">
                  <div class="pp-summary-row">
                    <span class="pp-summary-label">Student Name:</span>
                    <strong class="pp-summary-value">{{ selectedInvoice()?.studentName }}</strong>
                  </div>
                  <div class="pp-summary-row">
                    <span class="pp-summary-label">Billing Item:</span>
                    <strong class="pp-summary-value">{{ selectedInvoice()?.feeItemName }}</strong>
                  </div>
                  <div class="pp-summary-total">
                    <span class="pp-summary-total-label">Total Amount:</span>
                    <strong class="pp-summary-total-value">\${{ selectedInvoice()?.amount }}</strong>
                  </div>
                </div>

                <form (ngSubmit)="processCheckout()" class="pp-checkout-form">
                  <div>
                    <label class="pp-form-label">Cardholder Name</label>
                    <input type="text" required placeholder="Robert Doe" class="pp-input-card-name" />
                  </div>
                  <div>
                    <label class="pp-form-label">Debit / Credit Card Details</label>
                    <div class="pp-card-details">
                      <input type="text" required placeholder="4242 4242 4242 4242" class="pp-input-card-number" />
                      <input type="text" required placeholder="MM/YY" class="pp-input-card-exp" />
                      <input type="password" required placeholder="CVC" class="pp-input-card-cvc" />
                    </div>
                  </div>
                  <div class="pp-checkout-actions">
                    <button type="button" (click)="showCheckoutModal.set(false)" class="ds-btn ds-btn-ghost pp-cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" class="ds-btn pp-authorize-btn" [style.background-color]="primaryColor">
                      Authorize Pay
                    </button>
                  </div>
                </form>
              </div>
            }

            @if (checkoutState() === 'PROCESSING') {
              <div class="pp-processing">
                <div class="pp-spinner"></div>
                <h4 class="pp-processing-title">{{ checkoutStatusMessage() }}</h4>
                <p class="pp-processing-sub">Securing communication with bank trust...</p>
              </div>
            }

            @if (checkoutState() === 'SUCCESS') {
              <div class="pp-success">
                <div class="pp-success-emoji">🎉</div>
                <h4 class="ds-heading pp-success-title">Payment Successful!</h4>
                <p class="pp-success-sub">Transaction authorized. Receipt generated.</p>

                <div class="ds-alert ds-alert-success pp-receipt">
                  <div>Receipt: <strong class="pp-receipt-value">RCP-902{{ selectedInvoice()?.id }}</strong></div>
                  <div>Cleared: <strong class="pp-receipt-value">\${{ selectedInvoice()?.amount }}</strong></div>
                  <div>Account: <strong class="pp-receipt-value">Visa ending in 4242</strong></div>
                </div>

                <button (click)="closeSuccess()" class="ds-btn pp-success-btn" [style.background-color]="primaryColor">
                  Print Receipt & Close Portal
                </button>
              </div>
            }

          </div>
        </div>
      }

    </div>
  `,
  styleUrl: './payment-portal.component.scss'
})
export class PaymentPortalComponent {
  @Input() tenantId!: number;
  @Input() primaryColor: string = '#1e3a8a';
  @Input() accentColor: string = '#f59e0b';
  @Output() paymentCompleted = new EventEmitter<void>();

  protected readonly invoices = signal<StudentInvoice[]>([]);
  protected readonly hasSearched = signal(false);
  protected readonly showCheckoutModal = signal(false);
  protected readonly selectedInvoice = signal<StudentInvoice | null>(null);
  
  protected readonly checkoutState = signal<string>('FORM'); // FORM, PROCESSING, SUCCESS
  protected readonly checkoutStatusMessage = signal<string>('Initializing sandbox stripe integration...');

  searchName: string = '';
  searchClass: string = '1st';
  searchSection: string = 'A';

  constructor(private readonly http: HttpClient) {}

  searchStudentInvoices() {
    this.hasSearched.set(false);
    let url = `http://localhost:8080/api/sites/${this.tenantId}/invoices`
      + `?gradeLevel=${encodeURIComponent(this.searchClass)}`
      + `&section=${encodeURIComponent(this.searchSection)}`;
    if (this.searchName.trim()) {
      url += `&studentName=${encodeURIComponent(this.searchName.trim())}`;
    }

    this.http.get<StudentInvoice[]>(url)
      .subscribe({
        next: (data) => {
          this.invoices.set(data);
          this.hasSearched.set(true);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  openCheckoutModal(invoice: StudentInvoice) {
    this.selectedInvoice.set(invoice);
    this.checkoutState.set('FORM');
    this.showCheckoutModal.set(true);
  }

  processCheckout() {
    if (!this.selectedInvoice()) return;
    this.checkoutState.set('PROCESSING');
    
    // Simulate payment processing delays
    setTimeout(() => {
      this.checkoutStatusMessage.set('Validating secure token authorization...');
      setTimeout(() => {
        this.checkoutStatusMessage.set('Settling credit escrow clearing...');
        setTimeout(() => {
          this.executePaymentOnServer();
        }, 1200);
      }, 1000);
    }, 1000);
  }

  executePaymentOnServer() {
    const inv = this.selectedInvoice();
    if (!inv) return;
    this.http.put<any>(`http://localhost:8080/api/sites/invoices/${inv.id}/pay?admissionNo=${encodeURIComponent(inv.admissionNo || '')}`, {})
      .subscribe({
        next: () => {
          this.checkoutState.set('SUCCESS');
          this.paymentCompleted.emit();
          this.searchStudentInvoices(); // Refresh local list
        },
        error: (err) => {
          console.error(err);
          this.showCheckoutModal.set(false);
        }
      });
  }

  closeSuccess() {
    this.showCheckoutModal.set(false);
  }
}
