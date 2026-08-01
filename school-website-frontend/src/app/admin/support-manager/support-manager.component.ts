import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface SupportInquiry {
  id: number;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  status: string; // PENDING, RESOLVED
  resolutionNotes?: string;
  createdAt: string;
}

@Component({
  selector: 'app-support-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #1e293b; margin-top: 0; margin-bottom: 0.5rem; font-weight: 700;">Public Support Desk & Query Resolver</h2>
      <p style="color: #64748b; font-size: 0.9rem; margin-top: 0; margin-bottom: 1.5rem;">Respond to contact forms and support queries submitted by visitors of: <strong style="color: #0f172a;">{{ tenantName }}</strong></p>

      @if (inquiries().length === 0) {
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 3rem; text-align: center; border-radius: 8px; color: #64748b;">
          <span style="font-size: 2.5rem; display: block; margin-bottom: 1rem;">📬</span>
          <p style="font-size: 1rem; margin: 0;">Inbox is completely empty. No support tickets yet.</p>
          <p style="font-size: 0.85rem; margin-top: 0.25rem;">Use the simulated portal below to submit a message under your public contact page.</p>
        </div>
      } @else {
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          @for (inq of inquiries(); track inq.id) {
            <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 1.25rem; background: #f8fafc;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
                <div>
                  <strong style="font-size: 1.1rem; color: #0f172a; display: block;">{{ inq.subject }}</strong>
                  <span style="font-size: 0.8rem; color: #64748b;">From: {{ inq.senderName }} ({{ inq.senderEmail }})</span>
                </div>
                <div>
                  @if (inq.status === 'PENDING') {
                    <span style="background: #fee2e2; color: #b91c1c; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700;">UNRESOLVED</span>
                  } @else {
                    <span style="background: #dcfce7; color: #15803d; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700;">RESOLVED</span>
                  }
                </div>
              </div>

              <p style="color: #475569; font-size: 0.9rem; line-height: 1.5; margin: 0 0 1rem 0;">{{ inq.message }}</p>

              <!-- Resolution Section -->
              @if (inq.status === 'PENDING') {
                <div style="display: flex; gap: 0.5rem; background: white; padding: 0.75rem; border-radius: 6px; border: 1px solid #e2e8f0; align-items: center;">
                  <input type="text" [(ngModel)]="notesMap[inq.id]" placeholder="Type resolution note (e.g. Called back and explained assessments)..." style="flex: 1; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.85rem;" />
                  <button (click)="resolveQuery(inq.id)" [disabled]="!notesMap[inq.id]" style="background: #1e3a8a; color: white; border: 0; padding: 0.5rem 1rem; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
                    Resolve
                  </button>
                </div>
              } @else {
                <div style="background: #ecfdf5; border: 1px solid #cbd5e1; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; color: #047857;">
                  <strong>Resolution Notes:</strong> {{ inq.resolutionNotes }}
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class SupportManagerComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() tenantName!: string;
  @Input() refreshTrigger: number = 0;

  protected readonly inquiries = signal<SupportInquiry[]>([]);
  notesMap: { [key: number]: string } = {};

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['tenantId'] && this.tenantId) || (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange)) {
      this.fetchInquiries();
    }
  }

  fetchInquiries() {
    this.http.get<SupportInquiry[]>(`http://localhost:8080/api/admin/sites/${this.tenantId}/support`)
      .subscribe({
        next: (data) => this.inquiries.set(data),
        error: (err) => console.error(err)
      });
  }

  resolveQuery(id: number) {
    const notes = this.notesMap[id];
    if (!notes) return;

    this.http.put<any>(`http://localhost:8080/api/admin/support/${id}/resolve?notes=${notes}`, {})
      .subscribe({
        next: () => {
          this.fetchInquiries();
          delete this.notesMap[id];
        },
        error: (err) => console.error(err)
      });
  }
}
