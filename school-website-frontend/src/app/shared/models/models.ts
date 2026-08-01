export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  customDomain?: string;
  status: string;
  createdAt?: string;
}

export interface SiteConfig {
  id?: number;
  tenantId: number;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  themeName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: string;
}

export interface SchoolPage {
  id: number;
  tenantId: number;
  title: string;
  slug: string;
  status: string;
  metaTitle?: string;
  metaDescription?: string;
  sections: PageSection[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PageSection {
  id?: number;
  type: string;
  positionOrder: number;
  config: string;
}

export interface AdmissionLead {
  id?: number;
  tenantId?: number;
  studentName: string;
  gradeLevel: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  status?: string;
  message?: string;
  createdAt?: string;
}

export interface FacultyMember {
  id?: number;
  tenantId?: number;
  name: string;
  designation: string;
  qualification: string;
  bio?: string;
  imageUrl?: string;
}

export interface AcademicCourse {
  id?: number;
  tenantId?: number;
  name: string;
  gradeLevel: string;
  description: string;
  syllabusSummary?: string;
}

export interface AcademicProgram {
  id?: number;
  tenantId?: number;
  name: string;
  type: string;
  description: string;
  details?: string;
  ctaUrl?: string;
}

export interface FeeItem {
  id?: number;
  tenantId?: number;
  name: string;
  amount: number;
  description?: string;
  gradeLevel?: string;
}

export interface StudentInvoice {
  id?: number;
  tenantId?: number;
  studentName: string;
  admissionNo?: string;
  gradeLevel: string;
  section?: string;
  fatherName?: string;
  aadharNo?: string;
  feeItemName: string;
  amount: number;
  status: string;
  dueDate?: string;
  paymentDate?: string;
}

export interface StudentGrade {
  id?: number;
  tenantId?: number;
  studentName: string;
  admissionNo?: string;
  classLevel?: string;
  section?: string;
  fatherName?: string;
  aadharNo?: string;
  subjectName: string;
  term: string;
  grade: string;
  remarks?: string;
  createdAt?: string;
}

export interface SchoolEvent {
  id?: number;
  tenantId?: number;
  title: string;
  description: string;
  eventDate: string;
  location: string;
}

export interface SchoolNews {
  id?: number;
  tenantId?: number;
  title: string;
  content: string;
  author: string;
  publishedDate?: string;
}

export interface GalleryItem {
  id?: number;
  tenantId?: number;
  type: string;
  title: string;
  mediaUrl: string;
  category: string;
}

export interface StudentAchiever {
  id?: number;
  tenantId?: number;
  name: string;
  score: string;
  courseName: string;
  testimonialText: string;
  imageUrl?: string;
}

export interface SchoolBranch {
  id?: number;
  tenantId?: number;
  name: string;
  state: string;
  city: string;
  address: string;
  contactEmail: string;
  phone: string;
}

export interface EnrichmentActivity {
  id?: number;
  tenantId?: number;
  title: string;
  type: string;
  description: string;
  details?: string;
  imageUrl?: string;
}

export interface BoardResult {
  id?: number;
  tenantId?: number;
  classLevel: string;
  assessmentYear: number;
  registeredStudents: number;
  passedStudents: number;
  passPercentage: number;
  remarks?: string;
}

export interface TransferCertificate {
  id?: number;
  tenantId?: number;
  studentName: string;
  admissionNo: string;
  classLevel: string;
  section: string;
  fatherName: string;
  aadharNo: string;
  tcNumber: string;
  issueDate: string;
  pdfUrl?: string;
}

export interface JobPosting {
  id?: number;
  tenantId?: number;
  title: string;
  department: string;
  qualification: string;
  experience: string;
  description: string;
}

export interface JobApplication {
  id?: number;
  tenantId?: number;
  jobId?: number;
  jobTitle?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  status?: string;
}

export interface SupportInquiry {
  id?: number;
  tenantId?: number;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  status?: string;
  resolutionNotes?: string;
}

export interface AdminUser {
  username: string;
  role: string;
  tenantId?: number;
  tenantName?: string;
  subdomain?: string;
}
