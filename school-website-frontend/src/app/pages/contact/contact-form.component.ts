import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ds-card ds-reveal cf-card">
      <h3 [style.color]="primaryColor" class="ds-heading cf-heading">
        Send Message to School Office
      </h3>
      <p class="cf-subtitle">
        Have questions about courses, term dates, or transport services? Drop us a line.
      </p>

      @if (successMessage()) {
        <div class="ds-alert ds-alert-success cf-alert-success">
          <div class="cf-success-icon">✉️</div>
          <strong class="cf-success-title">Message Sent!</strong>
          <span class="cf-success-text">{{ successMessage() }}</span>
        </div>
      } @else {
        @if (errorMessage()) {
          <div class="ds-alert ds-alert-error ds-shake cf-alert-error">
            <strong>Error:</strong> {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #contactForm="ngForm" class="cf-form">
          <div class="cf-grid">
            <div>
              <label class="cf-label">Your Full Name</label>
              <input type="text" name="senderName" [(ngModel)]="form.senderName" required placeholder="e.g. Mary Jane"
                class="cf-input" />
            </div>
            <div>
              <label class="cf-label">Your Email Address</label>
              <input type="email" name="senderEmail" [(ngModel)]="form.senderEmail" required email placeholder="e.g. mary@mail.com"
                class="cf-input" />
            </div>
          </div>

          <div>
            <label class="cf-label">Subject</label>
            <input type="text" name="subject" [(ngModel)]="form.subject" required placeholder="e.g. Transfer certificate inquiry"
              class="cf-input" />
          </div>

          <div>
            <label class="cf-label">Message Detail</label>
            <textarea name="message" [(ngModel)]="form.message" rows="4" required placeholder="Type your query in detail..."
              class="cf-textarea"></textarea>
          </div>

          <button type="submit" class="ds-btn cf-submit" [disabled]="!contactForm.form.valid || isLoading()"
            [style.background-color]="primaryColor"
            [style.opacity]="contactForm.form.valid && !isLoading() ? '1' : '0.6'">
            {{ isLoading() ? 'Sending message...' : 'Send Inquiry Message' }}
          </button>
        </form>
      }
    </div>
  `,
  styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent {
  @Input() tenantId!: number;
  @Input() primaryColor: string = '#1e3a8a';
  @Output() messageSubmitted = new EventEmitter<void>();

  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  form = {
    senderName: '',
    senderEmail: '',
    subject: '',
    message: ''
  };

  constructor(private readonly http: HttpClient) {}

  onSubmit() {
    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.http.post<any>(`http://localhost:8080/api/sites/${this.tenantId}/support`, this.form)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Inquiry submitted to the desk. We will get back to your email shortly.');
          this.messageSubmitted.emit();
          this.form = {
            senderName: '',
            senderEmail: '',
            subject: '',
            message: ''
          };
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Could not send message. Verify connection.');
          console.error(err);
        }
      });
  }
}
