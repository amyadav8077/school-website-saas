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
    <div class="ds-card ds-reveal sm-card">
      <h2 class="ds-heading sm-title">Public Support Desk & <span class="ds-heading-grad">Query Resolver</span></h2>
      <p class="sm-subtitle">Respond to contact forms and support queries submitted by visitors of: <strong class="sm-tenant">{{ tenantName }}</strong></p>

      @if (inquiries().length === 0) {
        <div class="sm-empty">
          <span class="sm-empty-icon">📬</span>
          <p class="sm-empty-title">Inbox is completely empty. No support tickets yet.</p>
          <p class="sm-empty-hint">Use the simulated portal below to submit a message under your public contact page.</p>
        </div>
      } @else {
        <div class="sm-list">
          @for (inq of inquiries(); track inq.id) {
            <div class="ds-card sm-item">
              <div class="sm-item-head">
                <div>
                  <strong class="sm-item-subject">{{ inq.subject }}</strong>
                  <span class="sm-item-from">From: {{ inq.senderName }} ({{ inq.senderEmail }})</span>
                </div>
                <div>
                  @if (inq.status === 'PENDING') {
                    <span class="ds-chip sm-chip-pending">UNRESOLVED</span>
                  } @else {
                    <span class="ds-chip sm-chip-resolved">RESOLVED</span>
                  }
                </div>
              </div>

              <p class="sm-item-message">{{ inq.message }}</p>

              <!-- Resolution Section -->
              @if (inq.status === 'PENDING') {
                <div class="sm-resolve-row">
                  <input type="text" [(ngModel)]="notesMap[inq.id]" placeholder="Type resolution note (e.g. Called back and explained assessments)..." class="sm-resolve-input" />
                  <button (click)="resolveQuery(inq.id)" [disabled]="!notesMap[inq.id]" class="ds-btn ds-btn-success sm-resolve-btn">
                    Resolve
                  </button>
                </div>
              } @else {
                <div class="sm-resolved-note">
                  <strong>Resolution Notes:</strong> {{ inq.resolutionNotes }}
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './support-manager.component.scss'
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
