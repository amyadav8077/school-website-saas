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
    <div class="ds-card ds-reveal rc-card">
      <h3 [style.color]="primaryColor" class="ds-heading rc-heading">
        Parent Academic Report Card Lookup
      </h3>
      <p class="rc-subtitle">
        Search for your child's student record to view issued term results, teacher evaluations, and gradebook charts.
      </p>

      <!-- Student Record Lookup Bar -->
      <form (ngSubmit)="searchStudentGrades()" class="rc-search-form">
        <div class="rc-field-class">
          <label class="rc-label">Select Class</label>
          <select name="searchClass" [(ngModel)]="searchClass" required class="rc-select">
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
        <div class="rc-field-section">
          <label class="rc-label">Select Section</label>
          <select name="searchSection" [(ngModel)]="searchSection" required class="rc-select">
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
        </div>
        <div class="rc-field-name">
          <label class="rc-label">Student Name (Optional)</label>
          <input type="text" name="studentSearchName" [(ngModel)]="searchName" placeholder="Enter name or leave empty to list all" 
            class="rc-input" />
        </div>
        <div class="rc-submit-wrapper">
          <button type="submit" class="ds-btn rc-submit-btn" [style.background-color]="primaryColor">
            🔍 Find Report Cards (Class-wise)
          </button>
        </div>
      </form>

      <!-- Search Results -->
      @if (hasSearched()) {
        <div class="rc-results">
          @if (grades().length === 0) {
            <div class="ds-alert ds-alert-info rc-empty-alert">
              <span class="rc-empty-icon">📊</span>
              <p class="rc-empty-title">No grade entries found matching your search</p>
              <p class="rc-empty-hint">Verify details or generate some student scores in the Admin panel above!</p>
            </div>
          } @else {
            
            @for (student of getGroupedGrades(); track student.studentName) {
              <!-- Simulated Printable Report Card Ledger -->
              <div class="rc-ledger">
                
                <!-- Report Card Header -->
                <div class="rc-ledger-header">
                  <h4 [style.color]="primaryColor" class="rc-ledger-title">Official Academic Transcript</h4>
                  <p class="rc-ledger-year">Academic Year: 2026-27</p>
                  
                  <div class="mobile-grid-1 rc-info-grid">
                    <div>Student Name: <strong class="rc-info-strong">{{ student.studentName }}</strong></div>
                    <div class="mobile-text-left rc-info-right">Class & Section: <strong class="rc-info-strong">{{ student.classLevel || '-' }} (Section {{ student.section || '-' }})</strong></div>
                    <div>Admission No: <strong class="rc-info-strong">{{ student.admissionNo || '-' }}</strong></div>
                    <div class="mobile-text-left rc-info-right">Father's Name: <strong class="rc-info-strong">{{ student.fatherName || '-' }}</strong></div>
                    <div>Aadhar Number: <strong class="rc-info-strong">{{ student.aadharNo || '-' }}</strong></div>
                    <div class="mobile-text-left rc-info-right">Status: <strong class="rc-info-status">OFFICIAL RECORD</strong></div>
                  </div>
                </div>

                <!-- Grades Table -->
                <div class="table-responsive-wrapper rc-table-wrapper">
                  <table class="rc-table">
                    <thead>
                      <tr [style.background-color]="primaryColor" class="rc-thead-row">
                        <th class="rc-th">Subject</th>
                        <th class="rc-th">Assessment Term</th>
                        <th class="rc-th-center">Evaluation Score</th>
                        <th class="rc-th">Teacher Feedback & Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (g of student.records; track g.id) {
                        <tr class="rc-body-row">
                          <td class="rc-td-subject">{{ g.subjectName }}</td>
                          <td class="rc-td-term">{{ g.term }}</td>
                          <td class="rc-td-score" [style.color]="primaryColor">{{ g.grade }}</td>
                          <td class="rc-td-remarks">{{ g.remarks || 'No remarks recorded.' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Certificate Footer Stamp -->
                <div class="rc-footer">
                  <div>
                    <span class="rc-signature-line"></span>
                    <span>Evaluated By (Class Teacher)</span>
                  </div>
                  <div class="rc-verified-stamp">
                    🏫 VERIFIED BY PORTAL TRUST
                  </div>
                </div>

              </div>
            }

          }
        </div>
      }
    </div>
  `,
  styleUrl: './report-card-lookup.component.scss'
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
