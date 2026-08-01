import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface StudentAchiever {
  id: number;
  name: string;
  score: string;
  courseName: string;
  testimonialText: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-achievers-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (achievers().length > 0) {
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 2.5rem; max-width: 1100px; margin: 3rem auto; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <div style="text-align: center; margin-bottom: 2rem;">
          <span [style.color]="accentColor" style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.5rem;">Our Achievers</span>
          <h3 [style.color]="primaryColor" style="font-size: 1.75rem; font-weight: 800; margin: 0; letter-spacing: -0.02em;">Showcasing Success & Academic Ranks</h3>
        </div>

        <!-- Slider Card -->
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 2rem; position: relative; min-height: 180px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
          
          <!-- Slider Content -->
          <div style="display: flex; gap: 1.5rem; align-items: flex-start; flex-wrap: wrap;">
            <div [style.background-color]="primaryColor" style="width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: white; shrink: 0; flex-shrink: 0;">
              🎓
            </div>
            <div>
              <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem; flex-wrap: wrap;">
                <strong style="font-size: 1.15rem; color: #0f172a;">{{ activeAchiever().name }}</strong>
                <span [style.background]="accentColor" style="color: #0f172a; font-size: 0.75rem; padding: 0.15rem 0.50rem; border-radius: 9999px; font-weight: 800; text-transform: uppercase;">
                  {{ activeAchiever().score }}
                </span>
              </div>
              <span style="font-size: 0.8rem; color: #64748b; font-weight: 600; display: block; margin-bottom: 0.75rem;">
                Program: {{ activeAchiever().courseName }}
              </span>
              <p style="color: #475569; font-size: 0.95rem; line-height: 1.6; font-style: italic; margin: 0;">
                "{{ activeAchiever().testimonialText }}"
              </p>
            </div>
          </div>

          <!-- Slider Controls -->
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; border-top: 1px solid #f1f5f9; padding-top: 1rem;">
            <button (click)="prevSlide()" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
              ◀
            </button>
            <button (click)="nextSlide()" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid #cbd5e1; background: white; cursor: pointer; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
              ▶
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class AchieversCarouselComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() primaryColor!: string;
  @Input() accentColor!: string;

  protected readonly achievers = signal<StudentAchiever[]>([]);
  protected readonly activeIdx = signal<number>(0);

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantId'] && this.tenantId) {
      this.fetchAchievers();
    }
  }

  fetchAchievers() {
    this.http.get<StudentAchiever[]>(`http://localhost:8080/api/sites/${this.tenantId}/achievers`)
      .subscribe({
        next: (data) => {
          this.achievers.set(data);
          this.activeIdx.set(0);
        },
        error: (err) => console.error(err)
      });
  }

  activeAchiever(): StudentAchiever {
    return this.achievers()[this.activeIdx()];
  }

  nextSlide() {
    const next = (this.activeIdx() + 1) % this.achievers().length;
    this.activeIdx.set(next);
  }

  prevSlide() {
    const prev = (this.activeIdx() - 1 + this.achievers().length) % this.achievers().length;
    this.activeIdx.set(prev);
  }
}
