import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Tenant, SiteConfig, SchoolPage, PageSection,
  AdmissionLead, FacultyMember, AcademicCourse, AcademicProgram,
  FeeItem, StudentInvoice, StudentGrade, SchoolEvent, SchoolNews,
  GalleryItem, StudentAchiever, SchoolBranch, EnrichmentActivity,
  BoardResult, TransferCertificate, JobPosting, JobApplication,
  SupportInquiry
} from '../models/models';

const BASE = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class SchoolApiService {
  private readonly http = inject(HttpClient);

  // ── Health ────────────────────────────────────────────────────────────────
  getHealth(): Observable<{ status: string; message: string }> {
    return this.http.get<{ status: string; message: string }>(`${BASE}/health`);
  }

  // ── Tenants ───────────────────────────────────────────────────────────────
  getAllTenants(): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/admin/tenants`);
  }

  onboardTenant(body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/tenants`, body);
  }

  cloneTenant(sourceTenantId: number, name: string, subdomain: string): Observable<any> {
    return this.http.post<any>(
      `${BASE}/admin/tenants/${sourceTenantId}/clone?name=${encodeURIComponent(name)}&subdomain=${encodeURIComponent(subdomain)}`,
      {}
    );
  }

  // ── Site Config ───────────────────────────────────────────────────────────
  getSiteConfig(subdomain: string): Observable<any> {
    return this.http.get<any>(`${BASE}/sites/${subdomain}/config`);
  }

  updateSiteConfig(tenantId: number, body: any): Observable<any> {
    return this.http.put<any>(`${BASE}/sites/${tenantId}/config`, body);
  }

  // ── Pages ─────────────────────────────────────────────────────────────────
  getPages(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/pages`);
  }

  createPage(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/sites/${tenantId}/pages`, body);
  }

  updatePageSections(pageId: number, sections: PageSection[]): Observable<any> {
    return this.http.put<any>(`${BASE}/sites/pages/${pageId}/sections`, sections);
  }

  deletePage(pageId: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/sites/pages/${pageId}`);
  }

  // ── Admissions ────────────────────────────────────────────────────────────
  submitAdmission(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/sites/${tenantId}/admissions`, body);
  }

  getAdmissions(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/admin/sites/${tenantId}/admissions`);
  }

  updateAdmissionStatus(leadId: number, status: string): Observable<any> {
    return this.http.put<any>(`${BASE}/admin/admissions/${leadId}/status?status=${status}`, {});
  }

  // ── Academics ─────────────────────────────────────────────────────────────
  getCourses(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/courses`);
  }

  createCourse(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/courses`, body);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/courses/${id}`);
  }

  getPrograms(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/programs`);
  }

  createProgram(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/programs`, body);
  }

  deleteProgram(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/programs/${id}`);
  }

  getFaculty(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/faculty`);
  }

  createFaculty(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/faculty`, body);
  }

  deleteFaculty(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/faculty/${id}`);
  }

  getAchievers(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/achievers`);
  }

  createAchiever(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/achievers`, body);
  }

  deleteAchiever(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/achievers/${id}`);
  }

  getGallery(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/gallery`);
  }

  createGalleryItem(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/gallery`, body);
  }

  deleteGalleryItem(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/gallery/${id}`);
  }

  getBranches(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/branches`);
  }

  createBranch(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/branches`, body);
  }

  deleteBranch(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/branches/${id}`);
  }

  getEnrichment(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/enrichment`);
  }

  createEnrichmentActivity(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/enrichment`, body);
  }

  deleteEnrichmentActivity(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/enrichment/${id}`);
  }

  getBoardResults(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/board-results`);
  }

  createBoardResult(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/board-results`, body);
  }

  deleteBoardResult(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/board-results/${id}`);
  }

  // ── Billing ───────────────────────────────────────────────────────────────
  getFeeItems(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/fees`);
  }

  createFeeItem(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/fees`, body);
  }

  getInvoices(tenantId: number, studentName?: string, gradeLevel?: string, section?: string): Observable<any[]> {
    let url = `${BASE}/sites/${tenantId}/invoices`;
    const params: string[] = [];
    if (studentName) params.push(`studentName=${encodeURIComponent(studentName)}`);
    if (gradeLevel) params.push(`gradeLevel=${encodeURIComponent(gradeLevel)}`);
    if (section) params.push(`section=${encodeURIComponent(section)}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<any[]>(url);
  }

  generateInvoice(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/invoices`, body);
  }

  payInvoice(id: number): Observable<any> {
    return this.http.put<any>(`${BASE}/sites/invoices/${id}/pay`, {});
  }

  // ── Grades ────────────────────────────────────────────────────────────────
  getGrades(tenantId: number, studentName?: string, classLevel?: string, section?: string): Observable<any[]> {
    let url = `${BASE}/sites/${tenantId}/grades`;
    const params: string[] = [];
    if (studentName) params.push(`studentName=${encodeURIComponent(studentName)}`);
    if (classLevel) params.push(`classLevel=${encodeURIComponent(classLevel)}`);
    if (section) params.push(`section=${encodeURIComponent(section)}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<any[]>(url);
  }

  addGrade(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/grades`, body);
  }

  deleteGrade(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/grades/${id}`);
  }

  // ── Notifications ─────────────────────────────────────────────────────────
  getNews(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/news`);
  }

  createNews(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/news`, body);
  }

  deleteNews(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/news/${id}`);
  }

  getEvents(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/events`);
  }

  createEvent(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/events`, body);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/events/${id}`);
  }

  // ── Support ───────────────────────────────────────────────────────────────
  submitSupportInquiry(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/sites/${tenantId}/support`, body);
  }

  getSupportInquiries(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/admin/sites/${tenantId}/support`);
  }

  resolveInquiry(id: number, notes: string): Observable<any> {
    return this.http.put<any>(`${BASE}/admin/support/${id}/resolve?notes=${encodeURIComponent(notes)}`, {});
  }

  // ── Transfer Certificates ─────────────────────────────────────────────────
  searchTC(tenantId: number, params: any): Observable<any[]> {
    const q = new URLSearchParams();
    if (params.studentName) q.set('studentName', params.studentName);
    if (params.classLevel) q.set('classLevel', params.classLevel);
    if (params.section) q.set('section', params.section);
    if (params.admissionNo) q.set('admissionNo', params.admissionNo);
    if (params.fatherName) q.set('fatherName', params.fatherName);
    if (params.aadharNo) q.set('aadharNo', params.aadharNo);
    const qs = q.toString();
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/tc${qs ? '?' + qs : ''}`);
  }

  getIssuedTCs(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/admin/sites/${tenantId}/tc`);
  }

  issueTC(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/tc`, body);
  }

  deleteTC(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/tc/${id}`);
  }

  // ── Careers ───────────────────────────────────────────────────────────────
  getJobPostings(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/sites/${tenantId}/jobs`);
  }

  applyForJob(tenantId: number, jobId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/sites/${tenantId}/jobs/${jobId}/apply`, body);
  }

  getApplications(tenantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${BASE}/admin/sites/${tenantId}/applications`);
  }

  updateApplicationStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${BASE}/admin/applications/${id}/status?status=${status}`, {});
  }

  createJobPosting(tenantId: number, body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/admin/sites/${tenantId}/jobs`, body);
  }

  deleteJobPosting(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/admin/jobs/${id}`);
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  login(body: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${BASE}/auth/login`, body);
  }

  getTenantAdmin(tenantId: number): Observable<any> {
    return this.http.get<any>(`${BASE}/auth/tenant-admins/${tenantId}`);
  }

  createOrUpdateTenantAdmin(body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/auth/tenant-admins`, body);
  }

  changePassword(body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/auth/change-password`, body);
  }

  requestOtp(contact: string): Observable<any> {
    return this.http.post<any>(`${BASE}/auth/forgot-password/request`, { contact });
  }

  resetPassword(body: any): Observable<any> {
    return this.http.post<any>(`${BASE}/auth/forgot-password/reset`, body);
  }
}
