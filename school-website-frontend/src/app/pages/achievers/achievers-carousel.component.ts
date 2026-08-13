import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  SimpleChanges,
  signal,
  computed,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

export interface StudentAchiever {
  id: number;
  name: string;
  score: string;
  courseName: string;
  testimonialText: string;
  imageUrl?: string;
}

interface CoverItem {
  data: StudentAchiever;
  offset: number; // -2,-1,0,1,2 (0 = center)
  realIndex: number;
}

@Component({
  selector: 'app-achievers-carousel',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    @if (achievers().length > 0) {
      <section [dsScrollReveal]="0" class="ach" (mouseenter)="onHover(true)" (mouseleave)="onHover(false)">
        <div class="ach-container">

          <!-- Header -->
          <header class="ach-header">
            <span class="ach-kicker" [style.color]="accentColor">Our Achievers</span>
            <h2 class="ach-title" [style.color]="primaryColor">Our Proud Students' Achievements</h2>
            <p class="ach-sub">Celebrating excellence, dedication and the spirit to succeed.</p>
          </header>

          <!-- Coverflow -->
          <div class="ach-wrap">
            <button type="button" class="ach-nav ach-nav-prev" (click)="previous()" aria-label="Previous">‹</button>

            <div class="ach-stage">
              @for (item of coverItems(); track item.realIndex) {
                <article class="ach-card"
                  [class.is-center]="item.offset === 0"
                  [attr.data-off]="item.offset"
                  (click)="onCardClick(item)">
                  <div class="ach-img-wrap">
                    <img class="ach-img" [src]="item.data.imageUrl || fallbackImg" [alt]="item.data.name" loading="lazy" />
                    @if (item.data.score) {
                      <span class="ach-badge" [style.background]="accentColor">{{ item.data.score }}</span>
                    }
                  </div>
                  <!-- Text only under the centre feature -->
                  @if (item.offset === 0) {
                    <div class="ach-content ds-pop">
                      <h3 class="ach-card-title">{{ item.data.testimonialText || item.data.courseName }}</h3>
                      <p class="ach-name">
                        <strong [style.color]="primaryColor">{{ item.data.name }}</strong>
                        @if (item.data.courseName) { <span class="ach-dot">•</span> {{ item.data.courseName }} }
                      </p>
                    </div>
                  }
                </article>
              }
            </div>

            <button type="button" class="ach-nav ach-nav-next" (click)="next()" aria-label="Next">›</button>
          </div>

          <!-- Indicators -->
          @if (achievers().length > 1) {
            <div class="ach-dots">
              @for (a of achievers(); track a.id; let i = $index) {
                <button type="button" class="ach-dot-btn" [class.active]="center() === i"
                  [style.background]="center() === i ? primaryColor : '#d1d5db'"
                  (click)="goTo(i)" aria-label="Go to slide"></button>
              }
            </div>
          }

          <!-- CTA -->
          <div class="ach-cta">
            <button type="button" class="ach-cta-btn"
              [style.border-color]="primaryColor"
              (mouseenter)="ctaHover = true" (mouseleave)="ctaHover = false"
              [style.background]="ctaHover ? primaryColor : 'transparent'"
              [style.color]="ctaHover ? '#fff' : primaryColor"
              (click)="viewAll.emit()">
              View All Achievements
            </button>
          </div>

        </div>
      </section>
    }
  `,
  styles: [`
    * { box-sizing: border-box; }
    .ach { width: 100%; padding: 4rem 2.5rem; background: #ffffff; overflow: hidden; font-family: 'Inter', system-ui, sans-serif; }
    .ach-container { width: 100%; max-width: 1500px; margin: 0 auto; }

    .ach-header { text-align: center; margin-bottom: 2.5rem; }
    .ach-kicker { font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; display: block; margin-bottom: 0.6rem; }
    .ach-title { margin: 0; font-size: clamp(1.8rem, 3vw, 2.6rem); font-weight: 800; letter-spacing: -0.02em; }
    .ach-sub { margin: 0.85rem 0 0; font-size: 1.02rem; color: #6b7280; }

    .ach-wrap { position: relative; display: flex; align-items: center; justify-content: center; }

    /* Coverflow stage */
    .ach-stage {
      display: flex; align-items: center; justify-content: center;
      gap: 1.25rem; width: 100%; min-height: 420px; padding: 1rem 0;
    }

    .ach-card {
      flex: 0 0 auto; cursor: pointer; text-align: center;
      transition: transform 500ms cubic-bezier(0.22,1,0.36,1), opacity 500ms ease, filter 500ms ease;
    }
    .ach-img-wrap {
      position: relative; overflow: hidden; border-radius: 14px; background: #f3f4f6;
      box-shadow: 0 10px 26px rgba(0,0,0,0.14);
      transition: width 500ms cubic-bezier(0.22,1,0.36,1), height 500ms cubic-bezier(0.22,1,0.36,1);
    }
    .ach-img { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform 500ms ease; }
    .ach-card:hover .ach-img { transform: scale(1.05); }

    /* Sizes by distance from centre: LARGE / MEDIUM / SMALL */
    .ach-card[data-off="0"]  .ach-img-wrap { width: 300px; height: 380px; }
    .ach-card[data-off="1"]  .ach-img-wrap,
    .ach-card[data-off="-1"] .ach-img-wrap { width: 210px; height: 290px; }
    .ach-card[data-off="2"]  .ach-img-wrap,
    .ach-card[data-off="-2"] .ach-img-wrap { width: 150px; height: 210px; }

    .ach-card[data-off="1"], .ach-card[data-off="-1"] { opacity: 0.85; }
    .ach-card[data-off="2"], .ach-card[data-off="-2"] { opacity: 0.6; filter: saturate(0.85); }
    .ach-card.is-center { z-index: 2; }

    .ach-badge { position: absolute; top: 10px; right: 10px; color: #0f172a; font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.55rem; border-radius: 9999px; text-transform: uppercase; box-shadow: 0 2px 8px rgba(0,0,0,0.25); }

    .ach-content { padding: 1.1rem 0.5rem 0; max-width: 340px; margin: 0 auto; }
    .ach-card-title { margin: 0; color: #111827; font-size: 1rem; line-height: 1.4; font-weight: 700; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .ach-name { margin: 0.7rem 0 0; color: #4b5563; font-size: 0.92rem; }
    .ach-dot { margin: 0 0.2rem; color: #cbd5e1; }

    .ach-nav {
      position: absolute; z-index: 10; top: 42%; transform: translateY(-50%);
      width: 46px; height: 46px; border: 0; border-radius: 50%; background: #fff; color: #111827;
      font-size: 1.6rem; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.16); transition: transform 200ms ease, box-shadow 200ms ease;
    }
    .ach-nav:hover { transform: translateY(-50%) scale(1.09); box-shadow: 0 6px 22px rgba(0,0,0,0.22); }
    .ach-nav-prev { left: 0; }
    .ach-nav-next { right: 0; }

    .ach-dots { display: flex; justify-content: center; gap: 8px; margin-top: 1.5rem; }
    .ach-dot-btn { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 9999px; cursor: pointer; transition: width 250ms ease; }
    .ach-dot-btn.active { width: 26px; }

    .ach-cta { display: flex; justify-content: center; margin-top: 2.5rem; }
    .ach-cta-btn { min-width: 210px; padding: 0.85rem 1.75rem; border: 1.5px solid; background: transparent; font-size: 0.95rem; font-weight: 700; cursor: pointer; border-radius: 10px; transition: background 200ms ease, color 200ms ease; }

    /* Tablet: show 3 (center + 1 each side) */
    @media (max-width: 1100px) {
      .ach-card[data-off="2"], .ach-card[data-off="-2"] { display: none; }
      .ach-card[data-off="0"] .ach-img-wrap { width: 260px; height: 340px; }
      .ach-card[data-off="1"] .ach-img-wrap, .ach-card[data-off="-1"] .ach-img-wrap { width: 170px; height: 240px; }
    }
    /* Mobile: center only */
    @media (max-width: 700px) {
      .ach { padding: 3rem 1rem; }
      .ach-card[data-off="1"], .ach-card[data-off="-1"] { display: none; }
      .ach-card[data-off="0"] .ach-img-wrap { width: 82vw; max-width: 320px; height: 400px; }
      .ach-nav { width: 40px; height: 40px; font-size: 1.3rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      .ach-card, .ach-img-wrap, .ach-img { transition: none; }
    }
  `],
})
export class AchieversCarouselComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tenantId!: number;
  @Input() primaryColor!: string;
  @Input() accentColor!: string;
  @Input() autoplayMs = 5000;
  @Output() viewAll = new EventEmitter<void>();

  protected readonly achievers = signal<StudentAchiever[]>([]);
  protected readonly center = signal(0);

  protected readonly fallbackImg = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=500&q=80';
  protected ctaHover = false;

  private autoTimer?: ReturnType<typeof setInterval>;
  private hovering = false;

  /** Builds the 5-item window (offsets -2..2) centered on `center()`, wrapping around. */
  protected readonly coverItems = computed<CoverItem[]>(() => {
    const list = this.achievers();
    const n = list.length;
    if (n === 0) return [];
    const c = this.center();
    const items: CoverItem[] = [];
    for (let off = -2; off <= 2; off++) {
      const realIndex = ((c + off) % n + n) % n;
      // avoid duplicates when there are very few achievers
      if (n <= 4 && items.some((it) => it.realIndex === realIndex && off !== 0)) continue;
      items.push({ data: list[realIndex], offset: off, realIndex });
    }
    return items;
  });

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tenantId'] && this.tenantId) {
      this.fetchAchievers();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  @HostListener('window:resize')
  onResize(): void {
    // sizes handled purely via CSS media queries
  }

  fetchAchievers(): void {
    this.http.get<StudentAchiever[]>(`http://localhost:8080/api/sites/${this.tenantId}/achievers`).subscribe({
      next: (data) => {
        this.achievers.set(data ?? []);
        this.center.set(0);
      },
      error: (err) => console.error(err),
    });
  }

  next(): void {
    const n = this.achievers().length;
    if (n <= 1) return;
    this.center.update((i) => (i + 1) % n);
  }

  previous(): void {
    const n = this.achievers().length;
    if (n <= 1) return;
    this.center.update((i) => (i - 1 + n) % n);
  }

  goTo(i: number): void {
    this.center.set(i);
  }

  onCardClick(item: CoverItem): void {
    if (item.offset !== 0) {
      this.center.set(item.realIndex);
    }
  }

  onHover(isHover: boolean): void {
    this.hovering = isHover;
    if (isHover) {
      this.stopAutoplay();
    } else {
      this.startAutoplay();
    }
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (typeof window === 'undefined' || this.hovering) return;
    this.autoTimer = setInterval(() => this.next(), this.autoplayMs);
  }

  private stopAutoplay(): void {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = undefined;
    }
  }
}
