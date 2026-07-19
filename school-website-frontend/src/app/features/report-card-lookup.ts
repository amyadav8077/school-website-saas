import { Component, Input, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface StudentGrade {
  id: number;
  studentName: string;
  subjectName: string;
  term: string;
  grade: string;
  remarks: string;
}

@Component({
  selector: 'app-report-card-lookup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); max-width: 850px; margin: 2rem auto;">
      <h3 [style.color]="primaryColor" style="font-size: 1.5rem; font-weight: 800; margin-top: 0; margin-bottom: 0.5rem; text-align: center; transition: color 0.3s;">
        Parent Academic Report Card Lookup
      </h3>
      <p style="color: #64748b; font-size: 0.9rem; text-align: center; margin-bottom: 1.5rem;">
        Search for your child's student record to view issued term results, teacher evaluations, and gradebook charts.
      </p>

      <!-- Student Record Lookup Bar -->
      <form (ngSubmit)="searchStudentGrades()" style="display: flex; gap: 0.5rem; margin-bottom: 2rem;">
        <input type="text" name="studentSearchName" [(ngModel)]="searchName" placeholder="Enter Student's Full Name (e.g. John Doe)" required
          style="flex: 1; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem; box-sizing: border-box;" />
        <button type="submit" [style.background-color]="primaryColor" style="border: 0; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 700; cursor: pointer;">
          🔍 View Report Card
        </button>
      </form>

      <!-- Search Results -->
      @if (hasSearched()) {
        <div>
          @if (grades().length === 0) {
            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 2.5rem; text-align: center; border-radius: 8px; color: #64748b;">
              <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">📊</span>
              <p style="font-size: 0.95rem; margin: 0; font-weight: 600;">No grade entries found for student: "{{ searchName }}"</p>
              <p style="font-size: 0.85rem; margin-top: 0.25rem;">Verify spelling or generate some student scores in the Admin panel above!</p>
            </div>
          } @else {
            
            <!-- Simulated Printable Report Card Ledger -->
            <div style="border: 2px solid #cbd5e1; border-radius: 8px; padding: 2rem; background: #fafafa; font-family: Cambria, Georgia, serif; box-shadow: inset 0 0 10px rgba(0,0,0,0.02);">
              
              <!-- Report Card Header -->
              <div style="text-align: center; border-bottom: 2px double #cbd5e1; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                <h4 [style.color]="primaryColor" style="font-size: 1.4rem; font-weight: 800; margin: 0; text-transform: uppercase;">Official Academic Transcript</h4>
                <p style="font-size: 0.85rem; color: #475569; margin: 0.25rem 0 0 0; font-family: sans-serif; font-weight: 600;">Academic Year: 2026-27</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; font-size: 0.9rem; font-family: sans-serif; text-align: left; margin-top: 1rem; padding: 0 0.5rem;">
                  <div>Student Name: <strong style="color: #0f172a;">{{ searchName }}</strong></div>
                  <div style="text-align: right;">Status: <strong style="color: #16a34a;">OFFICIAL RECORD</strong></div>
                </div>
              </div>

              <!-- Grades Table -->
              <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem; font-family: sans-serif; text-align: left; background: white; border: 1px solid #cbd5e1; margin-bottom: 1.5rem;">
                <thead>
                  <tr [style.background-color]="primaryColor" style="color: white;">
                    <th style="padding: 0.75rem 1rem;">Subject</th>
                    <th style="padding: 0.75rem 1rem;">Assessment Term</th>
                    <th style="padding: 0.75rem 1rem; text-align: center;">Evaluation Score</th>
                    <th style="padding: 0.75rem 1rem;">Teacher Feedback & Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  @for (g of grades(); track g.id) {
                    <tr style="border-bottom: 1px solid #cbd5e1;">
                      <td style="padding: 0.75rem 1rem; font-weight: 700; color: #0f172a;">{{ g.subjectName }}</td>
                      <td style="padding: 0.75rem 1rem; color: #475569;">{{ g.term }}</td>
                      <td style="padding: 0.75rem 1rem; text-align: center; font-weight: 800;" [style.color]="primaryColor">{{ g.grade }}</td>
                      <td style="padding: 0.75rem 1rem; color: #475569; font-size: 0.85rem; font-style: italic;">{{ g.remarks || 'No remarks recorded.' }}</td>
                    </tr>
                  }
                </tbody>
              </table>

              <!-- Certificate Footer Stamp -->
              <div style="display: flex; justify-content: space-between; align-items: flex-end; font-family: sans-serif; font-size: 0.8rem; color: #64748b; margin-top: 2rem;">
                <div>
                  <span style="display: block; width: 120px; border-bottom: 1px solid #94a3b8; margin-bottom: 0.25rem;"></span>
                  <span>Evaluated By (Class Teacher)</span>
                </div>
                <div style="text-align: right; border: 2px dashed #bbf7d0; background: #f0fdf4; color: #16a34a; padding: 0.5rem; border-radius: 4px; font-weight: 700;">
                  🏫 VERIFIED BY PORTAL TRUST
                </div>
              </div>

            </div>

          }
        </div>
      }
    </div>
  `
})
export class ReportCardLookupComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() primaryColor: string = '#1e3a8a';
  @Input() accentColor: string = '#f59e0b';
  @Input() prefilledSearchName: string = '';

  protected readonly grades = signal<StudentGrade[]>([]);
  protected readonly hasSearched = signal(false);

  searchName: string = '';

  private readonly http = inject(HttpClient);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantId'] && this.tenantId) {
      this.grades.set([]);
      this.hasSearched.set(false);
      this.searchName = '';
    }

    if (changes['prefilledSearchName'] && this.prefilledSearchName) {
      this.searchName = this.prefilledSearchName;
      this.searchStudentGrades();
    }
  }

  searchStudentGrades() {
    if (!this.searchName.trim()) return;
    this.http.get<StudentGrade[]>(`http://localhost:8080/api/sites/${this.tenantId}/grades?studentName=${this.searchName}`)
      .subscribe({
        next: (data) => {
          this.grades.set(data);
          this.hasSearched.set(true);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
}
