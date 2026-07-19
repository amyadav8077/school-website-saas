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
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 2.5rem; max-width: 1200px; margin: 2rem auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
      
      <!-- Top CBSE Circular Seal header -->
      <div style="border: 2px solid #b91c1c; background: #fffbeb; padding: 1.5rem; border-radius: 8px; margin-bottom: 2.5rem; display: flex; gap: 1.5rem; align-items: center;">
        <span style="font-size: 3rem; line-height: 1;">📜</span>
        <div>
          <strong style="color: #b91c1c; font-size: 1.1rem; display: block; margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em;">CBSE Mandatory Public Disclosure (Appendix IX)</strong>
          <span style="font-size: 0.85rem; color: #475569; display: block; line-height: 1.4;">
            As per CBSE Circular No. 09/2021 Dated 21.05.2021, schools are directed to display essential certificates, fee structures, management rosters, and board results under a prominent Homepage portal to maintain absolute institutional transparency.
          </span>
        </div>
      </div>

      <!-- Section A: General Info -->
      <h3 [style.color]="primaryColor" style="font-size: 1.3rem; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 0; margin-bottom: 1rem; text-transform: uppercase;">
        A. General Institutional Information
      </h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2.5rem; font-size: 0.9rem; color: #475569;">
        <div style="background: #f8fafc; padding: 0.75rem 1rem; border-radius: 4px;">🏫 <strong>Name of School:</strong> {{ tenantName }}</div>
        <div style="background: #f8fafc; padding: 0.75rem 1rem; border-radius: 4px;">🔑 <strong>Affiliation Number:</strong> 2130092 (Verified)</div>
        <div style="background: #f8fafc; padding: 0.75rem 1rem; border-radius: 4px;">🔖 <strong>School Code:</strong> 54086 (Verified)</div>
        <div style="background: #f8fafc; padding: 0.75rem 1rem; border-radius: 4px;">📍 <strong>Address with Pin Code:</strong> Dwarka, New Delhi - 110075</div>
        <div style="background: #f8fafc; padding: 0.75rem 1rem; border-radius: 4px;">👨‍🏫 <strong>Principal Name & Qualification:</strong> Dr. Arthur Pendragon, Ph.D.</div>
        <div style="background: #f8fafc; padding: 0.75rem 1rem; border-radius: 4px;">✉️ <strong>School Email ID:</strong> info@schoolsaas.com</div>
      </div>

      <!-- Section B: Documents & Certificates -->
      <h3 [style.color]="primaryColor" style="font-size: 1.3rem; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem; text-transform: uppercase;">
        B. Mandatory Self-Attested Documents
      </h3>
      <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 2.5rem;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: 700;">
              <th style="padding: 0.75rem 1rem;">S.No</th>
              <th style="padding: 0.75rem 1rem;">Compliance Document Description</th>
              <th style="padding: 0.75rem 1rem; text-align: right;">Official Link (Self-Attested)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">1</td>
              <td style="padding: 0.75rem 1rem; color: #0f172a; font-weight: 600;">Copies of Affiliation Upgradation & Recent Extension Letter</td>
              <td style="padding: 0.75rem 1rem; text-align: right;"><a href="#" [style.color]="primaryColor" style="font-weight: 700; text-decoration: none;">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">2</td>
              <td style="padding: 0.75rem 1rem; color: #0f172a; font-weight: 600;">Copies of Societies / Trust registration / Renewal Certificate</td>
              <td style="padding: 0.75rem 1rem; text-align: right;"><a href="#" [style.color]="primaryColor" style="font-weight: 700; text-decoration: none;">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">3</td>
              <td style="padding: 0.75rem 1rem; color: #0f172a; font-weight: 600;">Copy of No Objection Certificate (NOC) issued by State Govt</td>
              <td style="padding: 0.75rem 1rem; text-align: right;"><a href="#" [style.color]="primaryColor" style="font-weight: 700; text-decoration: none;">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">4</td>
              <td style="padding: 0.75rem 1rem; color: #0f172a; font-weight: 600;">Copies of Recognition Certificate under RTE Act, 2009 & its Renewal</td>
              <td style="padding: 0.75rem 1rem; text-align: right;"><a href="#" [style.color]="primaryColor" style="font-weight: 700; text-decoration: none;">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">5</td>
              <td style="padding: 0.75rem 1rem; color: #0f172a; font-weight: 600;">Copy of Valid Building Safety Certificate (National Building Code)</td>
              <td style="padding: 0.75rem 1rem; text-align: right;"><a href="#" [style.color]="primaryColor" style="font-weight: 700; text-decoration: none;">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">6</td>
              <td style="padding: 0.75rem 1rem; color: #0f172a; font-weight: 600;">Copy of Valid Fire Safety Certificate issued by Competent Authority</td>
              <td style="padding: 0.75rem 1rem; text-align: right;"><a href="#" [style.color]="primaryColor" style="font-weight: 700; text-decoration: none;">📄 Download PDF (Self-Attested)</a></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section C: Results and Academics -->
      <h3 [style.color]="primaryColor" style="font-size: 1.3rem; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem; text-transform: uppercase;">
        C. Results & Academics Disclosures
      </h3>
      <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 2.5rem;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: 700;">
              <th style="padding: 0.75rem 1rem;">S.No</th>
              <th style="padding: 0.75rem 1rem;">Information Ledger Category</th>
              <th style="padding: 0.75rem 1rem; text-align: right;">Official Link (Self-Attested)</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">1</td>
              <td style="padding: 0.75rem 1rem; color: #0f172a; font-weight: 600;">Annual Fee Structure of the School</td>
              <td style="padding: 0.75rem 1rem; text-align: right;"><a href="#" [style.color]="primaryColor" style="font-weight: 700; text-decoration: none;">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">2</td>
              <td style="padding: 0.75rem 1rem; color: #0f172a; font-weight: 600;">Annual Academic Calendar Events</td>
              <td style="padding: 0.75rem 1rem; text-align: right;"><a href="#" [style.color]="primaryColor" style="font-weight: 700; text-decoration: none;">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">3</td>
              <td style="padding: 0.75rem 1rem; color: #0f172a; font-weight: 600;">List of School Management Committee (SMC) Members</td>
              <td style="padding: 0.75rem 1rem; text-align: right;"><a href="#" [style.color]="primaryColor" style="font-weight: 700; text-decoration: none;">📄 Download PDF (Self-Attested)</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">4</td>
              <td style="padding: 0.75rem 1rem; color: #0f172a; font-weight: 600;">List of Parents Teachers Association (PTA) Members</td>
              <td style="padding: 0.75rem 1rem; text-align: right;"><a href="#" [style.color]="primaryColor" style="font-weight: 700; text-decoration: none;">📄 Download PDF (Self-Attested)</a></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section D: 3-Year Board Exam Results -->
      <h3 [style.color]="primaryColor" style="font-size: 1.3rem; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1rem; text-transform: uppercase;">
        D. Last Three-Year Board Examination Results
      </h3>

      <!-- Class 10 Table -->
      <h4 style="color: #0f172a; font-size: 1rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.75rem;">👉 Result - Class X (Secondary School Certificate)</h4>
      <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 2rem;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; background: white;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: 700;">
              <th style="padding: 0.75rem 1rem;">S.No</th>
              <th style="padding: 0.75rem 1rem;">Year</th>
              <th style="padding: 0.75rem 1rem; text-align: center;">Registered Candidates</th>
              <th style="padding: 0.75rem 1rem; text-align: center;">Passed Candidates</th>
              <th style="padding: 0.75rem 1rem; text-align: center;">Pass Percentage</th>
              <th style="padding: 0.75rem 1rem;">Remarks</th>
            </tr>
          </thead>
          <tbody>
            @for (r of getClassXResults(); track r.id; let idx = $index) {
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">{{ idx + 1 }}</td>
                <td style="padding: 0.75rem 1rem; font-weight: 600; color: #0f172a;">{{ r.year }}</td>
                <td style="padding: 0.75rem 1rem; text-align: center;">{{ r.registeredStudents }}</td>
                <td style="padding: 0.75rem 1rem; text-align: center;">{{ r.passedStudents }}</td>
                <td style="padding: 0.75rem 1rem; text-align: center; font-weight: 700; color: #16a34a;">{{ r.passPercentage }}%</td>
                <td style="padding: 0.75rem 1rem; color: #475569; font-style: italic;">{{ r.remarks }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Class 12 Table -->
      <h4 style="color: #0f172a; font-size: 1rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.75rem;">👉 Result - Class XII (Senior Secondary Certificate)</h4>
      <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 1rem;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; background: white;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: 700;">
              <th style="padding: 0.75rem 1rem;">S.No</th>
              <th style="padding: 0.75rem 1rem;">Year</th>
              <th style="padding: 0.75rem 1rem; text-align: center;">Registered Candidates</th>
              <th style="padding: 0.75rem 1rem; text-align: center;">Passed Candidates</th>
              <th style="padding: 0.75rem 1rem; text-align: center;">Pass Percentage</th>
              <th style="padding: 0.75rem 1rem;">Remarks</th>
            </tr>
          </thead>
          <tbody>
            @for (r of getClassXIIResults(); track r.id; let idx = $index) {
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">{{ idx + 1 }}</td>
                <td style="padding: 0.75rem 1rem; font-weight: 600; color: #0f172a;">{{ r.year }}</td>
                <td style="padding: 0.75rem 1rem; text-align: center;">{{ r.registeredStudents }}</td>
                <td style="padding: 0.75rem 1rem; text-align: center;">{{ r.passedStudents }}</td>
                <td style="padding: 0.75rem 1rem; text-align: center; font-weight: 700; color: #16a34a;">{{ r.passPercentage }}%</td>
                <td style="padding: 0.75rem 1rem; color: #475569; font-style: italic;">{{ r.remarks }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

    </div>
  `
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
