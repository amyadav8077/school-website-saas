import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface BoardResult {
  id: number;
  classLevel: string; // "CLASS 10", "CLASS 12"
  year: number;
  registeredStudents: number;
  passedStudents: number;
  passPercentage: number;
  remarks: string;
}

@Component({
  selector: 'app-public-disclosures',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ds-card ds-reveal pd-card">
      
      <!-- Top CBSE Circular Seal header -->
      <div class="pd-seal">
        <span class="pd-seal-icon">📜</span>
        <div>
          <strong class="pd-seal-title">CBSE Mandatory Public Disclosure (Appendix IX)</strong>
          <span class="pd-seal-text">
            As per CBSE Circular No. 09/2021 Dated 21.05.2021, schools are directed to display essential certificates, fee structures, management rosters, and board results under a prominent Homepage portal to maintain absolute institutional transparency.
          </span>
        </div>
      </div>

      <!-- Section A: General Info -->
      <h3 [style.color]="primaryColor" class="ds-heading pd-heading-first">
        A. General Institutional Information
      </h3>
      <div class="pd-info-grid">
        <div class="pd-info-cell">🏫 <strong>Name of School:</strong> {{ tenantName }}</div>
        <div class="pd-info-cell">🔑 <strong>Affiliation Number:</strong> 2130092 (Verified)</div>
        <div class="pd-info-cell">🔖 <strong>School Code:</strong> 54086 (Verified)</div>
        <div class="pd-info-cell">📍 <strong>Address with Pin Code:</strong> Dwarka, New Delhi - 110075</div>
        <div class="pd-info-cell">👨‍🏫 <strong>Principal Name & Qualification:</strong> Dr. Arthur Pendragon, Ph.D.</div>
        <div class="pd-info-cell">✉️ <strong>School Email ID:</strong> info@schoolsaas.com</div>
      </div>

      <!-- Section B: Documents & Certificates -->
      <h3 [style.color]="primaryColor" class="ds-heading pd-heading">
        B. Mandatory Self-Attested Documents
      </h3>
      <div class="pd-table-wrap">
        <table class="pd-table">
          <thead>
            <tr class="pd-thead-row">
              <th class="pd-th">S.No</th>
              <th class="pd-th">Compliance Document Description</th>
              <th class="pd-th-right">Official Link (Self-Attested)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="pd-row">
              <td class="pd-td-sno">1</td>
              <td class="pd-td-desc">Copies of Affiliation Upgradation & Recent Extension Letter</td>
              <td class="pd-td-link"><a href="#" [style.color]="primaryColor" class="pd-link">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr class="pd-row">
              <td class="pd-td-sno">2</td>
              <td class="pd-td-desc">Copies of Societies / Trust registration / Renewal Certificate</td>
              <td class="pd-td-link"><a href="#" [style.color]="primaryColor" class="pd-link">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr class="pd-row">
              <td class="pd-td-sno">3</td>
              <td class="pd-td-desc">Copy of No Objection Certificate (NOC) issued by State Govt</td>
              <td class="pd-td-link"><a href="#" [style.color]="primaryColor" class="pd-link">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr class="pd-row">
              <td class="pd-td-sno">4</td>
              <td class="pd-td-desc">Copies of Recognition Certificate under RTE Act, 2009 & its Renewal</td>
              <td class="pd-td-link"><a href="#" [style.color]="primaryColor" class="pd-link">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr class="pd-row">
              <td class="pd-td-sno">5</td>
              <td class="pd-td-desc">Copy of Valid Building Safety Certificate (National Building Code)</td>
              <td class="pd-td-link"><a href="#" [style.color]="primaryColor" class="pd-link">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr class="pd-row">
              <td class="pd-td-sno">6</td>
              <td class="pd-td-desc">Copy of Valid Fire Safety Certificate issued by Competent Authority</td>
              <td class="pd-td-link"><a href="#" [style.color]="primaryColor" class="pd-link">📄 Download PDF (Self-Attested)</a></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section C: Results and Academics -->
      <h3 [style.color]="primaryColor" class="ds-heading pd-heading">
        C. Results & Academics Disclosures
      </h3>
      <div class="pd-table-wrap">
        <table class="pd-table">
          <thead>
            <tr class="pd-thead-row">
              <th class="pd-th">S.No</th>
              <th class="pd-th">Information Ledger Category</th>
              <th class="pd-th-right">Official Link (Self-Attested)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="pd-row">
              <td class="pd-td-sno">1</td>
              <td class="pd-td-desc">Annual Fee Structure of the School</td>
              <td class="pd-td-link"><a href="#" [style.color]="primaryColor" class="pd-link">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr class="pd-row">
              <td class="pd-td-sno">2</td>
              <td class="pd-td-desc">Annual Academic Calendar Events</td>
              <td class="pd-td-link"><a href="#" [style.color]="primaryColor" class="pd-link">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr class="pd-row">
              <td class="pd-td-sno">3</td>
              <td class="pd-td-desc">List of School Management Committee (SMC) Members</td>
              <td class="pd-td-link"><a href="#" [style.color]="primaryColor" class="pd-link">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr class="pd-row">
              <td class="pd-td-sno">4</td>
              <td class="pd-td-desc">List of Parents Teachers Association (PTA) Members</td>
              <td class="pd-td-link"><a href="#" [style.color]="primaryColor" class="pd-link">📄 Download PDF (Self-Attested)</a></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section D: 3-Year Board Exam Results -->
      <h3 [style.color]="primaryColor" class="ds-heading pd-heading">
        D. Last Three-Year Board Examination Results
      </h3>

      <!-- Class 10 Table -->
      <h4 class="pd-subheading">👉 Result - Class X (Secondary School Certificate)</h4>
      <div class="pd-table-wrap-results">
        <table class="pd-table-white">
          <thead>
            <tr class="pd-thead-row">
              <th class="pd-th">S.No</th>
              <th class="pd-th">Year</th>
              <th class="pd-th-center">Registered Candidates</th>
              <th class="pd-th-center">Passed Candidates</th>
              <th class="pd-th-center">Pass Percentage</th>
              <th class="pd-th">Remarks</th>
            </tr>
          </thead>
          <tbody>
            @for (r of getClassXResults(); track r.id; let idx = $index) {
              <tr class="pd-row">
                <td class="pd-td-sno">{{ idx + 1 }}</td>
                <td class="pd-td-year">{{ r.year }}</td>
                <td class="pd-td-center">{{ r.registeredStudents }}</td>
                <td class="pd-td-center">{{ r.passedStudents }}</td>
                <td class="pd-td-pct">{{ r.passPercentage }}%</td>
                <td class="pd-td-remarks">{{ r.remarks }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Class 12 Table -->
      <h4 class="pd-subheading">👉 Result - Class XII (Senior Secondary Certificate)</h4>
      <div class="pd-table-wrap-results-last">
        <table class="pd-table-white">
          <thead>
            <tr class="pd-thead-row">
              <th class="pd-th">S.No</th>
              <th class="pd-th">Year</th>
              <th class="pd-th-center">Registered Candidates</th>
              <th class="pd-th-center">Passed Candidates</th>
              <th class="pd-th-center">Pass Percentage</th>
              <th class="pd-th">Remarks</th>
            </tr>
          </thead>
          <tbody>
            @for (r of getClassXIIResults(); track r.id; let idx = $index) {
              <tr class="pd-row">
                <td class="pd-td-sno">{{ idx + 1 }}</td>
                <td class="pd-td-year">{{ r.year }}</td>
                <td class="pd-td-center">{{ r.registeredStudents }}</td>
                <td class="pd-td-center">{{ r.passedStudents }}</td>
                <td class="pd-td-pct">{{ r.passPercentage }}%</td>
                <td class="pd-td-remarks">{{ r.remarks }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>
  `,
  styleUrl: './public-disclosures.component.scss'
})
export class PublicDisclosuresComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() tenantName!: string;
  @Input() primaryColor!: string;
  @Input() accentColor!: string;

  protected readonly boardResults = signal<BoardResult[]>([]);

  private readonly http = inject(HttpClient);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantId'] && this.tenantId) {
      this.fetchBoardResults();
    }
  }

  fetchBoardResults() {
    this.http.get<BoardResult[]>(`http://localhost:8080/api/sites/${this.tenantId}/board-results`)
      .subscribe({
        next: (data) => this.boardResults.set(data),
        error: (err) => console.error(err)
      });
  }

  getClassXResults(): BoardResult[] {
    return this.boardResults().filter(r => r.classLevel.toUpperCase() === 'CLASS 10');
  }

  getClassXIIResults(): BoardResult[] {
    return this.boardResults().filter(r => r.classLevel.toUpperCase() === 'CLASS 12');
  }
}
