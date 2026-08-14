import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page"
         [style.--ep-primary]="primaryColor"
         [style.--ep-accent]="accentColor">

      <div class="blob one"></div>
      <div class="blob two"></div>

      <header>
        <div class="brand">
          <div class="logo">{{ logo }}</div>
          <span>{{ schoolName }}</span>
        </div>

        <nav>
          <a (click)="goHome.emit()">Home</a>
          <a (click)="explore.emit()">About</a>
          <a (click)="explore.emit()">Academics</a>
          <a (click)="explore.emit()">Admissions</a>
          <a (click)="explore.emit()">Contact</a>
        </nav>
      </header>

      <main class="main">

        <section>
          <div class="eyebrow">
            <span class="pulse"></span>
            {{ mode === 'connection' ? 'CONNECTION LOST' : 'PAGE NOT FOUND' }}
          </div>

          <h1>{{ mode === 'connection' ? '⚠' : '404' }}</h1>

          <h2>{{ mode === 'connection' ? 'Oops! We lost the signal.' : 'Oops! Wrong classroom.' }}</h2>

          <p class="description">
            @if (mode === 'connection') {
              We couldn't reach the school server right now. Please check your internet
              connection and try again in a moment.
            } @else {
              Looks like you've wandered into a classroom that doesn't exist.
              The page you're looking for may have moved or is no longer available.
            }
          </p>

          <div class="actions">
            @if (mode === 'connection') {
              <a class="btn primary" (click)="retry.emit()">↻ Retry Connection</a>
              <a class="btn secondary" (click)="goHome.emit()">Back to Home</a>
            } @else {
              <a class="btn primary" (click)="goHome.emit()">← Back to Home</a>
              <a class="btn secondary" (click)="explore.emit()">Explore School</a>
            }
          </div>
        </section>

        <section class="scene" aria-hidden="true">
          <div class="glow"></div>

          <div class="orbit">
            <span class="star a"></span>
            <span class="star b"></span>
            <span class="star c"></span>
          </div>

          <div class="paper" [attr.data-label]="mode === 'connection' ? '⚠' : '404'"></div>

          <div class="school-card">
            <div class="school-icon">🏫</div>

            <div class="classroom">
              <div class="board">{{ mode === 'connection' ? '⚠' : '404' }}</div>
              <div class="desk"></div>
              <div class="sticky">{{ mode === 'connection' ? 'OFFLINE' : 'LOST!' }}</div>
            </div>
          </div>
        </section>

      </main>

      <footer>
        © {{ year }} {{ schoolName }} · Let's get you back on track.
      </footer>

    </div>
  `,
  styleUrl: './error-page.component.scss'
})
export class ErrorPageComponent {
  /** '404' for unknown pages, 'connection' for backend/network failure */
  @Input() mode: '404' | 'connection' = '404';
  @Input() schoolName = 'Our School';
  @Input() logo = '🎓';
  @Input() primaryColor = '#3157d5';
  @Input() accentColor = '#7c5cff';

  @Output() goHome = new EventEmitter<void>();
  @Output() explore = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  protected readonly year = new Date().getFullYear();
}
