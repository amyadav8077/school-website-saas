import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admissions-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 750px; margin: 2rem auto;">
      <h3 [style.color]="primaryColor" style="font-size: 1.5rem; font-weight: 800; margin-top: 0; margin-bottom: 0.5rem; text-align: center; transition: color 0.3s;">
        Submit Admissions Inquiry
      </h3>
      <p style="color: #64748b; font-size: 0.9rem; text-align: center; margin-bottom: 1.5rem;">
        Fill out this form to express your interest. Our admissions counselor will contact you shortly.
      </p>

      @if (successMessage()) {
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 1.25rem; border-radius: 4px; margin-bottom: 1.5rem; color: #065f46; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div>
          <strong style="display: block; font-size: 1.1rem; margin-bottom: 0.25rem;">Inquiry Submitted Successfully!</strong>
          <span style="font-size: 0.9rem;">{{ successMessage() }}</span>
        </div>
      } @else {
        @if (errorMessage()) {
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem; color: #b91c1c; font-size: 0.9rem;">
            <strong>Error:</strong> {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" #inquiryForm="ngForm" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Student Full Name</label>
              <input type="text" name="studentName" [(ngModel)]="form.studentName" required placeholder="e.g. John Doe"
                style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Grade Level</label>
              <select name="gradeLevel" [(ngModel)]="form.gradeLevel" required style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; background: white;">
                <option value="" disabled selected>-- Select Grade --</option>
                <option value="Kindergarten">Kindergarten</option>
                <option value="Primary School (G1-5)">Primary School (G1-5)</option>
                <option value="Middle School (G6-8)">Middle School (G6-8)</option>
                <option value="High School (G9-12)">High School (G9-12)</option>
              </select>
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Parent / Guardian Name</label>
            <input type="text" name="parentName" [(ngModel)]="form.parentName" required placeholder="e.g. Robert Doe"
              style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem;" />
          </div>

          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Email Address</label>
              <input type="email" name="parentEmail" [(ngModel)]="form.parentEmail" required email placeholder="e.g. parent@email.com"
                style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Phone Number</label>
              <input type="text" name="parentPhone" [(ngModel)]="form.parentPhone" required placeholder="e.g. +1 (555) 123-4567"
                style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Additional Notes / Questions (Optional)</label>
            <textarea name="message" [(ngModel)]="form.message" rows="3" placeholder="Tell us about student interests, transfer needs..."
              style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; font-size: 0.95rem; resize: vertical;"></textarea>
          </div>

          <button type="submit" [disabled]="!inquiryForm.form.valid || isLoading()"
            [style.background-color]="primaryColor"
            style="border: 0; color: white; padding: 0.85rem 1.5rem; border-radius: 6px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background 0.2s; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);"
            [style.opacity]="inquiryForm.form.valid && !isLoading() ? '1' : '0.6'">
            {{ isLoading() ? 'Submitting Inquiry...' : 'Submit Inquiry Form' }}
          </button>
        </form>
      }
    </div>
  `
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
