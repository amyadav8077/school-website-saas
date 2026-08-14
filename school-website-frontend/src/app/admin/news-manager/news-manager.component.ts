import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface SchoolEvent {
  id?: number;
  title: string;
  description: string;
  eventDate: string;
  location: string;
}

export interface SchoolNews {
  id?: number;
  title: string;
  content: string;
  author: string;
  publishedDate: string;
}

@Component({
  selector: 'app-news-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ds-card ds-reveal nm-card">
      <!-- Tab Header Toggle -->
      <div class="nm-tab-header">
        <button (click)="activeTab.set('NEWS')" 
          class="nm-tab-btn"
          [style.border-bottom-color]="activeTab() === 'NEWS' ? '#1e3a8a' : 'transparent'"
          [style.color]="activeTab() === 'NEWS' ? '#1e3a8a' : '#64748b'">
          📢 School News & Circulars
        </button>
        <button (click)="activeTab.set('EVENTS')" 
          class="nm-tab-btn"
          [style.border-bottom-color]="activeTab() === 'EVENTS' ? '#1e3a8a' : 'transparent'"
          [style.color]="activeTab() === 'EVENTS' ? '#1e3a8a' : '#64748b'">
          📅 Academic Events Calendar
        </button>
      </div>

      <!-- Tab 1: News Circular Manager -->
      @if (activeTab() === 'NEWS') {
        <div>
          <h3 class="ds-heading nm-section-heading-first">Publish News Bulletin / Circular</h3>
          
          <form (ngSubmit)="publishNews()" #newsForm="ngForm" class="nm-form">
            <div>
              <label class="nm-label">Article Title</label>
              <input type="text" name="title" [(ngModel)]="newNews.title" required placeholder="e.g. Annual Sports Meet Registrations" class="nm-input" />
            </div>
            <div>
              <label class="nm-label">Publisher / Author</label>
              <input type="text" name="author" [(ngModel)]="newNews.author" required placeholder="e.g. Principal's Office" class="nm-input" />
            </div>
            <div class="nm-field-span2">
              <label class="nm-label">Article Content</label>
              <textarea name="content" [(ngModel)]="newNews.content" required rows="3" placeholder="Type the complete circular or announcement here..." class="nm-textarea"></textarea>
            </div>
            <div class="nm-field-span2-right">
              <button type="submit" [disabled]="!newsForm.form.valid" class="ds-btn ds-btn-primary">
                Publish Announcement
              </button>
            </div>
          </form>

          <h3 class="ds-heading nm-section-heading">Published Bulletins</h3>
          @if (newsList().length === 0) {
            <p class="nm-empty">No announcements published yet.</p>
          } @else {
            <div class="nm-list">
              @for (n of newsList(); track n.id) {
                <div class="ds-card ds-card-hover nm-news-card">
                  <div class="nm-news-card-header">
                    <strong class="nm-news-title">{{ n.title }}</strong>
                    <button (click)="deleteNews(n.id!)" class="ds-btn ds-btn-danger nm-remove-btn">
                      🗑️ Remove
                    </button>
                  </div>
                  <p class="nm-news-content">{{ n.content }}</p>
                  <div class="nm-news-footer">
                    <span>By: <strong>{{ n.author }}</strong></span>
                    <span>Published: {{ n.publishedDate | date:'medium' }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Tab 2: Events Calendar Manager -->
      @if (activeTab() === 'EVENTS') {
        <div>
          <h3 class="ds-heading nm-section-heading-first">Schedule School Event</h3>
          
          <form (ngSubmit)="scheduleEvent()" #eventForm="ngForm" class="nm-form">
            <div>
              <label class="nm-label">Event Title</label>
              <input type="text" name="title" [(ngModel)]="newEvent.title" required placeholder="e.g. Science Exhibition 2026" class="nm-input" />
            </div>
            <div>
              <label class="nm-label">Event Date & Time</label>
              <input type="datetime-local" name="eventDate" [(ngModel)]="newEvent.eventDate" required class="nm-input-date" />
            </div>
            <div>
              <label class="nm-label">Venue / Location</label>
              <input type="text" name="location" [(ngModel)]="newEvent.location" required placeholder="e.g. Main Auditorium" class="nm-input" />
            </div>
            <div class="nm-field-span2">
              <label class="nm-label">Short Event Description</label>
              <input type="text" name="description" [(ngModel)]="newEvent.description" required placeholder="Details about timing, entry requirements, chief guest details..." class="nm-input" />
            </div>
            <div class="nm-field-span2-right">
              <button type="submit" [disabled]="!eventForm.form.valid" class="ds-btn ds-btn-primary">
                Schedule Event
              </button>
            </div>
          </form>

          <h3 class="ds-heading nm-section-heading">Scheduled Events</h3>
          @if (events().length === 0) {
            <p class="nm-empty">No events scheduled in the calendar yet.</p>
          } @else {
            <div class="nm-events-grid">
              @for (ev of events(); track ev.id) {
                <div class="ds-card ds-card-hover nm-event-card">
                  <div>
                    <div class="nm-event-card-header">
                      <strong class="nm-event-title">{{ ev.title }}</strong>
                      <span class="nm-event-date-badge">📅 {{ ev.eventDate | date:'MMM d, h:mm a' }}</span>
                    </div>
                    <span class="nm-event-venue">📍 Venue: {{ ev.location }}</span>
                    <p class="nm-event-desc">{{ ev.description }}</p>
                  </div>
                  <div class="nm-event-footer">
                    <button (click)="deleteEvent(ev.id!)" class="ds-btn ds-btn-danger nm-remove-btn">
                      🗑️ Cancel Event
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './news-manager.component.scss'
})
export class NewsManagerComponent implements OnChanges {
  @Input() tenantId!: number;
  @Output() notificationModified = new EventEmitter<void>();

  protected readonly activeTab = signal<string>('NEWS');
  protected readonly newsList = signal<SchoolNews[]>([]);
  protected readonly events = signal<SchoolEvent[]>([]);

  newNews = {
    title: '',
    content: '',
    author: ''
  };

  newEvent = {
    title: '',
    description: '',
    eventDate: '',
    location: ''
  };

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantId'] && this.tenantId) {
      this.fetchNews();
      this.fetchEvents();
    }
  }

  fetchNews() {
    this.http.get<SchoolNews[]>(`http://localhost:8080/api/sites/${this.tenantId}/news`)
      .subscribe({
        next: (data) => this.newsList.set(data),
        error: (err) => console.error(err)
      });
  }

  fetchEvents() {
    this.http.get<SchoolEvent[]>(`http://localhost:8080/api/sites/${this.tenantId}/events`)
      .subscribe({
        next: (data) => this.events.set(data),
        error: (err) => console.error(err)
      });
  }

  publishNews() {
    this.http.post<SchoolNews>(`http://localhost:8080/api/admin/sites/${this.tenantId}/news`, this.newNews)
      .subscribe({
        next: () => {
          this.fetchNews();
          this.notificationModified.emit();
          this.newNews = {
            title: '',
            content: '',
            author: ''
          };
        },
        error: (err) => console.error(err)
      });
  }

  deleteNews(id: number) {
    this.http.delete(`http://localhost:8080/api/admin/news/${id}`)
      .subscribe({
        next: () => {
          this.fetchNews();
          this.notificationModified.emit();
        },
        error: (err) => console.error(err)
      });
  }

  scheduleEvent() {
    this.http.post<SchoolEvent>(`http://localhost:8080/api/admin/sites/${this.tenantId}/events`, this.newEvent)
      .subscribe({
        next: () => {
          this.fetchEvents();
          this.notificationModified.emit();
          this.newEvent = {
            title: '',
            description: '',
            eventDate: '',
            location: ''
          };
        },
        error: (err) => console.error(err)
      });
  }

  deleteEvent(id: number) {
    this.http.delete(`http://localhost:8080/api/admin/events/${id}`)
      .subscribe({
        next: () => {
          this.fetchEvents();
          this.notificationModified.emit();
        },
        error: (err) => console.error(err)
      });
  }
}
