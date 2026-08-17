import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CarouselSlide {
  url: string;
  caption?: string;
  subtitle?: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (slidesInternal.length > 0) {
      <section
        #carouselRoot
        class="hc"
        tabindex="0"
        role="region"
        aria-roledescription="carousel"
        [attr.aria-label]="'Campus highlights carousel. Slide ' + (active() + 1) + ' of ' + slidesInternal.length"
        (mouseenter)="onHover(true)"
        (mouseleave)="onHover(false)"
        (focusin)="onHover(true)"
        (focusout)="onHover(false)"
      >
        <div
          class="hc-backdrop"
          [class.hc-backdrop--transitioning]="transitioning()"
          [style.background-image]="'url(' + current().url + ')'"
          aria-hidden="true"
        ></div>
        <div class="hc-veil" aria-hidden="true"></div>

        <!-- Main copy -->
        <main class="hc-body">
          <div class="hc-eyebrow" [style.color]="accentColor">Campus Highlights</div>
          <h1 class="hc-title">{{ current().caption || 'Discover Our Campus' }}</h1>
          @if (current().subtitle) {
            <p class="hc-desc">{{ current().subtitle }}</p>
          }
        </main>

        <!-- Preview cards (replaces old thumbnail strip) -->
        <div class="hc-cards" aria-label="Other highlights">
          @for (s of visibleSlides(); track s.i; let cardIndex = $index) {
            <button
              type="button"
              class="hc-card"
              [class.hc-card--active]="cardIndex === 0"
              [style.border-color]="cardIndex === 0 ? accentColor : ''"
              [attr.aria-current]="cardIndex === 0 ? 'true' : null"
              [attr.aria-label]="'Show ' + (s.slide.caption || 'slide ' + (s.i + 1))"
              (click)="goTo(s.i)"
            >
              <img class="hc-card-img" [src]="s.slide.url" [alt]="s.slide.caption || ''" loading="lazy" />
              <span class="hc-card-shade" aria-hidden="true"></span>
              @if (s.slide.caption) {
                <span class="hc-card-title">{{ s.slide.caption }}</span>
              }
            </button>
          }
        </div>

        <!-- Footer: controls + progress -->
        <div class="hc-footer">
          <div class="hc-controls" aria-label="Carousel controls">
            <button type="button" class="hc-round" aria-label="Previous slide" (click)="prev()">
              <span aria-hidden="true">&larr;</span>
            </button>
            <button type="button" class="hc-round" aria-label="Next slide" (click)="next()">
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>

          <div class="hc-progress" aria-hidden="true">
            <span class="hc-progress-line">
              <span class="hc-progress-fill" [style.width.%]="progressPercent()" [style.background]="accentColor"></span>
            </span>
            <span class="hc-count" [style.color]="accentColor">{{ pad(active() + 1) }}</span>
            <span class="hc-count-sep">/</span>
            <span class="hc-count-total">{{ pad(slidesInternal.length) }}</span>
          </div>
        </div>
      </section>
    }
  `,
  styleUrl: './hero-carousel.component.scss',
})
export class HeroCarouselComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() slides: CarouselSlide[] = [];
  @Input() accentColor = '#f59e0b';
  @Input() primaryColor = '#1e3a8a';
  @Input() autoplayMs = 2000;

  /** Stable internal copy so template method-call inputs don't cause resets. */
  protected slidesInternal: CarouselSlide[] = [];
  protected readonly active = signal(0);
  protected readonly transitioning = signal(false);

  @ViewChild('carouselRoot') rootEl?: ElementRef<HTMLElement>;

  private viewReady = false;
  private hovering = false;
  private timer?: ReturnType<typeof setInterval>;
  private transitionTimer?: ReturnType<typeof setTimeout>;
  private lastKey = '';
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['slides']) {
      const incoming = this.slides ?? [];
      const key = incoming.map((s) => s.url).join('|');
      if (key !== this.lastKey) {
        this.lastKey = key;
        this.slidesInternal = [...incoming];
        this.active.set(0);
        this.restartAutoplay();
      }
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.restartAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
  }

  current(): CarouselSlide {
    return this.slidesInternal[this.active()] ?? { url: '', caption: '' };
  }

  /** Up to 3 upcoming slides (wrapping) for the side card strip. */
  visibleSlides(): { slide: CarouselSlide; i: number }[] {
    const n = this.slidesInternal.length;
    if (n === 0) return [];
    const count = Math.min(3, n);
    return Array.from({ length: count }, (_, offset) => {
      const i = (this.active() + offset) % n;
      return { slide: this.slidesInternal[i], i };
    });
  }

  progressPercent(): number {
    const n = this.slidesInternal.length;
    return n === 0 ? 0 : ((this.active() + 1) / n) * 100;
  }

  pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  goTo(i: number): void {
    if (i === this.active() || i < 0 || i >= this.slidesInternal.length) return;
    this.setActive(i);
  }

  next(): void {
    if (this.slidesInternal.length === 0) return;
    this.setActive((this.active() + 1) % this.slidesInternal.length);
  }

  prev(): void {
    if (this.slidesInternal.length === 0) return;
    this.setActive((this.active() - 1 + this.slidesInternal.length) % this.slidesInternal.length);
  }

  onHover(isHover: boolean): void {
    this.hovering = isHover;
    if (isHover) this.stopAutoplay();
    else this.restartAutoplay();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    }
  }

  private setActive(i: number): void {
    this.transitioning.set(true);
    this.active.set(i);
    this.cdr.detectChanges();
    this.restartAutoplay();

    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionTimer = setTimeout(() => {
      this.transitioning.set(false);
      this.cdr.detectChanges();
    }, 650);
  }

  private restartAutoplay(): void {
    this.stopAutoplay();
    if (!this.viewReady || this.hovering || this.slidesInternal.length <= 1) return;
    if (typeof window === 'undefined') return;
    this.timer = setInterval(() => this.next(), this.autoplayMs);
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
