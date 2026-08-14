import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';

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
      <div class="hc" (mouseenter)="onHover(true)" (mouseleave)="onHover(false)">
        <!-- Main feature image -->
        <div class="hc-main">
          <div class="hc-main-bg" [style.background-image]="'url(' + current().url + ')'"></div>
          <img #mainImg class="hc-main-img" [src]="current().url" alt="" />
          <div class="hc-scrim"></div>

          <!-- Caption overlay -->
          <div class="hc-copy" #copy>
            <span class="hc-kicker" [style.color]="accentColor">Campus Highlights</span>
            <h2 class="hc-title">{{ current().caption || 'Discover Our Campus' }}</h2>
            @if (current().subtitle) {
              <p class="hc-sub">{{ current().subtitle }}</p>
            }
            <div class="hc-index">
              <span class="hc-index-cur" [style.color]="accentColor">{{ pad(active() + 1) }}</span>
              <span class="hc-index-sep"></span>
              <span class="hc-index-total">{{ pad(slidesInternal.length) }}</span>
            </div>
          </div>

          <!-- Progress bar (autoplay) -->
          <div class="hc-progress"><span #bar class="hc-progress-bar" [style.background]="accentColor"></span></div>

          <!-- Arrows -->
          <button type="button" class="hc-arrow hc-arrow-l" (click)="prev()" aria-label="Previous">‹</button>
          <button type="button" class="hc-arrow hc-arrow-r" (click)="next()" aria-label="Next">›</button>
        </div>

        <!-- Thumbnail strip -->
        <div class="hc-thumbs">
          @for (s of slidesInternal; track $index; let i = $index) {
            <button type="button" class="hc-thumb" [class.is-active]="i === active()"
              (click)="goTo(i)" [style.border-color]="i === active() ? accentColor : 'transparent'">
              <img [src]="s.url" alt="" />
              <span class="hc-thumb-num">{{ pad(i + 1) }}</span>
            </button>
          }
        </div>
      </div>
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

  @ViewChild('copy') copyEl?: ElementRef<HTMLElement>;
  @ViewChild('mainImg') mainImgEl?: ElementRef<HTMLImageElement>;
  @ViewChild('bar') barEl?: ElementRef<HTMLElement>;

  private viewReady = false;
  private hovering = false;
  private timer?: ReturnType<typeof setTimeout>;
  private barTween?: gsap.core.Tween;
  private lastKey = '';
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['slides']) {
      const incoming = this.slides ?? [];
      const key = incoming.map((s) => s.url).join('|');
      // Only rebuild + reset when the slide set actually changed (not just a new array ref)
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
    this.animateIn();
    this.restartAutoplay();
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.barTween?.kill();
  }

  current(): CarouselSlide {
    return this.slidesInternal[this.active()] ?? { url: '', caption: '' };
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
    if (isHover) {
      this.clearTimer();
      this.barTween?.pause();
    } else {
      this.restartAutoplay();
    }
  }

  private setActive(i: number): void {
    this.active.set(i);
    this.cdr.detectChanges();
    this.animateIn();
    this.restartAutoplay();
  }

  private restartAutoplay(): void {
    this.clearTimer();
    if (!this.viewReady || this.hovering || this.slidesInternal.length <= 1) return;
    if (typeof window === 'undefined') return;

    // Animate progress bar over the autoplay duration, then advance.
    const bar = this.barEl?.nativeElement;
    if (bar) {
      this.barTween?.kill();
      this.barTween = gsap.fromTo(
        bar,
        { width: '0%' },
        { width: '100%', duration: this.autoplayMs / 1000, ease: 'none', overwrite: true }
      );
    }
    this.timer = setTimeout(() => this.next(), this.autoplayMs);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private animateIn(): void {
    if (!this.viewReady || typeof window === 'undefined') return;

    const img = this.mainImgEl?.nativeElement;
    if (img) {
      gsap.fromTo(img, { opacity: 0.3, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out', overwrite: true });
    }

    const copy = this.copyEl?.nativeElement;
    if (copy) {
      const targets = copy.querySelectorAll('.hc-kicker, .hc-title, .hc-sub, .hc-index');
      gsap.fromTo(
        targets,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.07, overwrite: true }
      );
    }
  }
}
