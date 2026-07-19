import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface StudentInvoice {
  id: number;
  studentName: string;
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
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 950px; margin: 2rem auto;">
      <h3 [style.color]="primaryColor" style="font-size: 1.5rem; font-weight: 800; margin-top: 0; margin-bottom: 0.5rem; text-align: center; transition: color 0.3s;">
        Parent & Student Fee Payment Portal
      </h3>
      <p style="color: #64748b; font-size: 0.9rem; text-align: center; margin-bottom: 1.5rem;">
        Search for your child's student record to view issued fee invoices and complete secure online payments.
      </p>

      <!-- Student Record Lookup Bar -->
      <form (ngSubmit)="searchStudentInvoices()" style="display: flex; gap: 0.5rem; margin-bottom: 2rem;">
        <input type="text" name="studentSearchName" [(ngModel)]="searchName" placeholder="Enter Student's Full Name (e.g. John Doe)" required
          style="flex: 1; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem; box-sizing: border-box;" />
        <button type="submit" [style.background-color]="primaryColor" style="border: 0; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer;">
          🔍 Find Invoices
        </button>
      </form>

      <!-- Search Results -->
      @if (hasSearched()) {
        <div>
          @if (invoices().length === 0) {
            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 2.5rem; text-align: center; border-radius: 8px; color: #64748b;">
              <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">🔍</span>
              <p style="font-size: 0.95rem; margin: 0; font-weight: 600;">No invoices found for student: "{{ searchName }}"</p>
              <p style="font-size: 0.85rem; margin-top: 0.25rem;">Verify spelling or generate a student invoice in the Admin panel above!</p>
            </div>
          } @else {
            <h4 style="color: #1e293b; font-size: 1rem; font-weight: 700; margin-bottom: 1rem;">
              Issued Bills found for student: <span style="color: #2563eb;">{{ searchName }}</span>
            </h4>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              @for (inv of invoices(); track inv.id) {
                <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 1.25rem; background: white; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                  <div>
                    <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem;">
                      <span style="font-size: 0.75rem; font-weight: 700; color: #1e3a8a; background: #e0f2fe; padding: 0.15rem 0.35rem; border-radius: 4px;">INV-400{{ inv.id }}</span>
                      <strong style="font-size: 1.05rem; color: #0f172a;">{{ inv.feeItemName }}</strong>
                    </div>
                    <span style="font-size: 0.8rem; color: #64748b; display: block;">Due Date: {{ inv.dueDate | date:'mediumDate' }}</span>
                    @if (inv.status === 'PAID') {
                      <span style="font-size: 0.8rem; color: #15803d; font-weight: 600; display: block; margin-top: 0.25rem;">Paid on: {{ inv.paymentDate | date:'medium' }}</span>
                    }
                  </div>
                  
                  <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                    <span style="font-size: 1.25rem; font-weight: 800; color: #0f172a;">\${{ inv.amount }}</span>
                    
                    @if (inv.status === 'PENDING') {
                      <button (click)="openCheckoutModal(inv)" [style.background-color]="accentColor" style="border: 0; color: #0f172a; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
                        💳 Pay Fees Now
                      </button>
                    } @else {
                      <span style="background: #dcfce7; color: #15803d; font-size: 0.8rem; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 700;">🟢 PAID</span>
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
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.65); display: flex; align-items: center; justify-content: center; z-index: 99999; backdrop-filter: blur(2px);">
          <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 450px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #cbd5e1; box-sizing: border-box;">
            
            @if (checkoutState() === 'FORM') {
              <div>
                <div style="text-align: center; margin-bottom: 1.5rem;">
                  <span style="font-size: 2rem;">🔒</span>
                  <h4 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-top: 0.5rem; margin-bottom: 0.25rem;">Secure Student Payment Gateway</h4>
                  <p style="color: #64748b; font-size: 0.85rem; margin: 0;">Checkout Sandbox with simulated processing</p>
                </div>

                <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                    <span style="color: #475569;">Student Name:</span>
                    <strong style="color: #0f172a;">{{ selectedInvoice()?.studentName }}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                    <span style="color: #475569;">Billing Item:</span>
                    <strong style="color: #0f172a;">{{ selectedInvoice()?.feeItemName }}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 1rem; border-top: 1px solid #cbd5e1; padding-top: 0.5rem; margin-top: 0.5rem;">
                    <span style="font-weight: 700; color: #0f172a;">Total Amount:</span>
                    <strong style="color: #1e3a8a; font-size: 1.15rem;">\${{ selectedInvoice()?.amount }}</strong>
                  </div>
                </div>

                <form (ngSubmit)="processCheckout()" style="display: flex; flex-direction: column; gap: 1rem;">
                  <div>
                    <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Cardholder Name</label>
                    <input type="text" required placeholder="Robert Doe" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px;" />
                  </div>
                  <div>
                    <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Debit / Credit Card Details</label>
                    <div style="display: flex; border: 1px solid #cbd5e1; border-radius: 4px; padding: 0.55rem; background: white; align-items: center; justify-content: space-between;">
                      <input type="text" required placeholder="4242 4242 4242 4242" style="border: 0; outline: none; width: 65%; font-family: monospace; font-size: 0.9rem;" />
                      <input type="text" required placeholder="MM/YY" style="border: 0; outline: none; width: 18%; font-family: monospace; font-size: 0.9rem; text-align: center;" />
                      <input type="password" required placeholder="CVC" style="border: 0; outline: none; width: 12%; font-family: monospace; font-size: 0.9rem; text-align: right;" />
                    </div>
                  </div>
                  <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
                    <button type="button" (click)="showCheckoutModal.set(false)" style="flex: 1; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: 600; background: white; cursor: pointer;">
                      Cancel
                    </button>
                    <button type="submit" [style.background-color]="primaryColor" style="flex: 1.5; padding: 0.65rem; border: 0; color: white; border-radius: 6px; font-weight: 700; cursor: pointer;">
                      Authorize Pay
                    </button>
                  </div>
                </form>
              </div>
            }

            @if (checkoutState() === 'PROCESSING') {
              <div style="text-align: center; padding: 2rem 0;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #cbd5e1; border-top-color: #1e3a8a; border-radius: 50%; animate: spin 1s infinite;"></div>
                <h4 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-top: 1.5rem; margin-bottom: 0.25rem;">{{ checkoutStatusMessage() }}</h4>
                <p style="color: #64748b; font-size: 0.8rem; margin: 0;">Securing communication with bank trust...</p>
              </div>
            }

            @if (checkoutState() === 'SUCCESS') {
              <div style="text-align: center; padding: 1rem 0;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
                <h4 style="font-size: 1.4rem; font-weight: 800; color: #15803d; margin-top: 0.5rem; margin-bottom: 0.25rem;">Payment Successful!</h4>
                <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1.5rem;">Transaction authorized. Receipt generated.</p>

                <div style="background: #ecfdf5; border: 1px solid #bbf7d0; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.85rem; text-align: left;">
                  <div>Receipt: <strong style="color: #0f172a;">RCP-902{{ selectedInvoice()?.id }}</strong></div>
                  <div>Cleared: <strong style="color: #0f172a;">\${{ selectedInvoice()?.amount }}</strong></div>
                  <div>Account: <strong style="color: #0f172a;">Visa ending in 4242</strong></div>
                </div>

                <button (click)="closeSuccess()" [style.background-color]="primaryColor" style="width: 100%; padding: 0.75rem; border: 0; color: white; border-radius: 6px; font-weight: 700; cursor: pointer;">
                  Print Receipt & Close Portal
                </button>
              </div>
            }

          </div>
        </div>
      }

    </div>
  `
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

  constructor(private readonly http: HttpClient) {}

  searchStudentInvoices() {
    if (!this.searchName.trim()) return;
    this.http.get<StudentInvoice[]>(`http://localhost:8080/api/sites/${this.tenantId}/invoices?studentName=${this.searchName}`)
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
    this.http.put<any>(`http://localhost:8080/api/sites/invoices/${inv.id}/pay`, {})
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
