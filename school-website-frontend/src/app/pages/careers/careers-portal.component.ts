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
    <div class="ds-card ds-reveal" style="padding: 2.5rem; max-width: 1200px; margin: 2rem auto;">
      
      <div style="text-align: center; margin-bottom: 2.5rem;">
        <span [style.color]="accentColor" style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.5rem;">Join Our Faculty</span>
        <h3 [style.color]="primaryColor" class="ds-heading" style="font-size: 2rem; font-weight: 800; margin: 0; letter-spacing: -0.025em; line-height: 1.2;">Work with India's Leading School Network</h3>
        <p style="color: #64748b; font-size: 0.95rem; margin-top: 0.5rem; margin-bottom: 0;">Explore open administrative, teaching, and coaching vacancies. Help us shape the academic leaders of tomorrow.</p>
      </div>

      <!-- Vacancies List Grid -->
      @if (jobs().length === 0) {
        <div class="ds-alert ds-alert-info" style="flex-direction: column; padding: 3rem; text-align: center;">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">💼</span>
          <p style="font-size: 1rem; margin: 0; font-weight: 600;">No active vacancies published currently.</p>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Check back soon or submit a general expression of interest at our campus office.</p>
        </div>
      } @else {
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          @for (job of jobs(); track job.id) {
            <div class="ds-card ds-card-hover" style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: start;">
              <div style="flex: 1; padding-right: 1.5rem;">
                <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap;">
                  <strong [style.color]="primaryColor" style="font-size: 1.2rem;">{{ job.title }}</strong>
                  <span [style.background]="accentColor" style="color: #0f172a; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; text-transform: uppercase;">
                    {{ job.department }}
                  </span>
                </div>
                
                <div style="display: flex; gap: 1.25rem; font-size: 0.85rem; color: #64748b; margin-bottom: 0.75rem; font-weight: 600;">
                  <span>🎓 Qualification: <strong style="color: #475569;">{{ job.qualification }}</strong></span>
                  <span>⏳ Experience: <strong style="color: #475569;">{{ job.experience }}</strong></span>
                </div>

                <p style="color: #475569; font-size: 0.9rem; line-height: 1.5; margin: 0;">{{ job.description }}</p>
              </div>

              <button (click)="openApplyModal(job)" class="ds-btn" [style.background-color]="primaryColor" style="border: 0; color: white; padding: 0.65rem 1.25rem; border-radius: 6px; font-weight: 700; cursor: pointer; white-space: nowrap; margin-top: 0.25rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                Apply Now ➡️
              </button>
            </div>
          }
        </div>
      }

      <!-- Interactive Apply Modal Overlay -->
      @if (showApplyModal()) {
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.65); display: flex; align-items: center; justify-content: center; z-index: 999999; backdrop-filter: blur(2px);">
          <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 480px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid #cbd5e1; box-sizing: border-box;">
            
            @if (successMessage()) {
              <div style="text-align: center; padding: 1.5rem 0;">
                <span style="font-size: 3rem;">🎉</span>
                <h4 class="ds-heading" style="font-size: 1.4rem; font-weight: 800; color: #15803d; margin-top: 0.5rem; margin-bottom: 0.25rem;">Application Submitted!</h4>
                <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1.5rem;">{{ successMessage() }}</p>
                <button (click)="closeApplyModal()" class="ds-btn" [style.background-color]="primaryColor" style="width: 100%; padding: 0.75rem; border: 0; color: white; border-radius: 6px; font-weight: 700; cursor: pointer;">
                  Close Portal
                </button>
              </div>
            } @else {
              <div>
                <div style="text-align: center; margin-bottom: 1.5rem;">
                  <span style="font-size: 2rem;">💼</span>
                  <h4 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-top: 0.5rem; margin-bottom: 0.25rem;">Submit Job Application</h4>
                  <p style="color: #64748b; font-size: 0.85rem; margin: 0;">Applying for: <strong style="color: #1e3a8a;">{{ selectedJob()?.title }}</strong></p>
                </div>

                @if (errorMessage()) {
                  <div class="ds-alert ds-alert-error ds-shake" style="margin-bottom: 1.5rem;">
                    <strong>Error:</strong> {{ errorMessage() }}
                  </div>
                }

                <form (ngSubmit)="submitApplication()" #applyForm="ngForm" style="display: flex; flex-direction: column; gap: 1rem;">
                  <div>
                    <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Your Full Name</label>
                    <input type="text" name="candidateName" [(ngModel)]="form.candidateName" required placeholder="e.g. Jean Grey" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
                  </div>
                  <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem;">
                    <div>
                      <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Email Address</label>
                      <input type="email" name="candidateEmail" [(ngModel)]="form.candidateEmail" required email placeholder="e.g. jean@mail.com" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Phone Number</label>
                      <input type="text" name="candidatePhone" [(ngModel)]="form.candidatePhone" required placeholder="e.g. +1 (555) 012-3456" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
                    </div>
                  </div>
                  
                  <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
                    <button type="button" (click)="closeApplyModal()" class="ds-btn ds-btn-ghost" style="flex: 1; padding: 0.65rem;">
                      Cancel
                    </button>
                    <button type="submit" class="ds-btn" [disabled]="!applyForm.form.valid || isLoading()" [style.background-color]="primaryColor" style="flex: 1.5; padding: 0.65rem; border: 0; color: white; border-radius: 6px; font-weight: 700; cursor: pointer;">
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
  `
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
