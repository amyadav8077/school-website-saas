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
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 2.5rem; max-width: 1200px; margin: 2rem auto; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      
      <div style="text-align: center; margin-bottom: 2rem;">
        <span [style.color]="accentColor" style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.5rem;">Our Network</span>
        <h3 [style.color]="primaryColor" style="font-size: 1.75rem; font-weight: 800; margin: 0; letter-spacing: -0.025em; line-height: 1.2;">Branches Across the Country</h3>
        <p style="color: #64748b; font-size: 0.9rem; margin-top: 0.5rem; margin-bottom: 0;">Select your state and city below to find a local academic campus with championship mentoring near you.</p>
      </div>

      <!-- State & City Dropdowns Bar -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2.5rem; background: #f8fafc; padding: 1.25rem; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Select State</label>
          <select [(ngModel)]="selectedState" (change)="onStateSelected()" style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; background: white;">
            <option value="All">-- All States --</option>
            @for (st of states(); track st) {
              <option [value]="st">{{ st }}</option>
            }
          </select>
        </div>
        <div>
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Select City</label>
          <select [(ngModel)]="selectedCity" (change)="onCitySelected()" [disabled]="cities().length === 0" style="width: 100%; padding: 0.65rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; background: white;">
            <option value="All">-- All Cities --</option>
            @for (ct of cities(); track ct) {
              <option [value]="ct">{{ ct }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Branches List Grid -->
      @if (filteredBranches().length === 0) {
        <p style="text-align: center; color: #64748b; font-style: italic;">No active branches registered matching this criteria.</p>
      } @else {
        <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
          @for (br of filteredBranches(); track br.id) {
            <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 1.5rem; background: white; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 6px rgba(0,0,0,0.02); hover: box-shadow: 0 8px 12px rgba(0,0,0,0.04); transition: all 0.2s;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.5rem;">
                  <strong [style.color]="primaryColor" style="font-size: 1.1rem;">{{ br.name }}</strong>
                  <span [style.background]="accentColor" style="color: #0f172a; font-size: 0.75rem; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 700; text-transform: uppercase;">
                    {{ br.city }}
                  </span>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.85rem; color: #475569; line-height: 1.5;">
                  <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                    <span>📍</span>
                    <span><strong>Address:</strong> {{ br.address }}</span>
                  </div>
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <span>📞</span>
                    <span><strong>Phone:</strong> {{ br.phone }}</span>
                  </div>
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
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
  `
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
