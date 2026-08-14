import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface JobApplication {
  id: number;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  status: string; // PENDING, REVIEWED, SHORTLISTED, REJECTED
  createdAt: string;
}

@Component({
  selector: 'app-careers-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ds-card ds-reveal cm-card">
      <h2 class="ds-heading cm-title">Applicant Tracking System <span class="ds-heading-grad">(ATS)</span></h2>
      <p class="cm-subtitle">Review resumes and shortlist candidate applicants for: <strong class="cm-subtitle-strong">{{ tenantName }}</strong></p>

      @if (applications().length === 0) {
        <div class="cm-empty-state">
          <span class="cm-empty-icon">📬</span>
          <p class="cm-empty-primary">No job applications received yet.</p>
          <p class="cm-empty-secondary">Use the simulated portal below to submit a public job application. It will show up here instantly!</p>
        </div>
      } @else {
        <div class="cm-table-wrap">
          <table class="cm-table">
            <thead>
              <tr class="cm-table-head-row">
                <th class="cm-th">Candidate ID</th>
                <th class="cm-th">Candidate Details</th>
                <th class="cm-th">Vacancy Applied For</th>
                <th class="cm-th">Status</th>
                <th class="cm-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (app of applications(); track app.id) {
                <tr class="cm-row">
                  <td class="cm-cell-id">APP-700{{ app.id }}</td>
                  <td class="cm-cell">
                    <strong class="cm-candidate-name">{{ app.candidateName }}</strong>
                    <span class="cm-candidate-contact">✉️ {{ app.candidateEmail }}</span>
                    <span class="cm-candidate-contact">📞 {{ app.candidatePhone }}</span>
                  </td>
                  <td class="cm-cell-vacancy">{{ app.jobTitle }}</td>
                  <td class="cm-cell">
                    @if (app.status === 'PENDING') {
                      <span class="ds-chip cm-chip-pending">PENDING</span>
                    } @else if (app.status === 'REVIEWED') {
                      <span class="ds-chip cm-chip-reviewed">REVIEWED</span>
                    } @else if (app.status === 'SHORTLISTED') {
                      <span class="ds-chip cm-chip-shortlisted">SHORTLISTED</span>
                    } @else if (app.status === 'REJECTED') {
                      <span class="ds-chip cm-chip-rejected">REJECTED</span>
                    }
                  </td>
                  <td class="cm-cell-actions">
                    <div class="cm-actions">
                      @if (app.status === 'PENDING') {
                        <button (click)="updateStatus(app.id, 'REVIEWED')" class="ds-btn ds-btn-ghost cm-btn-action">Mark Reviewed</button>
                      }
                      @if (app.status !== 'SHORTLISTED' && app.status !== 'REJECTED') {
                        <button (click)="updateStatus(app.id, 'SHORTLISTED')" class="ds-btn ds-btn-success cm-btn-action">Shortlist</button>
                        <button (click)="updateStatus(app.id, 'REJECTED')" class="ds-btn ds-btn-danger cm-btn-action">Reject</button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styleUrl: './careers-manager.component.scss'
})
export class CareersManagerComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() tenantName!: string;
  @Input() refreshTrigger: number = 0;

  protected readonly applications = signal<JobApplication[]>([]);

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['tenantId'] && this.tenantId) || (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange)) {
      this.fetchApplications();
    }
  }

  fetchApplications() {
    this.http.get<JobApplication[]>(`http://localhost:8080/api/admin/sites/${this.tenantId}/applications`)
      .subscribe({
        next: (data) => this.applications.set(data),
        error: (err) => console.error(err)
      });
  }

  updateStatus(id: number, status: string) {
    this.http.put<any>(`http://localhost:8080/api/admin/applications/${id}/status?status=${status}`, {})
      .subscribe({
        next: () => this.fetchApplications(),
        error: (err) => console.error(err)
      });
  }
}
