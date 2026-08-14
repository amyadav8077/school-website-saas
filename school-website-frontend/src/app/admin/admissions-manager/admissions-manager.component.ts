import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface AdmissionInquiry {
  id: number;
  studentName: string;
  gradeLevel: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  status: string; // PENDING, REVIEWED, APPROVED, REJECTED
  message: string;
  createdAt: string;
}

@Component({
  selector: 'app-admissions-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ds-card ds-reveal am-card">
      <h2 class="ds-heading am-title">Admissions Inquiries <span class="ds-heading-grad">Pipeline</span></h2>
      <p class="am-subtitle">Review and process candidate registrations for: <strong class="am-tenant-name">{{ tenantName }}</strong></p>

      @if (inquiries().length === 0) {
        <div class="am-empty-state">
          <span class="am-empty-icon">📬</span>
          <p class="am-empty-primary">No admissions inquiries received yet.</p>
          <p class="am-empty-secondary">Use the simulated portal below to submit a public inquiry. It will show up here instantly!</p>
        </div>
      } @else {
        <div class="am-table-wrapper">
          <table class="am-table">
            <thead>
              <tr class="am-table-head-row">
                <th class="am-th">Ref ID</th>
                <th class="am-th">Student Details</th>
                <th class="am-th">Parent Details</th>
                <th class="am-th">Notes</th>
                <th class="am-th">Pipeline Status</th>
                <th class="am-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (inq of inquiries(); track inq.id) {
                <tr class="am-body-row">
                  <td class="am-td-ref">ADM-00{{ inq.id }}</td>
                  <td class="am-td">
                    <strong class="am-student-name">{{ inq.studentName }}</strong>
                    <span class="am-student-grade">Grade: {{ inq.gradeLevel }}</span>
                  </td>
                  <td class="am-td">
                    <span class="am-parent-name">{{ inq.parentName }}</span>
                    <span class="am-parent-contact">✉️ {{ inq.parentEmail }}</span>
                    <span class="am-parent-contact">📞 {{ inq.parentPhone }}</span>
                  </td>
                  <td class="am-td-notes" [title]="inq.message || ''">
                    {{ inq.message || 'No remarks.' }}
                  </td>
                  <td class="am-td">
                    @if (inq.status === 'PENDING') {
                      <span class="ds-chip am-chip-pending">PENDING</span>
                    } @else if (inq.status === 'REVIEWED') {
                      <span class="ds-chip am-chip-reviewed">REVIEWED</span>
                    } @else if (inq.status === 'APPROVED') {
                      <span class="ds-chip am-chip-approved">APPROVED</span>
                    } @else if (inq.status === 'REJECTED') {
                      <span class="ds-chip am-chip-rejected">REJECTED</span>
                    }
                  </td>
                  <td class="am-td-actions">
                    <div class="am-actions-group">
                      @if (inq.status === 'PENDING') {
                        <button (click)="updateStatus(inq.id, 'REVIEWED')" class="ds-btn ds-btn-ghost am-action-btn">Reviewed</button>
                      }
                      @if (inq.status !== 'APPROVED' && inq.status !== 'REJECTED') {
                        <button (click)="updateStatus(inq.id, 'APPROVED')" class="ds-btn ds-btn-success am-action-btn">Approve</button>
                        <button (click)="updateStatus(inq.id, 'REJECTED')" class="ds-btn ds-btn-danger am-action-btn">Reject</button>
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
  styleUrl: './admissions-manager.component.scss'
})
export class AdmissionsManagerComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() tenantName!: string;
  @Input() refreshTrigger: number = 0;

  protected readonly inquiries = signal<AdmissionInquiry[]>([]);

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['tenantId'] && this.tenantId) || (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange)) {
      this.fetchInquiries();
    }
  }

  fetchInquiries() {
    this.http.get<AdmissionInquiry[]>(`http://localhost:8080/api/admin/sites/${this.tenantId}/admissions`)
      .subscribe({
        next: (data) => {
          this.inquiries.set(data);
        },
        error: (err) => {
          console.error('Failed to fetch admissions inquiries', err);
        }
      });
  }

  updateStatus(leadId: number, status: string) {
    this.http.put<any>(`http://localhost:8080/api/admin/admissions/${leadId}/status?status=${status}`, {})
      .subscribe({
        next: () => {
          this.fetchInquiries();
        },
        error: (err) => {
          console.error('Failed to transition admission inquiry status', err);
        }
      });
  }
}
