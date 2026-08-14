import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

export interface EnrichmentActivity {
  id: number;
  title: string;
  type: string; // SPORTS, UNIFORMS, EXPO
  description: string;
  details?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-campus-enrichment',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  template: `
    @if (activities().length > 0) {
      <div [dsScrollReveal]="0" class="ds-card ce-card">
        
        <div class="ce-header">
          <span [style.color]="accentColor" class="ce-eyebrow">Co-Curriculars & Parity</span>
          <h3 [style.color]="primaryColor" class="ds-heading ce-title">Holistic Development & Student Welfare</h3>
          <p class="ce-intro">At our academy, student growth extends far beyond classrooms. Explore our flagship fitness leagues, uniform parities, and STEM arenas.</p>
        </div>

        <!-- Segment Tab Switcher -->
        <div class="ce-tabs">
          <button (click)="activeType.set('SPORTS')" 
            class="ce-tab"
            [style.background-color]="activeType() === 'SPORTS' ? primaryColor : 'white'"
            [style.color]="activeType() === 'SPORTS' ? 'white' : '#475569'"
            [style.border-color]="activeType() === 'SPORTS' ? primaryColor : '#cbd5e1'">
            🏀 nSports Academy
          </button>
          <button (click)="activeType.set('UNIFORMS')" 
            class="ce-tab"
            [style.background-color]="activeType() === 'UNIFORMS' ? primaryColor : 'white'"
            [style.color]="activeType() === 'UNIFORMS' ? 'white' : '#475569'"
            [style.border-color]="activeType() === 'UNIFORMS' ? primaryColor : '#cbd5e1'">
            👕 Uniform Codes
          </button>
          <button (click)="activeType.set('EXPO')" 
            class="ce-tab"
            [style.background-color]="activeType() === 'EXPO' ? primaryColor : 'white'"
            [style.color]="activeType() === 'EXPO' ? 'white' : '#475569'"
            [style.border-color]="activeType() === 'EXPO' ? primaryColor : '#cbd5e1'">
            🔬 STEM Innovations
          </button>
        </div>

        <!-- Showcase Detail Cards -->
        <div class="ce-showcase">
          @for (act of filteredActivities(); track act.id) {
            <div class="ds-card ds-lift ce-showcase-card">
              <div [style.background-color]="primaryColor" class="ce-icon">
                @if (act.type === 'SPORTS') { 🏀 }
                @else if (act.type === 'UNIFORMS') { 👕 }
                @else { 🔬 }
              </div>
              <div>
                <strong class="ce-act-title">{{ act.title }}</strong>
                <p class="ce-act-desc">{{ act.description }}</p>
                
                @if (act.details) {
                  <div class="ce-details">
                    <strong class="ce-details-title">Key Program Protocols:</strong>
                    <p class="ce-details-text">• {{ act.details }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>

      </div>
    }
  `,
  styleUrl: './campus-enrichment.component.scss'
})
export class CampusEnrichmentComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() primaryColor!: string;
  @Input() accentColor!: string;

  protected readonly activities = signal<EnrichmentActivity[]>([]);
  protected readonly filteredActivities = signal<EnrichmentActivity[]>([]);
  
  protected readonly activeType = signal<string>('SPORTS');

  private readonly http = inject(HttpClient);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantId'] && this.tenantId) {
      this.fetchActivities();
    }
  }

  fetchActivities() {
    this.http.get<EnrichmentActivity[]>(`http://localhost:8080/api/sites/${this.tenantId}/enrichment`)
      .subscribe({
        next: (data) => {
          this.activities.set(data);
          this.activeType.set('SPORTS');
          this.filterActivities();
        },
        error: (err) => console.error(err)
      });

    // Force re-filtering when activeType is changed
    this.filterActivitiesOnTypeChange();
  }

  filterActivitiesOnTypeChange() {
    // Angular 21 reaction wrapper
    setInterval(() => {
      this.filterActivities();
    }, 250);
  }

  filterActivities() {
    const filtered = this.activities().filter(a => actTypeMatches(a.type, this.activeType()));
    this.filteredBranchesAndActivities(filtered);
  }

  filteredBranchesAndActivities(filtered: EnrichmentActivity[]) {
    // Only update if changes occur to prevent loops
    if (this.filteredActivities().length !== filtered.length || 
        (filtered.length > 0 && this.filteredActivities()[0]?.id !== filtered[0]?.id)) {
      this.filteredActivities.set(filtered);
    }
  }
}

function actTypeMatches(type: string, activeType: string): boolean {
  return type === activeType;
}
