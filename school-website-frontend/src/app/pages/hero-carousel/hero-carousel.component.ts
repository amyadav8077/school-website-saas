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
  styles: [`
    :host { display: block; }
    * { box-sizing: border-box; }

    .hc { width: 100%; background: #0b1220; font-family: 'Inter', system-ui, sans-serif; padding: 1rem; }

    .hc-main {
      position: relative; width: 100%; height: 420px; border-radius: 18px; overflow: hidden;
      background: #0b1220; box-shadow: 0 20px 50px -20px rgba(0,0,0,0.6);
    }
    .hc-main-img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .hc-scrim {
      position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(90deg, rgba(6,11,22,0.85) 0%, rgba(6,11,22,0.45) 40%, rgba(6,11,22,0) 70%);
    }

    .hc-copy { position: absolute; left: 2.5rem; top: 50%; transform: translateY(-50%); max-width: 440px; color: #fff; pointer-events: none; z-index: 2; }
    .hc-kicker { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; display: block; margin-bottom: 0.6rem; }
    .hc-title { font-size: 2.3rem; font-weight: 900; line-height: 1.08; letter-spacing: -0.03em; margin: 0 0 0.75rem; text-shadow: 0 2px 20px rgba(0,0,0,0.45); }
    .hc-sub { font-size: 0.98rem; line-height: 1.55; color: rgba(255,255,255,0.88); margin: 0 0 1.2rem; }
    .hc-index { display: flex; align-items: center; gap: 0.7rem; font-weight: 800; }
    .hc-index-cur { font-size: 1.8rem; }
    .hc-index-sep { width: 40px; height: 2px; background: rgba(255,255,255,0.4); }
    .hc-index-total { font-size: 0.95rem; color: rgba(255,255,255,0.6); }

    .hc-progress { position: absolute; left: 0; right: 0; bottom: 0; height: 4px; background: rgba(255,255,255,0.15); z-index: 3; }
    .hc-progress-bar { display: block; height: 100%; width: 0; }

    .hc-arrow {
      position: absolute; top: 50%; transform: translateY(-50%); width: 46px; height: 46px; border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.4); background: rgba(15,23,42,0.4); backdrop-filter: blur(6px);
      color: #fff; font-size: 1.5rem; line-height: 1; cursor: pointer; z-index: 4;
      display: flex; align-items: center; justify-content: center; transition: background 0.2s, transform 0.15s;
    }
    .hc-arrow:hover { background: rgba(15,23,42,0.7); transform: translateY(-50%) scale(1.08); }
    .hc-arrow-l { left: 1rem; }
    .hc-arrow-r { right: 1rem; }

    .hc-thumbs { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 0.75rem; margin-top: 0.85rem; }
    .hc-thumb {
      position: relative; height: 84px; border-radius: 12px; overflow: hidden; border: 2px solid transparent;
      cursor: pointer; padding: 0; background: #000; opacity: 0.55;
      transition: opacity 0.3s ease, transform 0.25s ease, box-shadow 0.25s ease;
    }
    .hc-thumb img { width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
    .hc-thumb:hover { opacity: 0.9; transform: translateY(-3px); }
    .hc-thumb.is-active { opacity: 1; box-shadow: 0 10px 22px -8px rgba(0,0,0,0.6); }
    .hc-thumb-num { position: absolute; top: 6px; left: 8px; color: #fff; font-size: 0.7rem; font-weight: 800; text-shadow: 0 1px 4px rgba(0,0,0,0.8); pointer-events: none; }

    @media (max-width: 820px) {
      .hc-main { height: 300px; }
      .hc-copy { left: 1.25rem; max-width: 78%; }
      .hc-title { font-size: 1.5rem; }
      .hc-sub { display: none; }
      .hc-thumb { height: 56px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .hc-main-img { animation: none; }
    }
  `],
})
export class HeroCarouselComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() slides: CarouselSlide[] = [];
  @Input() accentColor = '#f59e0b';
  @Input() primaryColor = '#1e3a8a';
  @Input() autoplayMs = 4500;

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
