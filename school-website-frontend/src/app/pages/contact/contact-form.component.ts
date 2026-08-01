import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 750px; margin: 2rem auto;">
      <h3 [style.color]="primaryColor" style="font-size: 1.5rem; font-weight: 800; margin-top: 0; margin-bottom: 0.5rem; text-align: center; transition: color 0.3s;">
        Send Message to School Office
      </h3>
      <p style="color: #64748b; font-size: 0.9rem; text-align: center; margin-bottom: 1.5rem;">
        Have questions about courses, term dates, or transport services? Drop us a line.
      </p>

      @if (successMessage()) {
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 1.25rem; border-radius: 4px; margin-bottom: 1.5rem; color: #065f46; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">✉️</div>
          <strong style="display: block; font-size: 1.1rem; margin-bottom: 0.25rem;">Message Sent!</strong>
          <span style="font-size: 0.9rem;">{{ successMessage() }}</span>
        </div>
      } @else {
        @if (errorMessage()) {
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem; color: #b91c1c; font-size: 0.9rem;">
            <strong>Error:</strong> {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #contactForm="ngForm" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Your Full Name</label>
              <input type="text" name="senderName" [(ngModel)]="form.senderName" required placeholder="e.g. Mary Jane"
                style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Your Email Address</label>
              <input type="email" name="senderEmail" [(ngModel)]="form.senderEmail" required email placeholder="e.g. mary@mail.com"
                style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Subject</label>
            <input type="text" name="subject" [(ngModel)]="form.subject" required placeholder="e.g. Transfer certificate inquiry"
              style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Message Detail</label>
            <textarea name="message" [(ngModel)]="form.message" rows="4" required placeholder="Type your query in detail..."
              style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem; resize: vertical;"></textarea>
          </div>

          <button type="submit" [disabled]="!contactForm.form.valid || isLoading()"
            [style.background-color]="primaryColor"
            style="border: 0; color: white; padding: 0.85rem 1.5rem; border-radius: 6px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background 0.2s; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);"
            [style.opacity]="contactForm.form.valid && !isLoading() ? '1' : '0.6'">
            {{ isLoading() ? 'Sending message...' : 'Send Inquiry Message' }}
          </button>
        </form>
      }
    </div>
  `
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
