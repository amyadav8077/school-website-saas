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
    <div class="ds-card ds-reveal" style="padding: 2rem; margin-bottom: 2rem;">
      <h2 class="ds-heading" style="font-size: 1.5rem; margin-top: 0; margin-bottom: 0.5rem;">Admissions Inquiries <span class="ds-heading-grad">Pipeline</span></h2>
      <p style="color: #64748b; font-size: 0.9rem; margin-top: 0; margin-bottom: 1.5rem;">Review and process candidate registrations for: <strong style="color: #0f172a;">{{ tenantName }}</strong></p>

      @if (inquiries().length === 0) {
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 3rem; text-align: center; border-radius: 8px; color: #64748b;">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">📬</span>
          <p style="font-size: 1rem; margin: 0;">No admissions inquiries received yet.</p>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Use the simulated portal below to submit a public inquiry. It will show up here instantly!</p>
        </div>
      } @else {
        <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: 600;">
                <th style="padding: 1rem;">Ref ID</th>
                <th style="padding: 1rem;">Student Details</th>
                <th style="padding: 1rem;">Parent Details</th>
                <th style="padding: 1rem;">Notes</th>
                <th style="padding: 1rem;">Pipeline Status</th>
                <th style="padding: 1rem; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (inq of inquiries(); track inq.id) {
                <tr style="border-bottom: 1px solid #e2e8f0; hover: background-color: #f8fafc;">
                  <td style="padding: 1rem; font-weight: 700; color: #1e3a8a;">ADM-00{{ inq.id }}</td>
                  <td style="padding: 1rem;">
                    <strong style="display: block; color: #0f172a;">{{ inq.studentName }}</strong>
                    <span style="font-size: 0.8rem; color: #64748b;">Grade: {{ inq.gradeLevel }}</span>
                  </td>
                  <td style="padding: 1rem;">
                    <span style="display: block; color: #0f172a; font-weight: 500;">{{ inq.parentName }}</span>
                    <span style="font-size: 0.8rem; color: #64748b; display: block;">✉️ {{ inq.parentEmail }}</span>
                    <span style="font-size: 0.8rem; color: #64748b; display: block;">📞 {{ inq.parentPhone }}</span>
                  </td>
                  <td style="padding: 1rem; max-width: 150px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" [title]="inq.message || ''">
                    {{ inq.message || 'No remarks.' }}
                  </td>
                  <td style="padding: 1rem;">
                    @if (inq.status === 'PENDING') {
                      <span class="ds-chip" style="background: #ffedd5; color: #b45309;">PENDING</span>
                    } @else if (inq.status === 'REVIEWED') {
                      <span class="ds-chip" style="background: #e0f2fe; color: #0369a1;">REVIEWED</span>
                    } @else if (inq.status === 'APPROVED') {
                      <span class="ds-chip" style="background: #dcfce7; color: #15803d;">APPROVED</span>
                    } @else if (inq.status === 'REJECTED') {
                      <span class="ds-chip" style="background: #fee2e2; color: #b91c1c;">REJECTED</span>
                    }
                  </td>
                  <td style="padding: 1rem; text-align: right; white-space: nowrap;">
                    <div style="display: flex; gap: 0.25rem; justify-content: flex-end;">
                      @if (inq.status === 'PENDING') {
                        <button (click)="updateStatus(inq.id, 'REVIEWED')" class="ds-btn ds-btn-ghost" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;">Reviewed</button>
                      }
                      @if (inq.status !== 'APPROVED' && inq.status !== 'REJECTED') {
                        <button (click)="updateStatus(inq.id, 'APPROVED')" class="ds-btn ds-btn-success" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;">Approve</button>
                        <button (click)="updateStatus(inq.id, 'REJECTED')" class="ds-btn ds-btn-danger" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;">Reject</button>
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
  `
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
