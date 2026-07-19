import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
  imports: [CommonModule],
  template: `
    @if (activities().length > 0) {
      <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 2.5rem; max-width: 1200px; margin: 3rem auto; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        
        <div style="text-align: center; margin-bottom: 2rem;">
          <span [style.color]="accentColor" style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.5rem;">Co-Curriculars & Parity</span>
          <h3 [style.color]="primaryColor" style="font-size: 1.75rem; font-weight: 800; margin: 0; letter-spacing: -0.025em; line-height: 1.2;">Holistic Development & Student Welfare</h3>
          <p style="color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; margin-bottom: 0;">At our academy, student growth extends far beyond classrooms. Explore our flagship fitness leagues, uniform parities, and STEM arenas.</p>
        </div>

        <!-- Segment Tab Switcher -->
        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem;">
          <button (click)="activeType.set('SPORTS')" 
            style="border: 1px solid #cbd5e1; padding: 0.45rem 1.25rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;"
            [style.background-color]="activeType() === 'SPORTS' ? primaryColor : 'white'"
            [style.color]="activeType() === 'SPORTS' ? 'white' : '#475569'"
            [style.border-color]="activeType() === 'SPORTS' ? primaryColor : '#cbd5e1'">
            🏀 nSports Academy
          </button>
          <button (click)="activeType.set('UNIFORMS')" 
            style="border: 1px solid #cbd5e1; padding: 0.45rem 1.25rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;"
            [style.background-color]="activeType() === 'UNIFORMS' ? primaryColor : 'white'"
            [style.color]="activeType() === 'UNIFORMS' ? 'white' : '#475569'"
            [style.border-color]="activeType() === 'UNIFORMS' ? primaryColor : '#cbd5e1'">
            👕 Uniform Codes
          </button>
          <button (click)="activeType.set('EXPO')" 
            style="border: 1px solid #cbd5e1; padding: 0.45rem 1.25rem; border-radius: 6px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;"
            [style.background-color]="activeType() === 'EXPO' ? primaryColor : 'white'"
            [style.color]="activeType() === 'EXPO' ? 'white' : '#475569'"
            [style.border-color]="activeType() === 'EXPO' ? primaryColor : '#cbd5e1'">
            🔬 STEM Innovations
          </button>
        </div>

        <!-- Showcase Detail Cards -->
        <div>
          @for (act of filteredActivities(); track act.id) {
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 1.5rem; display: flex; gap: 1.5rem; align-items: start; box-shadow: inset 0 0 10px rgba(0,0,0,0.01);">
              <div [style.background-color]="primaryColor" style="width: 50px; height: 50px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; color: white; flex-shrink: 0;">
                @if (act.type === 'SPORTS') { 🏀 }
                @else if (act.type === 'UNIFORMS') { 👕 }
                @else { 🔬 }
              </div>
              <div>
                <strong style="font-size: 1.25rem; color: #0f172a; display: block; margin-bottom: 0.5rem;">{{ act.title }}</strong>
                <p style="color: #475569; font-size: 0.95rem; line-height: 1.6; margin: 0 0 1rem 0;">{{ act.description }}</p>
                
                @if (act.details) {
                  <div style="border-top: 1px dashed #cbd5e1; padding-top: 0.75rem; margin-top: 0.75rem;">
                    <strong style="font-size: 0.85rem; color: #1e3a8a; display: block; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em;">Key Program Protocols:</strong>
                    <p style="color: #64748b; font-size: 0.85rem; margin: 0; line-height: 1.5;">• {{ act.details }}</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>

      </div>
    }
  `
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
