import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';

@Directive({
  selector: '[dsScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input('dsScrollReveal') delay: number | string = 0;

  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const node = this.el.nativeElement as HTMLElement;
    node.classList.add('ds-sr');
    const delayMs = Number(this.delay) || 0;
    if (delayMs) {
      node.style.transitionDelay = `${delayMs}ms`;
    }

    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('ds-sr-in');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            node.classList.add('ds-sr-in');
            this.observer?.unobserve(node);
          }
        });
      },
      { threshold: 0.12 }
    );
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
