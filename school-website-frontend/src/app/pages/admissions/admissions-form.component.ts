import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admissions-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ds-card ds-reveal af-card">
      <h3 [style.color]="primaryColor" class="ds-heading af-heading">
        Submit Admissions Inquiry
      </h3>
      <p class="af-subtitle">
        Fill out this form to express your interest. Our admissions counselor will contact you shortly.
      </p>

      @if (successMessage()) {
        <div class="ds-alert ds-alert-success af-success-alert">
          <div class="af-success-icon">🎉</div>
          <strong class="af-success-title">Inquiry Submitted Successfully!</strong>
          <span class="af-success-text">{{ successMessage() }}</span>
        </div>
      } @else {
        @if (errorMessage()) {
          <div class="ds-alert ds-alert-error ds-shake af-error-alert">
            <strong>Error:</strong> {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #inquiryForm="ngForm" class="af-form">
          <div class="af-grid-row">
            <div>
              <label class="af-label">Student Full Name</label>
              <input type="text" name="studentName" [(ngModel)]="form.studentName" required placeholder="e.g. John Doe"
                class="af-input" />
            </div>
            <div>
              <label class="af-label">Grade Level</label>
              <select name="gradeLevel" [(ngModel)]="form.gradeLevel" required class="af-select">
                <option value="" disabled selected>-- Select Grade --</option>
                <option value="Kindergarten">Kindergarten</option>
                <option value="Primary School (G1-5)">Primary School (G1-5)</option>
                <option value="Middle School (G6-8)">Middle School (G6-8)</option>
                <option value="High School (G9-12)">High School (G9-12)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="af-label">Parent / Guardian Name</label>
            <input type="text" name="parentName" [(ngModel)]="form.parentName" required placeholder="e.g. Robert Doe"
              class="af-input" />
          </div>

          <div class="af-grid-row">
            <div>
              <label class="af-label">Email Address</label>
              <input type="email" name="parentEmail" [(ngModel)]="form.parentEmail" required email placeholder="e.g. parent@email.com"
                class="af-input" />
            </div>
            <div>
              <label class="af-label">Phone Number</label>
              <input type="text" name="parentPhone" [(ngModel)]="form.parentPhone" required placeholder="e.g. +1 (555) 123-4567"
                class="af-input" />
            </div>
          </div>

          <div>
            <label class="af-label">Additional Notes / Questions (Optional)</label>
            <textarea name="message" [(ngModel)]="form.message" rows="3" placeholder="Tell us about student interests, transfer needs..."
              class="af-textarea"></textarea>
          </div>

          <button type="submit" class="ds-btn af-submit-btn" [disabled]="!inquiryForm.form.valid || isLoading()"
            [style.background-color]="primaryColor"
            [style.opacity]="inquiryForm.form.valid && !isLoading() ? '1' : '0.6'">
            {{ isLoading() ? 'Submitting Inquiry...' : 'Submit Inquiry Form' }}
          </button>
        </form>
      }
    </div>
  `,
  styleUrl: './admissions-form.component.scss'
})
export class AdmissionsFormComponent {
  @Input() tenantId!: number;
  @Input() primaryColor: string = '#1e3a8a';
  @Input() accentColor: string = '#f59e0b';
  @Output() inquirySubmitted = new EventEmitter<void>();

  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  form = {
    studentName: '',
    gradeLevel: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    message: ''
  };

  constructor(private readonly http: HttpClient) {}

  onSubmit() {
    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.http.post<any>(`http://localhost:8080/api/sites/${this.tenantId}/admissions`, this.form)
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.successMessage.set(`Thank you! Your reference number is ADM-00${res.id}. A welcome pack has been emailed to ${res.parentEmail}.`);
          this.inquirySubmitted.emit();
          // Reset form fields
          this.form = {
            studentName: '',
            gradeLevel: '',
            parentName: '',
            parentEmail: '',
            parentPhone: '',
            message: ''
          };
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Could not submit inquiry. Check details or server connection.');
          console.error(err);
        }
      });
  }
}
