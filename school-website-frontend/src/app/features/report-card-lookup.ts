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
  admissionNo?: string;
  classLevel?: string;
  section?: string;
  fatherName?: string;
  aadharNo?: string;
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
      <form (ngSubmit)="searchStudentGrades()" style="display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #cbd5e1;">
        <div style="flex: 1; min-width: 150px;">
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Select Class</label>
          <select name="searchClass" [(ngModel)]="searchClass" required style="width: 100%; padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; background: white; font-weight: 600;">
            <option value="Pre-Nursery">Pre-Nursery</option>
            <option value="Nursery">Nursery</option>
            <option value="LKG">LKG</option>
            <option value="UKG">UKG</option>
            <option value="1st">1st Grade</option>
            <option value="2nd">2nd Grade</option>
            <option value="3rd">3rd Grade</option>
            <option value="4th">4th Grade</option>
            <option value="5th">5th Grade</option>
            <option value="6th">6th Grade</option>
            <option value="7th">7th Grade</option>
            <option value="8th">8th Grade</option>
            <option value="9th">9th Grade</option>
            <option value="10th">10th Grade</option>
            <option value="11th">11th Grade</option>
            <option value="12th">12th Grade</option>
          </select>
        </div>
        <div style="flex: 1; min-width: 100px;">
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Select Section</label>
          <select name="searchSection" [(ngModel)]="searchSection" required style="width: 100%; padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; background: white; font-weight: 600;">
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
        </div>
        <div style="flex: 2; min-width: 200px;">
          <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.35rem;">Student Name (Optional)</label>
          <input type="text" name="studentSearchName" [(ngModel)]="searchName" placeholder="Enter name or leave empty to list all" 
            style="width: 100%; padding: 0.7rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; box-sizing: border-box;" />
        </div>
        <div style="width: 100%; display: flex; align-items: flex-end; margin-top: 0.5rem;">
          <button type="submit" [style.background-color]="primaryColor" style="width: 100%; border: 0; color: white; padding: 0.75rem; border-radius: 6px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;">
            🔍 Find Report Cards (Class-wise)
          </button>
        </div>
      </form>

      <!-- Search Results -->
      @if (hasSearched()) {
        <div style="display: flex; flex-direction: column; gap: 2rem; width: 100%;">
          @if (grades().length === 0) {
            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 2.5rem; text-align: center; border-radius: 8px; color: #64748b;">
              <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">📊</span>
              <p style="font-size: 0.95rem; margin: 0; font-weight: 600;">No grade entries found matching your search</p>
              <p style="font-size: 0.85rem; margin-top: 0.25rem;">Verify details or generate some student scores in the Admin panel above!</p>
            </div>
          } @else {
            
            @for (student of getGroupedGrades(); track student.studentName) {
              <!-- Simulated Printable Report Card Ledger -->
              <div style="border: 2px solid #cbd5e1; border-radius: 8px; padding: 2rem; background: #fafafa; font-family: Cambria, Georgia, serif; box-shadow: inset 0 0 10px rgba(0,0,0,0.02); box-sizing: border-box; width: 100%;">
                
                <!-- Report Card Header -->
                <div style="text-align: center; border-bottom: 2px double #cbd5e1; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                  <h4 [style.color]="primaryColor" style="font-size: 1.4rem; font-weight: 800; margin: 0; text-transform: uppercase;">Official Academic Transcript</h4>
                  <p style="font-size: 0.85rem; color: #475569; margin: 0.25rem 0 0 0; font-family: sans-serif; font-weight: 600;">Academic Year: 2026-27</p>
                  
                  <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; font-size: 0.9rem; font-family: sans-serif; text-align: left; margin-top: 1rem; gap: 0.5rem; padding: 0 0.5rem;">
                    <div>Student Name: <strong style="color: #0f172a;">{{ student.studentName }}</strong></div>
                    <div style="text-align: right;" class="mobile-text-left">Class & Section: <strong style="color: #0f172a;">{{ student.classLevel || '-' }} (Section {{ student.section || '-' }})</strong></div>
                    <div>Admission No: <strong style="color: #0f172a;">{{ student.admissionNo || '-' }}</strong></div>
                    <div style="text-align: right;" class="mobile-text-left">Father's Name: <strong style="color: #0f172a;">{{ student.fatherName || '-' }}</strong></div>
                    <div>Aadhar Number: <strong style="color: #0f172a;">{{ student.aadharNo || '-' }}</strong></div>
                    <div style="text-align: right;" class="mobile-text-left">Status: <strong style="color: #16a34a;">OFFICIAL RECORD</strong></div>
                  </div>
                </div>

                <!-- Grades Table -->
                <div class="table-responsive-wrapper" style="border: none;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem; font-family: sans-serif; text-align: left; background: white; border: 1px solid #cbd5e1; margin-bottom: 0;">
                    <thead>
                      <tr [style.background-color]="primaryColor" style="color: white;">
                        <th style="padding: 0.75rem 1rem;">Subject</th>
                        <th style="padding: 0.75rem 1rem;">Assessment Term</th>
                        <th style="padding: 0.75rem 1rem; text-align: center;">Evaluation Score</th>
                        <th style="padding: 0.75rem 1rem;">Teacher Feedback & Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (g of student.records; track g.id) {
                        <tr style="border-bottom: 1px solid #cbd5e1;">
                          <td style="padding: 0.75rem 1rem; font-weight: 700; color: #0f172a;">{{ g.subjectName }}</td>
                          <td style="padding: 0.75rem 1rem; color: #475569;">{{ g.term }}</td>
                          <td style="padding: 0.75rem 1rem; text-align: center; font-weight: 800;" [style.color]="primaryColor">{{ g.grade }}</td>
                          <td style="padding: 0.75rem 1rem; color: #475569; font-size: 0.85rem; font-style: italic;">{{ g.remarks || 'No remarks recorded.' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Certificate Footer Stamp -->
                <div style="display: flex; justify-content: space-between; align-items: flex-end; font-family: sans-serif; font-size: 0.8rem; color: #64748b; margin-top: 2rem; flex-wrap: wrap; gap: 1rem;">
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
  searchClass: string = '1st';
  searchSection: string = 'A';

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
    this.hasSearched.set(false);
    let url = `http://localhost:8080/api/sites/${this.tenantId}/grades`
      + `?classLevel=${encodeURIComponent(this.searchClass)}`
      + `&section=${encodeURIComponent(this.searchSection)}`;
    if (this.searchName.trim()) {
      url += `&studentName=${encodeURIComponent(this.searchName.trim())}`;
    }
    
    this.http.get<StudentGrade[]>(url)
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

  getGroupedGrades() {
    const groups: { [key: string]: StudentGrade[] } = {};
    this.grades().forEach(g => {
      const key = g.studentName;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(g);
    });
    return Object.keys(groups).map(name => ({
      studentName: name,
      admissionNo: groups[name][0].admissionNo,
      classLevel: groups[name][0].classLevel,
      section: groups[name][0].section,
      fatherName: groups[name][0].fatherName,
      aadharNo: groups[name][0].aadharNo,
      records: groups[name]
    }));
  }
}
