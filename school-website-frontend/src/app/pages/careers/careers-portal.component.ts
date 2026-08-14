import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface JobPosting {
  id: number;
  title: string;
  department: string;
  qualification: string;
  experience: string;
  description: string;
}

@Component({
  selector: 'app-careers-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ds-card ds-reveal cp-card-root">
      
      <div class="cp-header">
        <span [style.color]="accentColor" class="cp-eyebrow">Join Our Faculty</span>
        <h3 [style.color]="primaryColor" class="ds-heading cp-heading">Work with India's Leading School Network</h3>
        <p class="cp-subtitle">Explore open administrative, teaching, and coaching vacancies. Help us shape the academic leaders of tomorrow.</p>
      </div>

      <!-- Vacancies List Grid -->
      @if (jobs().length === 0) {
        <div class="ds-alert ds-alert-info cp-empty-alert">
          <span class="cp-empty-icon">💼</span>
          <p class="cp-empty-primary">No active vacancies published currently.</p>
          <p class="cp-empty-secondary">Check back soon or submit a general expression of interest at our campus office.</p>
        </div>
      } @else {
        <div class="cp-jobs-list">
          @for (job of jobs(); track job.id) {
            <div class="ds-card ds-card-hover cp-job-card">
              <div class="cp-job-info">
                <div class="cp-job-title-row">
                  <strong [style.color]="primaryColor" class="cp-job-title">{{ job.title }}</strong>
                  <span [style.background]="accentColor" class="cp-job-badge">
                    {{ job.department }}
                  </span>
                </div>
                
                <div class="cp-job-meta">
                  <span>🎓 Qualification: <strong class="cp-job-meta-strong">{{ job.qualification }}</strong></span>
                  <span>⏳ Experience: <strong class="cp-job-meta-strong">{{ job.experience }}</strong></span>
                </div>

                <p class="cp-job-desc">{{ job.description }}</p>
              </div>

              <button (click)="openApplyModal(job)" class="ds-btn cp-apply-btn" [style.background-color]="primaryColor">
                Apply Now ➡️
              </button>
            </div>
          }
        </div>
      }

      <!-- Interactive Apply Modal Overlay -->
      @if (showApplyModal()) {
        <div class="cp-modal-overlay">
          <div class="cp-modal-dialog">
            
            @if (successMessage()) {
              <div class="cp-success">
                <span class="cp-success-icon">🎉</span>
                <h4 class="ds-heading cp-success-heading">Application Submitted!</h4>
                <p class="cp-success-text">{{ successMessage() }}</p>
                <button (click)="closeApplyModal()" class="ds-btn cp-success-btn" [style.background-color]="primaryColor">
                  Close Portal
                </button>
              </div>
            } @else {
              <div>
                <div class="cp-form-header">
                  <span class="cp-form-header-icon">💼</span>
                  <h4 class="cp-form-header-heading">Submit Job Application</h4>
                  <p class="cp-form-header-text">Applying for: <strong class="cp-form-header-job">{{ selectedJob()?.title }}</strong></p>
                </div>

                @if (errorMessage()) {
                  <div class="ds-alert ds-alert-error ds-shake cp-form-error">
                    <strong>Error:</strong> {{ errorMessage() }}
                  </div>
                }

                <form (ngSubmit)="submitApplication()" #applyForm="ngForm" class="cp-form">
                  <div>
                    <label class="cp-label">Your Full Name</label>
                    <input type="text" name="candidateName" [(ngModel)]="form.candidateName" required placeholder="e.g. Jean Grey" class="cp-input" />
                  </div>
                  <div class="cp-form-grid">
                    <div>
                      <label class="cp-label">Email Address</label>
                      <input type="email" name="candidateEmail" [(ngModel)]="form.candidateEmail" required email placeholder="e.g. jean@mail.com" class="cp-input" />
                    </div>
                    <div>
                      <label class="cp-label">Phone Number</label>
                      <input type="text" name="candidatePhone" [(ngModel)]="form.candidatePhone" required placeholder="e.g. +1 (555) 012-3456" class="cp-input" />
                    </div>
                  </div>
                  
                  <div class="cp-form-actions">
                    <button type="button" (click)="closeApplyModal()" class="ds-btn ds-btn-ghost cp-btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" class="ds-btn cp-btn-submit" [disabled]="!applyForm.form.valid || isLoading()" [style.background-color]="primaryColor">
                      {{ isLoading() ? 'Submitting...' : 'Submit Resume' }}
                    </button>
                  </div>
                </form>
              </div>
            }

          </div>
        </div>
      }

    </div>
  `,
  styleUrl: './careers-portal.component.scss'
})
export class CareersPortalComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() primaryColor: string = '#1e3a8a';
  @Input() accentColor: string = '#f59e0b';
  @Output() applicationSubmitted = new EventEmitter<void>();

  protected readonly jobs = signal<JobPosting[]>([]);
  protected readonly showApplyModal = signal(false);
  protected readonly selectedJob = signal<JobPosting | null>(null);
  
  protected readonly isLoading = signal(false);
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');

  form = {
    candidateName: '',
    candidateEmail: '',
    candidatePhone: ''
  };

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantId'] && this.tenantId) {
      this.fetchJobs();
    }
  }

  fetchJobs() {
    this.http.get<JobPosting[]>(`http://localhost:8080/api/sites/${this.tenantId}/jobs`)
      .subscribe({
        next: (data) => this.jobs.set(data),
        error: (err) => console.error(err)
      });
  }

  openApplyModal(job: JobPosting) {
    this.selectedJob.set(job);
    this.successMessage.set('');
    this.errorMessage.set('');
    this.showApplyModal.set(true);
  }

  closeApplyModal() {
    this.showApplyModal.set(false);
    this.selectedJob.set(null);
  }

  submitApplication() {
    const job = this.selectedJob();
    if (!job) return;

    this.isLoading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    this.http.post<any>(`http://localhost:8080/api/sites/${this.tenantId}/jobs/${job.id}/apply`, this.form)
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.successMessage.set(`Successfully submitted! Your candidate reference is APP-700${res.id}. We will contact you at ${res.candidateEmail}.`);
          this.applicationSubmitted.emit();
          // Reset form fields
          this.form = {
            candidateName: '',
            candidateEmail: '',
            candidatePhone: ''
          };
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to submit application. Check your connection.');
          console.error(err);
        }
      });
  }
}
