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
  styleUrl: './achievers-carousel.component.scss',
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
