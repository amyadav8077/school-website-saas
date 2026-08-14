import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface SchoolBranch {
  id: number;
  name: string;
  state: string;
  city: string;
  address: string;
  contactEmail: string;
  phone: string;
}

@Component({
  selector: 'app-school-branches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ds-card ds-reveal sb-card">
      
      <div class="sb-header">
        <span [style.color]="accentColor" class="sb-eyebrow">Our Network</span>
        <h3 [style.color]="primaryColor" class="ds-heading sb-title">Branches Across the Country</h3>
        <p class="sb-subtitle">Select your state and city below to find a local academic campus with championship mentoring near you.</p>
      </div>

      <!-- State & City Dropdowns Bar -->
      <div class="sb-filter-bar">
        <div>
          <label class="sb-label">Select State</label>
          <select [(ngModel)]="selectedState" (change)="onStateSelected()" class="sb-select">
            <option value="All">-- All States --</option>
            @for (st of states(); track st) {
              <option [value]="st">{{ st }}</option>
            }
          </select>
        </div>
        <div>
          <label class="sb-label">Select City</label>
          <select [(ngModel)]="selectedCity" (change)="onCitySelected()" [disabled]="cities().length === 0" class="sb-select">
            <option value="All">-- All Cities --</option>
            @for (ct of cities(); track ct) {
              <option [value]="ct">{{ ct }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Branches List Grid -->
      @if (filteredBranches().length === 0) {
        <p class="sb-empty">No active branches registered matching this criteria.</p>
      } @else {
        <div class="mobile-grid-1 sb-grid">
          @for (br of filteredBranches(); track br.id) {
            <div class="ds-card ds-card-hover sb-branch-card">
              <div>
                <div class="sb-branch-header">
                  <strong [style.color]="primaryColor" class="sb-branch-name">{{ br.name }}</strong>
                  <span [style.background]="accentColor" class="sb-branch-badge">
                    {{ br.city }}
                  </span>
                </div>
                
                <div class="sb-info-list">
                  <div class="sb-info-row">
                    <span>📍</span>
                    <span><strong>Address:</strong> {{ br.address }}</span>
                  </div>
                  <div class="sb-info-row-center">
                    <span>📞</span>
                    <span><strong>Phone:</strong> {{ br.phone }}</span>
                  </div>
                  <div class="sb-info-row-center">
                    <span>✉️</span>
                    <span><strong>Email:</strong> {{ br.contactEmail }}</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

    </div>
  `,
  styleUrl: './school-branches.component.scss'
})
export class SchoolBranchesComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() primaryColor!: string;
  @Input() accentColor!: string;

  protected readonly branches = signal<SchoolBranch[]>([]);
  protected readonly filteredBranches = signal<SchoolBranch[]>([]);
  
  protected readonly states = signal<string[]>([]);
  protected readonly cities = signal<string[]>([]);

  selectedState: string = 'All';
  selectedCity: string = 'All';

  private readonly http = inject(HttpClient);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantId'] && this.tenantId) {
      this.fetchBranches();
    }
  }

  fetchBranches() {
    this.http.get<SchoolBranch[]>(`http://localhost:8080/api/sites/${this.tenantId}/branches`)
      .subscribe({
        next: (data) => {
          this.branches.set(data);
          this.filteredBranches.set(data);
          this.selectedState = 'All';
          this.selectedCity = 'All';

          // Extract unique states
          const uniqueStates = Array.from(new Set(data.map(b => b.state))).sort();
          this.states.set(uniqueStates);
          this.cities.set([]);
        },
        error: (err) => console.error(err)
      });
  }

  onStateSelected() {
    this.selectedCity = 'All';
    this.applyFilters();

    if (this.selectedState === 'All') {
      this.cities.set([]);
    } else {
      // Extract cities unique to the selected state
      const matchingCities = Array.from(new Set(
        this.branches()
          .filter(b => b.state === this.selectedState)
          .map(b => b.city)
      )).sort();
      this.cities.set(matchingCities);
    }
  }

  onCitySelected() {
    this.applyFilters();
  }

  applyFilters() {
    let result = this.branches();

    if (this.selectedState !== 'All') {
      result = result.filter(b => b.state === this.selectedState);
    }
    if (this.selectedCity !== 'All') {
      result = result.filter(b => b.city === this.selectedCity);
    }

    this.filteredBranches.set(result);
  }
}
