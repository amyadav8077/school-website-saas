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
    <div class="ds-card ds-reveal ac-card">
      <!-- Tab Header Toggle -->
      <div class="ac-tab-header">
        <button (click)="activeTab.set('COURSES')" 
          class="ac-tab-btn"
          [style.border-bottom-color]="activeTab() === 'COURSES' ? '#1e3a8a' : 'transparent'"
          [style.color]="activeTab() === 'COURSES' ? '#1e3a8a' : '#64748b'">
          📚 Academic Course Catalog
        </button>
        <button (click)="activeTab.set('FACULTY')" 
          class="ac-tab-btn"
          [style.border-bottom-color]="activeTab() === 'FACULTY' ? '#1e3a8a' : 'transparent'"
          [style.color]="activeTab() === 'FACULTY' ? '#1e3a8a' : '#64748b'">
          👨‍🏫 Faculty Directory
        </button>
      </div>

      <!-- Tab 1: Course Manager -->
      @if (activeTab() === 'COURSES') {
        <div>
          <h3 class="ds-heading ac-section-title">Add New Academic Course</h3>
          
          <form (ngSubmit)="addCourse()" #courseForm="ngForm" class="mobile-grid-1 ac-form">
            <div>
              <label class="ac-label">Course Name</label>
              <input type="text" name="name" [(ngModel)]="newCourse.name" required placeholder="e.g. Honors Chemistry" class="ac-input" />
            </div>
            <div>
              <label class="ac-label">Grade Level</label>
              <select name="gradeLevel" [(ngModel)]="newCourse.gradeLevel" required class="ac-select">
                <option value="Primary School (G1-5)">Primary School (G1-5)</option>
                <option value="Middle School (G6-8)">Middle School (G6-8)</option>
                <option value="High School (G9-12)">High School (G9-12)</option>
              </select>
            </div>
            <div class="ac-span2">
              <label class="ac-label">Course Description</label>
              <input type="text" name="description" [(ngModel)]="newCourse.description" required placeholder="Detailed description of what is covered..." class="ac-input" />
            </div>
            <div class="ac-span2-actions">
              <div class="ac-flex-grow">
                <label class="ac-label">Syllabus Outline / Key Topics (Optional)</label>
                <input type="text" name="syllabusSummary" [(ngModel)]="newCourse.syllabusSummary" placeholder="e.g. Mechanics, Thermodynamics, Quantum Basics" class="ac-input" />
              </div>
              <button type="submit" [disabled]="!courseForm.form.valid" class="ds-btn ds-btn-primary">
                Add Course
              </button>
            </div>
          </form>

          <h3 class="ds-heading ac-list-title">Current Courses</h3>
          @if (courses().length === 0) {
            <p class="ac-empty-msg">No courses have been added to this school yet.</p>
          } @else {
             <div class="mobile-grid-1 ac-grid">
              @for (c of courses(); track c.id) {
                <div class="ds-card ds-card-hover ac-course-card">
                  <div>
                    <div class="ac-course-head">
                      <strong class="ac-course-name">{{ c.name }}</strong>
                      <span class="ac-badge">{{ c.gradeLevel }}</span>
                    </div>
                    <p class="ac-course-desc">{{ c.description }}</p>
                    @if (c.syllabusSummary) {
                      <div class="ac-syllabus">Syllabus: {{ c.syllabusSummary }}</div>
                    }
                  </div>
                  <div class="ac-course-footer">
                    <button (click)="deleteCourse(c.id!)" class="ds-btn ds-btn-danger ac-btn-sm">
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
          <h3 class="ds-heading ac-section-title">Add New Faculty Member</h3>
          
          <form (ngSubmit)="addFaculty()" #facultyForm="ngForm" class="mobile-grid-1 ac-form">
            <div>
              <label class="ac-label">Full Name</label>
              <input type="text" name="name" [(ngModel)]="newFaculty.name" required placeholder="e.g. Dr. Arthur Pendragon" class="ac-input" />
            </div>
            <div>
              <label class="ac-label">Designation / Department</label>
              <input type="text" name="designation" [(ngModel)]="newFaculty.designation" required placeholder="e.g. Head of Science Department" class="ac-input" />
            </div>
            <div>
              <label class="ac-label">Academic Qualifications</label>
              <input type="text" name="qualification" [(ngModel)]="newFaculty.qualification" required placeholder="e.g. Ph.D. in Theoretical Chemistry" class="ac-input" />
            </div>
            <div>
              <label class="ac-label">Short Bio</label>
              <input type="text" name="bio" [(ngModel)]="newFaculty.bio" required placeholder="e.g. Passionate researcher with over 15 years teaching..." class="ac-input" />
            </div>
            <div class="ac-form-footer">
              <button type="submit" [disabled]="!facultyForm.form.valid" class="ds-btn ds-btn-primary">
                Add Faculty Member
              </button>
            </div>
          </form>

          <h3 class="ds-heading ac-list-title">Our Faculty List</h3>
          @if (faculty().length === 0) {
            <p class="ac-empty-msg">No faculty members have been added to this school yet.</p>
          } @else {
             <div class="mobile-grid-1 ac-grid">
              @for (f of faculty(); track f.id) {
                <div class="ds-card ds-card-hover ac-faculty-card">
                  <div class="ac-faculty-info">
                    <div class="ac-avatar">
                      👨‍🏫
                    </div>
                    <div>
                      <strong class="ac-faculty-name">{{ f.name }}</strong>
                      <span class="ac-faculty-designation">{{ f.designation }}</span>
                      <span class="ac-faculty-qual">Qualifications: {{ f.qualification }}</span>
                      <p class="ac-faculty-bio">{{ f.bio }}</p>
                    </div>
                  </div>
                  <button (click)="deleteFaculty(f.id!)" class="ds-btn ds-btn-danger ac-btn-sm-nowrap">
                    🗑️ Remove
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './academics-manager.component.scss'
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
