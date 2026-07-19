import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Course {
  id?: number;
  name: string;
  gradeLevel: string;
  description: string;
  syllabusSummary: string;
}

export interface Faculty {
  id?: number;
  name: string;
  designation: string;
  qualification: string;
  bio: string;
  imageUrl: string;
}

@Component({
  selector: 'app-academics-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="background: white; padding: 2rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 2rem;">
      <!-- Tab Header Toggle -->
      <div style="display: flex; gap: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.75rem; margin-bottom: 1.5rem;">
        <button (click)="activeTab.set('COURSES')" 
          style="background: none; border: 0; padding: 0.5rem 1rem; font-size: 1.1rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent;"
          [style.border-bottom-color]="activeTab() === 'COURSES' ? '#1e3a8a' : 'transparent'"
          [style.color]="activeTab() === 'COURSES' ? '#1e3a8a' : '#64748b'">
          📚 Academic Course Catalog
        </button>
        <button (click)="activeTab.set('FACULTY')" 
          style="background: none; border: 0; padding: 0.5rem 1rem; font-size: 1.1rem; font-weight: 700; cursor: pointer; border-bottom: 3px solid transparent;"
          [style.border-bottom-color]="activeTab() === 'FACULTY' ? '#1e3a8a' : 'transparent'"
          [style.color]="activeTab() === 'FACULTY' ? '#1e3a8a' : '#64748b'">
          👨‍🏫 Faculty Directory
        </button>
      </div>

      <!-- Tab 1: Course Manager -->
      @if (activeTab() === 'COURSES') {
        <div>
          <h3 style="margin-top: 0; margin-bottom: 1rem; color: #1e293b; font-weight: 700; font-size: 1.2rem;">Add New Academic Course</h3>
          
          <form (ngSubmit)="addCourse()" #courseForm="ngForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; background: #f8fafc; padding: 1.25rem; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Course Name</label>
              <input type="text" name="name" [(ngModel)]="newCourse.name" required placeholder="e.g. Honors Chemistry" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Grade Level</label>
              <select name="gradeLevel" [(ngModel)]="newCourse.gradeLevel" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; background: white;">
                <option value="Primary School (G1-5)">Primary School (G1-5)</option>
                <option value="Middle School (G6-8)">Middle School (G6-8)</option>
                <option value="High School (G9-12)">High School (G9-12)</option>
              </select>
            </div>
            <div style="grid-column: span 2;">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Course Description</label>
              <input type="text" name="description" [(ngModel)]="newCourse.description" required placeholder="Detailed description of what is covered..." style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div style="grid-column: span 2; display: flex; align-items: flex-end; gap: 1rem;">
              <div style="flex: 1;">
                <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Syllabus Outline / Key Topics (Optional)</label>
                <input type="text" name="syllabusSummary" [(ngModel)]="newCourse.syllabusSummary" placeholder="e.g. Mechanics, Thermodynamics, Quantum Basics" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
              </div>
              <button type="submit" [disabled]="!courseForm.form.valid" style="background: #1e3a8a; color: white; border: 0; padding: 0.65rem 1.25rem; border-radius: 4px; font-weight: 600; cursor: pointer;">
                Add Course
              </button>
            </div>
          </form>

          <h3 style="margin-bottom: 0.75rem; color: #1e293b; font-weight: 700; font-size: 1.2rem;">Current Courses</h3>
          @if (courses().length === 0) {
            <p style="color: #64748b; font-style: italic;">No courses have been added to this school yet.</p>
          } @else {
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              @for (c of courses(); track c.id) {
                <div style="background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                      <strong style="font-size: 1.05rem; color: #0f172a;">{{ c.name }}</strong>
                      <span style="background: #e2e8f0; color: #475569; font-size: 0.75rem; padding: 0.15rem 0.40rem; border-radius: 4px; font-weight: 600;">{{ c.gradeLevel }}</span>
                    </div>
                    <p style="color: #475569; font-size: 0.85rem; margin: 0 0 0.5rem 0; line-height: 1.4;">{{ c.description }}</p>
                    @if (c.syllabusSummary) {
                      <div style="font-size: 0.8rem; color: #64748b; background: #f8fafc; padding: 0.5rem; border-radius: 4px;">Syllabus: {{ c.syllabusSummary }}</div>
                    }
                  </div>
                  <div style="text-align: right; margin-top: 0.75rem; border-top: 1px solid #f1f5f9; padding-top: 0.5rem;">
                    <button (click)="deleteCourse(c.id!)" style="background: none; border: 0; color: #ef4444; font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                      🗑️ Delete Course
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Tab 2: Faculty Manager -->
      @if (activeTab() === 'FACULTY') {
        <div>
          <h3 style="margin-top: 0; margin-bottom: 1rem; color: #1e293b; font-weight: 700; font-size: 1.2rem;">Add New Faculty Member</h3>
          
          <form (ngSubmit)="addFaculty()" #facultyForm="ngForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; background: #f8fafc; padding: 1.25rem; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Full Name</label>
              <input type="text" name="name" [(ngModel)]="newFaculty.name" required placeholder="e.g. Dr. Arthur Pendragon" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Designation / Department</label>
              <input type="text" name="designation" [(ngModel)]="newFaculty.designation" required placeholder="e.g. Head of Science Department" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Academic Qualifications</label>
              <input type="text" name="qualification" [(ngModel)]="newFaculty.qualification" required placeholder="e.g. Ph.D. in Theoretical Chemistry" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.35rem;">Short Bio</label>
              <input type="text" name="bio" [(ngModel)]="newFaculty.bio" required placeholder="e.g. Passionate researcher with over 15 years teaching..." style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;" />
            </div>
            <div style="grid-column: span 2; display: flex; justify-content: flex-end; margin-top: 0.5rem;">
              <button type="submit" [disabled]="!facultyForm.form.valid" style="background: #1e3a8a; color: white; border: 0; padding: 0.65rem 1.25rem; border-radius: 4px; font-weight: 600; cursor: pointer;">
                Add Faculty Member
              </button>
            </div>
          </form>

          <h3 style="margin-bottom: 0.75rem; color: #1e293b; font-weight: 700; font-size: 1.2rem;">Our Faculty List</h3>
          @if (faculty().length === 0) {
            <p style="color: #64748b; font-style: italic;">No faculty members have been added to this school yet.</p>
          } @else {
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              @for (f of faculty(); track f.id) {
                <div style="background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 1rem; display: flex; gap: 1rem; align-items: flex-start; justify-content: space-between;">
                  <div style="display: flex; gap: 1rem;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                      👨‍🏫
                    </div>
                    <div>
                      <strong style="font-size: 1.05rem; color: #0f172a; display: block;">{{ f.name }}</strong>
                      <span style="font-size: 0.8rem; font-weight: 600; color: #2563eb; display: block; margin-bottom: 0.25rem;">{{ f.designation }}</span>
                      <span style="font-size: 0.75rem; color: #64748b; display: block; font-style: italic; margin-bottom: 0.5rem;">Qualifications: {{ f.qualification }}</span>
                      <p style="color: #475569; font-size: 0.8rem; margin: 0; line-height: 1.4;">{{ f.bio }}</p>
                    </div>
                  </div>
                  <button (click)="deleteFaculty(f.id!)" style="background: none; border: 0; color: #ef4444; font-size: 0.8rem; font-weight: 600; cursor: pointer; white-space: nowrap;">
                    🗑️ Remove
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AcademicsManagerComponent implements OnChanges {
  @Input() tenantId!: number;
  @Output() catalogModified = new EventEmitter<void>();

  protected readonly activeTab = signal<string>('COURSES');
  protected readonly courses = signal<Course[]>([]);
  protected readonly faculty = signal<Faculty[]>([]);

  newCourse = {
    name: '',
    gradeLevel: 'High School (G9-12)',
    description: '',
    syllabusSummary: ''
  };

  newFaculty = {
    name: '',
    designation: '',
    qualification: '',
    bio: '',
    imageUrl: ''
  };

  constructor(private readonly http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tenantId'] && this.tenantId) {
      this.fetchCourses();
      this.fetchFaculty();
    }
  }

  fetchCourses() {
    this.http.get<Course[]>(`http://localhost:8080/api/sites/${this.tenantId}/courses`)
      .subscribe({
        next: (data) => this.courses.set(data),
        error: (err) => console.error(err)
      });
  }

  fetchFaculty() {
    this.http.get<Faculty[]>(`http://localhost:8080/api/sites/${this.tenantId}/faculty`)
      .subscribe({
        next: (data) => this.faculty.set(data),
        error: (err) => console.error(err)
      });
  }

  addCourse() {
    this.http.post<Course>(`http://localhost:8080/api/admin/sites/${this.tenantId}/courses`, this.newCourse)
      .subscribe({
        next: () => {
          this.fetchCourses();
          this.catalogModified.emit();
          this.newCourse = {
            name: '',
            gradeLevel: 'High School (G9-12)',
            description: '',
            syllabusSummary: ''
          };
        },
        error: (err) => console.error(err)
      });
  }

  deleteCourse(id: number) {
    this.http.delete(`http://localhost:8080/api/admin/courses/${id}`)
      .subscribe({
        next: () => {
          this.fetchCourses();
          this.catalogModified.emit();
        },
        error: (err) => console.error(err)
      });
  }

  addFaculty() {
    this.http.post<Faculty>(`http://localhost:8080/api/admin/sites/${this.tenantId}/faculty`, this.newFaculty)
      .subscribe({
        next: () => {
          this.fetchFaculty();
          this.catalogModified.emit();
          this.newFaculty = {
            name: '',
            designation: '',
            qualification: '',
            bio: '',
            imageUrl: ''
          };
        },
        error: (err) => console.error(err)
      });
  }

  deleteFaculty(id: number) {
    this.http.delete(`http://localhost:8080/api/admin/faculty/${id}`)
      .subscribe({
        next: () => {
          this.fetchFaculty();
          this.catalogModified.emit();
        },
        error: (err) => console.error(err)
      });
  }
}
