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
    <div style="background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
      <!-- Tab Header Toggle -->
      <div style="display: flex; gap: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.75rem; margin-bottom: 1.5rem;">
        <button (click)="activeTab.set('NEWS')" 
          style="background: none; border: 0; padding: 0.5rem 1rem; font-size: 1.1rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent;"
          [style.border-bottom-color]="activeTab() === 'NEWS' ? '#1e3a8a' : 'transparent'"
          [style.color]="activeTab() === 'NEWS' ? '#1e3a8a' : '#64748b'">
          📢 School News & Circulars
        </button>
        <button (click)="activeTab.set('EVENTS')" 
          style="background: none; border: 0; padding: 0.5rem 1rem; font-size: 1.1rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent;"
          [style.border-bottom-color]="activeTab() === 'EVENTS' ? '#1e3a8a' : 'transparent'"
          [style.color]="activeTab() === 'EVENTS' ? '#1e3a8a' : '#64748b'">
          📅 Academic Events Calendar
        </button>
      </div>

      <!-- Tab 1: News Circular Manager -->
      @if (activeTab() === 'NEWS') {
        <div>
          <h3 style="margin-top: 0; margin-bottom: 1rem; color: #1e293b; font-weight: 700; font-size: 1.2rem;">Publish News Bulletin / Circular</h3>
          
          <form (ngSubmit)="publishNews()" #newsForm="ngForm" style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1rem; margin-bottom: 2rem; background: #f8fafc; padding: 1.25rem; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Article Title</label>
              <input type="text" name="title" [(ngModel)]="newNews.title" required placeholder="e.g. Annual Sports Meet Registrations" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Publisher / Author</label>
              <input type="text" name="author" [(ngModel)]="newNews.author" required placeholder="e.g. Principal's Office" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div style="grid-column: span 2;">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Article Content</label>
              <textarea name="content" [(ngModel)]="newNews.content" required rows="3" placeholder="Type the complete circular or announcement here..." style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; resize: vertical;"></textarea>
            </div>
            <div style="grid-column: span 2; text-align: right;">
              <button type="submit" [disabled]="!newsForm.form.valid" style="background: #1e3a8a; color: white; border: 0; padding: 0.65rem 1.25rem; border-radius: 4px; font-weight: 600; cursor: pointer;">
                Publish Announcement
              </button>
            </div>
          </form>

          <h3 style="margin-bottom: 0.75rem; color: #1e293b; font-weight: 700; font-size: 1.2rem;">Published Bulletins</h3>
          @if (newsList().length === 0) {
            <p style="color: #64748b; font-style: italic;">No announcements published yet.</p>
          } @else {
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              @for (n of newsList(); track n.id) {
                <div style="background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <strong style="font-size: 1.1rem; color: #0f172a;">{{ n.title }}</strong>
                    <button (click)="deleteNews(n.id!)" style="background: none; border: 0; color: #ef4444; font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                      🗑️ Remove
                    </button>
                  </div>
                  <p style="color: #475569; font-size: 0.9rem; margin: 0; line-height: 1.5; white-space: pre-line;">{{ n.content }}</p>
                  <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 0.5rem; margin-top: 0.5rem;">
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
          <h3 style="margin-top: 0; margin-bottom: 1rem; color: #1e293b; font-weight: 700; font-size: 1.2rem;">Schedule School Event</h3>
          
          <form (ngSubmit)="scheduleEvent()" #eventForm="ngForm" style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1rem; margin-bottom: 2rem; background: #f8fafc; padding: 1.25rem; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Event Title</label>
              <input type="text" name="title" [(ngModel)]="newEvent.title" required placeholder="e.g. Science Exhibition 2026" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Event Date & Time</label>
              <input type="datetime-local" name="eventDate" [(ngModel)]="newEvent.eventDate" required style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Venue / Location</label>
              <input type="text" name="location" [(ngModel)]="newEvent.location" required placeholder="e.g. Main Auditorium" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div style="grid-column: span 2;">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Short Event Description</label>
              <input type="text" name="description" [(ngModel)]="newEvent.description" required placeholder="Details about timing, entry requirements, chief guest details..." style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div style="grid-column: span 2; text-align: right;">
              <button type="submit" [disabled]="!eventForm.form.valid" style="background: #1e3a8a; color: white; border: 0; padding: 0.65rem 1.25rem; border-radius: 4px; font-weight: 600; cursor: pointer;">
                Schedule Event
              </button>
            </div>
          </form>

          <h3 style="margin-bottom: 0.75rem; color: #1e293b; font-weight: 700; font-size: 1.2rem;">Scheduled Events</h3>
          @if (events().length === 0) {
            <p style="color: #64748b; font-style: italic;">No events scheduled in the calendar yet.</p>
          } @else {
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              @for (ev of events(); track ev.id) {
                <div style="background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                      <strong style="font-size: 1.05rem; color: #0f172a;">{{ ev.title }}</strong>
                      <span style="background: #fee2e2; color: #b91c1c; font-size: 0.75rem; padding: 0.15rem 0.40rem; border-radius: 4px; font-weight: 700; white-space: nowrap;">📅 {{ ev.eventDate | date:'MMM d, h:mm a' }}</span>
                    </div>
                    <span style="font-size: 0.8rem; color: #64748b; display: block; margin-bottom: 0.5rem;">📍 Venue: {{ ev.location }}</span>
                    <p style="color: #475569; font-size: 0.85rem; margin: 0; line-height: 1.4;">{{ ev.description }}</p>
                  </div>
                  <div style="text-align: right; margin-top: 0.75rem; border-top: 1px solid #f1f5f9; padding-top: 0.5rem;">
                    <button (click)="deleteEvent(ev.id!)" style="background: none; border: 0; color: #ef4444; font-size: 0.8rem; font-weight: 600; cursor: pointer;">
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
  `
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
