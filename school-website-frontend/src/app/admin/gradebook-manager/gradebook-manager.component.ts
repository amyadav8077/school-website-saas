import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface StudentGrade {
  id?: number;
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
  selector: 'app-gradebook-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ds-card ds-reveal gm-card">
      <h2 class="ds-heading gm-heading">Academic Gradebook & <span class="ds-heading-grad">Marks Manager</span></h2>
      <p class="gm-intro-text">Input assessment scores and teacher remarks for students of: <strong class="gm-strong-dark">{{ tenantName }}</strong></p>

      <!-- Tab Selectors: Single Entry vs Bulk Excel Import -->
      <div class="gm-tab-bar">
        <button (click)="managerMode.set('SINGLE')" 
          class="gm-tab-btn"
          [style.border-bottom-color]="managerMode() === 'SINGLE' ? '#1e3a8a' : 'transparent'"
          [style.color]="managerMode() === 'SINGLE' ? '#1e3a8a' : '#64748b'">
          👤 Single Entry Form
        </button>
        <button (click)="managerMode.set('BULK')" 
          class="gm-tab-btn"
          [style.border-bottom-color]="managerMode() === 'BULK' ? '#1e3a8a' : 'transparent'"
          [style.color]="managerMode() === 'BULK' ? '#1e3a8a' : '#64748b'">
          📋 Bulk Excel / Spreadsheet Importer
        </button>
      </div>

      <!-- Mode 1: Single Score Entry Form -->
      @if (managerMode() === 'SINGLE') {
        <form (ngSubmit)="addGradeRecord()" #gradeForm="ngForm" class="gm-form">
          
          <div class="mobile-grid-1 gm-grid-2col">
            <div>
              <label class="gm-label">Student Name</label>
              <input type="text" name="studentName" [(ngModel)]="newGrade.studentName" required placeholder="e.g. John Doe" class="gm-input" />
            </div>
            <div>
              <label class="gm-label">Admission Number</label>
              <input type="text" name="admissionNo" [(ngModel)]="newGrade.admissionNo" required placeholder="e.g. ADM-101" class="gm-input" />
            </div>
          </div>

          <div class="mobile-grid-1 gm-grid-2col">
            <div>
              <label class="gm-label">Father's Name</label>
              <input type="text" name="fatherName" [(ngModel)]="newGrade.fatherName" required placeholder="e.g. Richard Doe" class="gm-input" />
            </div>
            <div>
              <label class="gm-label">Aadhar Card Number</label>
              <input type="text" name="aadharNo" [(ngModel)]="newGrade.aadharNo" required placeholder="e.g. 1234-5678-9012" class="gm-input" />
            </div>
          </div>

          <div class="mobile-grid-1 gm-grid-3col">
            <div>
              <label class="gm-label">Class Level</label>
              <select name="classLevel" [(ngModel)]="newGrade.classLevel" required class="gm-select">
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
            <div>
              <label class="gm-label">Section</label>
              <select name="section" [(ngModel)]="newGrade.section" required class="gm-select">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
              </select>
            </div>
            <div>
              <label class="gm-label">Subject</label>
              <select name="subjectName" [(ngModel)]="newGrade.subjectName" required class="gm-select">
                <option value="Mathematics">Mathematics</option>
                <option value="Science & Physics">Science & Physics</option>
                <option value="English Literature">English Literature</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Social Studies">Social Studies</option>
              </select>
            </div>
          </div>

          <div class="mobile-grid-1 gm-grid-2eq">
            <div>
              <label class="gm-label">Academic Term</label>
              <select name="term" [(ngModel)]="newGrade.term" required class="gm-select">
                <option value="Term 1 Midterm">Term 1 Midterm</option>
                <option value="Term 1 End-Term">Term 1 End-Term</option>
                <option value="Annual Term End">Annual Term End</option>
              </select>
            </div>
            <div>
              <label class="gm-label">Score / Grade (e.g. A+, 95%)</label>
              <input type="text" name="grade" [(ngModel)]="newGrade.grade" required placeholder="e.g. 95% or A" class="gm-input" />
            </div>
          </div>

          <div>
            <label class="gm-label">Teacher Remarks</label>
            <input type="text" name="remarks" [(ngModel)]="newGrade.remarks" placeholder="e.g. Shows exceptional logical clarity in projects." class="gm-input" />
          </div>

          <div class="gm-form-actions">
            <button type="submit" [disabled]="!gradeForm.form.valid" class="ds-btn ds-btn-primary gm-btn-sm">
              Record Score Entry
            </button>
          </div>
        </form>
      }

      <!-- Mode 2: Bulk Excel / Spreadsheet Importer -->
      @if (managerMode() === 'BULK') {
        <div class="gm-bulk-panel">
          <h3 class="ds-heading gm-bulk-heading">Excel / Spreadsheet Copy-Paste Importer</h3>
          
          <!-- Bulk Mode Switcher -->
          <div class="gm-bulk-mode-switcher">
            <button (click)="bulkUploadMode.set('CLASS'); parseSpreadsheet()" 
              [style.background]="bulkUploadMode() === 'CLASS' ? '#1e3a8a' : 'white'"
              [style.color]="bulkUploadMode() === 'CLASS' ? 'white' : '#475569'"
              class="gm-bulk-mode-btn">
              🏫 Class-wise Excel Upload
            </button>
            <button (click)="bulkUploadMode.set('SCHOOL'); parseSpreadsheet()" 
              [style.background]="bulkUploadMode() === 'SCHOOL' ? '#1e3a8a' : 'white'"
              [style.color]="bulkUploadMode() === 'SCHOOL' ? 'white' : '#475569'"
              class="gm-bulk-mode-btn">
              🌐 School-wide Master Excel Upload
            </button>
          </div>

          @if (bulkUploadMode() === 'CLASS') {
            <!-- Class Selection dropdowns for bulk -->
            <div class="mobile-grid-1 gm-bulk-select-grid">
              <div>
                <label class="gm-bulk-label">Select Target Class</label>
                <select name="bulkClass" [(ngModel)]="bulkClass" (change)="parseSpreadsheet()" class="gm-bulk-select">
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
              <div>
                <label class="gm-bulk-label">Select Target Section</label>
                <select name="bulkSection" [(ngModel)]="bulkSection" (change)="parseSpreadsheet()" class="gm-bulk-select">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
            </div>

            <p class="gm-format-note">
              <strong>Class-wise Format columns (Tab-separated Excel copy):</strong><br />
              <code>Student Name [Tab] Admission No [Tab] Father Name [Tab] Aadhar No [Tab] Subject [Tab] Term [Tab] Grade [Tab] Remarks</code>
            </p>
          } @else {
            <p class="gm-format-note">
              <strong>School-wide Format columns (Tab-separated Excel copy):</strong><br />
              <code>Student Name [Tab] Admission No [Tab] Father Name [Tab] Aadhar No [Tab] Class [Tab] Section [Tab] Subject [Tab] Term [Tab] Grade [Tab] Remarks</code>
            </p>
          }

          <textarea [(ngModel)]="pasteAreaText" rows="6" (input)="parseSpreadsheet()"
            [placeholder]="bulkUploadMode() === 'CLASS' 
              ? 'John Doe&#9;ADM-101&#9;Richard Doe&#9;1234-5678-9012&#9;Mathematics&#9;Term 1 Midterm&#9;95%&#9;Excellent problem-solving&#10;Jane Smith&#9;ADM-102&#9;Robert Smith&#9;9876-5432-1098&#9;Science & Physics&#9;Term 1 Midterm&#9;88%&#9;Very attentive'
              : 'John Doe&#9;ADM-101&#9;Richard Doe&#9;1234-5678-9012&#9;1st&#9;A&#9;Mathematics&#9;Term 1 Midterm&#9;95%&#9;Excellent problem-solving&#10;Jane Smith&#9;ADM-102&#9;Robert Smith&#9;9876-5432-1098&#9;2nd&#9;B&#9;Science & Physics&#9;Term 1 Midterm&#9;88%&#9;Very attentive'"
            class="gm-textarea">
          </textarea>

          <div class="gm-actions-end">
            <button (click)="parseSpreadsheet()" [disabled]="!pasteAreaText.trim()" class="ds-btn ds-btn-primary gm-btn-sm">
              Parse & Preview Rows
            </button>
          </div>

          <!-- Parsed Preview Grid -->
          @if (parsedRows().length > 0) {
            <div class="gm-preview-wrap">
              <h4 class="gm-preview-title">📋 Parsed Verification Grid ({{ parsedRows().length }} rows)</h4>
              
              <div class="gm-table-scroll">
                <table class="gm-preview-table">
                  <thead>
                    <tr class="gm-preview-thead-row">
                      <th class="gm-th-sm">Student Name</th>
                      <th class="gm-th-sm">Subject</th>
                      <th class="gm-th-sm">Term</th>
                      <th class="gm-th-sm">Grade</th>
                      <th class="gm-th-sm">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of parsedRows(); track $index) {
                      <tr class="gm-tr-divider">
                        <td class="gm-td-sm-bold">{{ row.studentName }}</td>
                        <td class="gm-td-sm">{{ row.subjectName }}</td>
                        <td class="gm-td-sm-muted">{{ row.term }}</td>
                        <td class="gm-td-sm-grade">{{ row.grade }}</td>
                        <td class="gm-td-sm-remarks">{{ row.remarks }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="gm-actions-end">
                <button (click)="clearParsed()" class="ds-btn ds-btn-ghost gm-btn-sm">
                  Clear All
                </button>
                <button (click)="importParsedRows()" [disabled]="isImporting()" class="ds-btn ds-btn-success gm-btn-sm">
                  @if (isImporting()) { <span class="ds-spinner"></span> Importing ledger... } @else { Confirm Bulk Import to Database }
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Grade Records List -->
      <h3 class="ds-heading gm-list-heading">All Logged Grades</h3>
      @if (grades().length === 0) {
        <p class="gm-empty-note">No gradebook entries recorded yet.</p>
      } @else {
        <div class="gm-list-scroll">
          <table class="gm-list-table">
            <thead>
              <tr class="gm-list-thead-row">
                <th class="gm-th-lg">Student Details</th>
                <th class="gm-th-lg">Subject</th>
                <th class="gm-th-lg">Term</th>
                <th class="gm-th-lg">Score / Grade</th>
                <th class="gm-th-lg">Teacher Remarks</th>
                <th class="gm-th-lg-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (g of grades(); track g.id) {
                <tr class="gm-list-tr">
                  <td class="gm-td-lg-dark">
                    <strong class="gm-student-name">{{ g.studentName }}</strong>
                    @if (g.classLevel || g.section || g.admissionNo) {
                      <span class="gm-student-meta">
                        {{ g.classLevel || '-' }} (Section {{ g.section || '-' }}) • Adm No: {{ g.admissionNo || '-' }}
                      </span>
                    }
                  </td>
                  <td class="gm-td-lg-subject">{{ g.subjectName }}</td>
                  <td class="gm-td-lg-term">{{ g.term }}</td>
                  <td class="gm-td-lg-grade">{{ g.grade }}</td>
                  <td class="gm-td-lg-remarks">{{ g.remarks || 'No remarks recorded.' }}</td>
                  <td class="gm-td-lg-actions">
                    <button (click)="deleteGradeRecord(g.id!)" class="ds-btn ds-btn-danger gm-delete-btn">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (gradeTotalPages() > 1) {
          <div class="sw-pager">
            <button class="sw-pager-btn" [disabled]="gradePage() === 0" (click)="goToGradePage(gradePage() - 1)">← Prev</button>
            <span class="sw-pager-info">Page {{ gradePage() + 1 }} of {{ gradeTotalPages() }} · {{ gradeTotalElements() }} records</span>
            <button class="sw-pager-btn" [disabled]="gradePage() + 1 >= gradeTotalPages()" (click)="goToGradePage(gradePage() + 1)">Next →</button>
          </div>
        }
      }
    </div>
  `,
  styleUrl: './gradebook-manager.component.scss'
})
export class GradebookManagerComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() tenantName!: string;
  @Input() refreshTrigger: number = 0;
  @Output() gradebookModified = new EventEmitter<void>();

  protected readonly managerMode = signal<string>('SINGLE'); // SINGLE, BULK
  protected readonly grades = signal<StudentGrade[]>([]);
  protected readonly gradePage = signal<number>(0);
  protected readonly gradeTotalPages = signal<number>(0);
  protected readonly gradeTotalElements = signal<number>(0);
  protected readonly gradePageSize = 25;
  
  protected readonly parsedRows = signal<StudentGrade[]>([]);
  protected readonly isImporting = signal(false);

  // New bulk upload state variables
  protected readonly bulkUploadMode = signal<string>('CLASS'); // CLASS, SCHOOL
  bulkClass: string = '1st';
  bulkSection: string = 'A';

  pasteAreaText: string = '';

  newGrade: StudentGrade = {
    studentName: '',
    subjectName: 'Mathematics',
    term: 'Term 1 Midterm',
    grade: 'A',
    remarks: 'Demonstrates exceptional logical capability.',
    admissionNo: '',
    classLevel: '1st',
    section: 'A',
    fatherName: '',
    aadharNo: ''
  };

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['tenantId'] && this.tenantId) || (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange)) {
      this.gradePage.set(0);
      this.fetchGrades();
    }
  }

  fetchGrades() {
    const page = this.gradePage();
    this.http.get<any>(`http://localhost:8080/api/sites/${this.tenantId}/grades/paged?page=${page}&size=${this.gradePageSize}`)
      .subscribe({
        next: (res) => {
          // Interceptor unwraps ApiResponse; res is the Spring Page object.
          this.grades.set(res?.content || []);
          this.gradeTotalPages.set(res?.totalPages || 0);
          this.gradeTotalElements.set(res?.totalElements || 0);
        },
        error: (err) => console.error(err)
      });
  }

  goToGradePage(page: number) {
    if (page < 0 || page >= this.gradeTotalPages()) {
      return;
    }
    this.gradePage.set(page);
    this.fetchGrades();
  }

  addGradeRecord() {
    this.http.post<StudentGrade>(`http://localhost:8080/api/admin/sites/${this.tenantId}/grades`, this.newGrade)
      .subscribe({
        next: () => {
          this.fetchGrades();
          this.gradebookModified.emit();
          this.newGrade.studentName = '';
        },
        error: (err) => console.error(err)
      });
  }

  parseSpreadsheet() {
    if (!this.pasteAreaText.trim()) return;

    const lines = this.pasteAreaText.split('\n');
    const rows: StudentGrade[] = [];

    lines.forEach(line => {
      if (!line.trim()) return;

      const parts = line.includes('\t') ? line.split('\t') : line.split(',');
      
      if (this.bulkUploadMode() === 'CLASS') {
        // Format: Student Name [0], Admission No [1], Father Name [2], Aadhar No [3], Subject [4], Term [5], Grade [6], Remarks [7]
        if (parts.length >= 7) {
          rows.push({
            studentName: parts[0]?.trim() || 'Unknown Student',
            admissionNo: parts[1]?.trim() || 'ADM-MOCK',
            fatherName: parts[2]?.trim() || 'Unknown Father',
            aadharNo: parts[3]?.trim() || 'MOCK-AADHAR',
            classLevel: this.bulkClass,
            section: this.bulkSection,
            subjectName: parts[4]?.trim() || 'Mathematics',
            term: parts[5]?.trim() || 'Term 1 Midterm',
            grade: parts[6]?.trim() || 'A',
            remarks: parts[7]?.trim() || 'Good performance.'
          });
        }
      } else {
        // Format: Student Name [0], Admission No [1], Father Name [2], Aadhar No [3], Class [4], Section [5], Subject [6], Term [7], Grade [8], Remarks [9]
        if (parts.length >= 9) {
          rows.push({
            studentName: parts[0]?.trim() || 'Unknown Student',
            admissionNo: parts[1]?.trim() || 'ADM-MOCK',
            fatherName: parts[2]?.trim() || 'Unknown Father',
            aadharNo: parts[3]?.trim() || 'MOCK-AADHAR',
            classLevel: parts[4]?.trim() || '1st',
            section: parts[5]?.trim() || 'A',
            subjectName: parts[6]?.trim() || 'Mathematics',
            term: parts[7]?.trim() || 'Term 1 Midterm',
            grade: parts[8]?.trim() || 'A',
            remarks: parts[9]?.trim() || 'Good performance.'
          });
        }
      }
    });

    this.parsedRows.set(rows);
  }

  clearParsed() {
    this.parsedRows.set([]);
    this.pasteAreaText = '';
  }

  importParsedRows() {
    const list = this.parsedRows();
    if (list.length === 0) return;

    this.isImporting.set(true);
    let completedCount = 0;

    // Concurrently post all student grade records to database
    list.forEach(row => {
      this.http.post<StudentGrade>(`http://localhost:8080/api/admin/sites/${this.tenantId}/grades`, row)
        .subscribe({
          next: () => {
            completedCount++;
            if (completedCount === list.length) {
              this.isImporting.set(false);
              this.clearParsed();
              this.fetchGrades();
              this.gradebookModified.emit();
            }
          },
          error: (err) => {
            console.error('Failed to import row', row, err);
            // Even on single row error, increment to avoid locking loader
            completedCount++;
            if (completedCount === list.length) {
              this.isImporting.set(false);
              this.clearParsed();
              this.fetchGrades();
              this.gradebookModified.emit();
            }
          }
        });
    });
  }

  deleteGradeRecord(id: number) {
    this.http.delete(`http://localhost:8080/api/admin/grades/${id}`)
      .subscribe({
        next: () => {
          this.fetchGrades();
          this.gradebookModified.emit();
        },
        error: (err) => console.error(err)
      });
  }
}
