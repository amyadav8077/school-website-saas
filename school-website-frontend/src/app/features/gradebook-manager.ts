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
    <div style="background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
      <h2 style="font-size: 1.5rem; color: #1e293b; margin-top: 0; margin-bottom: 0.5rem; font-weight: 700;">Academic Gradebook & Marks Manager</h2>
      <p style="color: #64748b; font-size: 0.9rem; margin-top: 0; margin-bottom: 1.5rem;">Input assessment scores and teacher remarks for students of: <strong style="color: #0f172a;">{{ tenantName }}</strong></p>

      <!-- Tab Selectors: Single Entry vs Bulk Excel Import -->
      <div style="display: flex; gap: 0.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
        <button (click)="managerMode.set('SINGLE')" 
          style="background: none; border: 0; padding: 0.4rem 0.8rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; font-size: 0.9rem;"
          [style.border-bottom-color]="managerMode() === 'SINGLE' ? '#1e3a8a' : 'transparent'"
          [style.color]="managerMode() === 'SINGLE' ? '#1e3a8a' : '#64748b'">
          👤 Single Entry Form
        </button>
        <button (click)="managerMode.set('BULK')" 
          style="background: none; border: 0; padding: 0.4rem 0.8rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent; font-size: 0.9rem;"
          [style.border-bottom-color]="managerMode() === 'BULK' ? '#1e3a8a' : 'transparent'"
          [style.color]="managerMode() === 'BULK' ? '#1e3a8a' : '#64748b'">
          📋 Bulk Excel / Spreadsheet Importer
        </button>
      </div>

      <!-- Mode 1: Single Score Entry Form -->
      @if (managerMode() === 'SINGLE') {
        <form (ngSubmit)="addGradeRecord()" #gradeForm="ngForm" style="background: #f8fafc; padding: 1.25rem; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
          
          <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Student Name</label>
              <input type="text" name="studentName" [(ngModel)]="newGrade.studentName" required placeholder="e.g. John Doe" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Admission Number</label>
              <input type="text" name="admissionNo" [(ngModel)]="newGrade.admissionNo" required placeholder="e.g. ADM-101" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
          </div>

          <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Father's Name</label>
              <input type="text" name="fatherName" [(ngModel)]="newGrade.fatherName" required placeholder="e.g. Richard Doe" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Aadhar Card Number</label>
              <input type="text" name="aadharNo" [(ngModel)]="newGrade.aadharNo" required placeholder="e.g. 1234-5678-9012" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
          </div>

          <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Class Level</label>
              <select name="classLevel" [(ngModel)]="newGrade.classLevel" required style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
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
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Section</label>
              <select name="section" [(ngModel)]="newGrade.section" required style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Subject</label>
              <select name="subjectName" [(ngModel)]="newGrade.subjectName" required style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
                <option value="Mathematics">Mathematics</option>
                <option value="Science & Physics">Science & Physics</option>
                <option value="English Literature">English Literature</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Social Studies">Social Studies</option>
              </select>
            </div>
          </div>

          <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Academic Term</label>
              <select name="term" [(ngModel)]="newGrade.term" required style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
                <option value="Term 1 Midterm">Term 1 Midterm</option>
                <option value="Term 1 End-Term">Term 1 End-Term</option>
                <option value="Annual Term End">Annual Term End</option>
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Score / Grade (e.g. A+, 95%)</label>
              <input type="text" name="grade" [(ngModel)]="newGrade.grade" required placeholder="e.g. 95% or A" style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Teacher Remarks</label>
            <input type="text" name="remarks" [(ngModel)]="newGrade.remarks" placeholder="e.g. Shows exceptional logical clarity in projects." style="width: 100%; padding: 0.55rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
          </div>

          <div style="text-align: right;">
            <button type="submit" [disabled]="!gradeForm.form.valid" style="background: #1e3a8a; color: white; border: 0; padding: 0.65rem 1.25rem; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
              Record Score Entry
            </button>
          </div>
        </form>
      }

      <!-- Mode 2: Bulk Excel / Spreadsheet Importer -->
      @if (managerMode() === 'BULK') {
        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
          <h3 style="margin-top: 0; margin-bottom: 0.5rem; font-size: 1.15rem; color: #1e293b; font-weight: 700;">Excel / Spreadsheet Copy-Paste Importer</h3>
          
          <!-- Bulk Mode Switcher -->
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
            <button (click)="bulkUploadMode.set('CLASS'); parseSpreadsheet()" 
              [style.background]="bulkUploadMode() === 'CLASS' ? '#1e3a8a' : 'white'"
              [style.color]="bulkUploadMode() === 'CLASS' ? 'white' : '#475569'"
              style="border: 1px solid #cbd5e1; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.8rem;">
              🏫 Class-wise Excel Upload
            </button>
            <button (click)="bulkUploadMode.set('SCHOOL'); parseSpreadsheet()" 
              [style.background]="bulkUploadMode() === 'SCHOOL' ? '#1e3a8a' : 'white'"
              [style.color]="bulkUploadMode() === 'SCHOOL' ? 'white' : '#475569'"
              style="border: 1px solid #cbd5e1; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.8rem;">
              🌐 School-wide Master Excel Upload
            </button>
          </div>

          @if (bulkUploadMode() === 'CLASS') {
            <!-- Class Selection dropdowns for bulk -->
            <div class="mobile-grid-1" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; background: white; padding: 1rem; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Select Target Class</label>
                <select name="bulkClass" [(ngModel)]="bulkClass" (change)="parseSpreadsheet()" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white; font-weight: 600;">
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
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Select Target Section</label>
                <select name="bulkSection" [(ngModel)]="bulkSection" (change)="parseSpreadsheet()" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white; font-weight: 600;">
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
            </div>

            <p style="color: #64748b; font-size: 0.8rem; margin-top: 0; margin-bottom: 1rem;">
              <strong>Class-wise Format columns (Tab-separated Excel copy):</strong><br />
              <code>Student Name [Tab] Admission No [Tab] Father Name [Tab] Aadhar No [Tab] Subject [Tab] Term [Tab] Grade [Tab] Remarks</code>
            </p>
          } @else {
            <p style="color: #64748b; font-size: 0.8rem; margin-top: 0; margin-bottom: 1rem;">
              <strong>School-wide Format columns (Tab-separated Excel copy):</strong><br />
              <code>Student Name [Tab] Admission No [Tab] Father Name [Tab] Aadhar No [Tab] Class [Tab] Section [Tab] Subject [Tab] Term [Tab] Grade [Tab] Remarks</code>
            </p>
          }

          <textarea [(ngModel)]="pasteAreaText" rows="6" (input)="parseSpreadsheet()"
            [placeholder]="bulkUploadMode() === 'CLASS' 
              ? 'John Doe&#9;ADM-101&#9;Richard Doe&#9;1234-5678-9012&#9;Mathematics&#9;Term 1 Midterm&#9;95%&#9;Excellent problem-solving&#10;Jane Smith&#9;ADM-102&#9;Robert Smith&#9;9876-5432-1098&#9;Science & Physics&#9;Term 1 Midterm&#9;88%&#9;Very attentive'
              : 'John Doe&#9;ADM-101&#9;Richard Doe&#9;1234-5678-9012&#9;1st&#9;A&#9;Mathematics&#9;Term 1 Midterm&#9;95%&#9;Excellent problem-solving&#10;Jane Smith&#9;ADM-102&#9;Robert Smith&#9;9876-5432-1098&#9;2nd&#9;B&#9;Science & Physics&#9;Term 1 Midterm&#9;88%&#9;Very attentive'"
            style="width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 0.85rem; box-sizing: border-box; resize: vertical; margin-bottom: 1rem;">
          </textarea>

          <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button (click)="parseSpreadsheet()" [disabled]="!pasteAreaText.trim()" style="background: #1e3a8a; color: white; border: 0; padding: 0.55rem 1.25rem; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
              Parse & Preview Rows
            </button>
          </div>

          <!-- Parsed Preview Grid -->
          @if (parsedRows().length > 0) {
            <div style="margin-top: 1.5rem; border-top: 1px solid #cbd5e1; padding-top: 1rem;">
              <h4 style="margin-top: 0; margin-bottom: 0.75rem; font-size: 0.95rem; color: #0f172a; font-weight: 700;">📋 Parsed Verification Grid ({{ parsedRows().length }} rows)</h4>
              
              <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 1.25rem; background: white;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
                  <thead>
                    <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: 700;">
                      <th style="padding: 0.5rem 0.75rem;">Student Name</th>
                      <th style="padding: 0.5rem 0.75rem;">Subject</th>
                      <th style="padding: 0.5rem 0.75rem;">Term</th>
                      <th style="padding: 0.5rem 0.75rem;">Grade</th>
                      <th style="padding: 0.5rem 0.75rem;">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of parsedRows(); track $index) {
                      <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 0.5rem 0.75rem; font-weight: 700;">{{ row.studentName }}</td>
                        <td style="padding: 0.5rem 0.75rem;">{{ row.subjectName }}</td>
                        <td style="padding: 0.5rem 0.75rem; color: #64748b;">{{ row.term }}</td>
                        <td style="padding: 0.5rem 0.75rem; font-weight: 700; color: #1e3a8a;">{{ row.grade }}</td>
                        <td style="padding: 0.5rem 0.75rem; color: #475569; font-style: italic;">{{ row.remarks }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button (click)="clearParsed()" style="background: white; border: 1px solid #cbd5e1; color: #475569; padding: 0.55rem 1.25rem; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.85rem;">
                  Clear All
                </button>
                <button (click)="importParsedRows()" [disabled]="isImporting()" style="background: #10b981; color: white; border: 0; padding: 0.55rem 1.25rem; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 0.85rem;">
                  {{ isImporting() ? 'Importing ledger...' : 'Confirm Bulk Import to Database' }}
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Grade Records List -->
      <h3 style="margin-bottom: 0.75rem; color: #1e293b; font-weight: 700; font-size: 1.2rem;">All Logged Grades</h3>
      @if (grades().length === 0) {
        <p style="color: #64748b; font-style: italic;">No gradebook entries recorded yet.</p>
      } @else {
        <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 6px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1; color: #475569; font-weight: 600;">
                <th style="padding: 0.75rem 1rem;">Student Details</th>
                <th style="padding: 0.75rem 1rem;">Subject</th>
                <th style="padding: 0.75rem 1rem;">Term</th>
                <th style="padding: 0.75rem 1rem;">Score / Grade</th>
                <th style="padding: 0.75rem 1rem;">Teacher Remarks</th>
                <th style="padding: 0.75rem 1rem; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (g of grades(); track g.id) {
                <tr style="border-bottom: 1px solid #e2e8f0; hover: background-color: #f8fafc;">
                  <td style="padding: 0.75rem 1rem; color: #0f172a;">
                    <strong style="display: block; font-weight: 700;">{{ g.studentName }}</strong>
                    @if (g.classLevel || g.section || g.admissionNo) {
                      <span style="font-size: 0.75rem; color: #64748b; display: block; margin-top: 0.15rem;">
                        {{ g.classLevel || '-' }} (Section {{ g.section || '-' }}) • Adm No: {{ g.admissionNo || '-' }}
                      </span>
                    }
                  </td>
                  <td style="padding: 0.75rem 1rem; color: #475569;">{{ g.subjectName }}</td>
                  <td style="padding: 0.75rem 1rem; color: #64748b;">{{ g.term }}</td>
                  <td style="padding: 0.75rem 1rem; font-weight: 700; color: #1e3a8a;">{{ g.grade }}</td>
                  <td style="padding: 0.75rem 1rem; color: #475569; max-width: 200px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{ g.remarks || 'No remarks recorded.' }}</td>
                  <td style="padding: 0.75rem 1rem; text-align: right;">
                    <button (click)="deleteGradeRecord(g.id!)" style="background: none; border: 0; color: #ef4444; font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class GradebookManagerComponent implements OnChanges {
  @Input() tenantId!: number;
  @Input() tenantName!: string;
  @Input() refreshTrigger: number = 0;
  @Output() gradebookModified = new EventEmitter<void>();

  protected readonly managerMode = signal<string>('SINGLE'); // SINGLE, BULK
  protected readonly grades = signal<StudentGrade[]>([]);
  
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
      this.fetchGrades();
    }
  }

  fetchGrades() {
    this.http.get<StudentGrade[]>(`http://localhost:8080/api/sites/${this.tenantId}/grades`)
      .subscribe({
        next: (data) => this.grades.set(data),
        error: (err) => console.error(err)
      });
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
