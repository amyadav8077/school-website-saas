-- Scale indexes: at 100 schools x ~2000 students the student-scoped tables grow
-- into the hundreds of thousands of rows. Without these, every tenant-scoped
-- lookup is a full table scan. These indexes mirror the repository finders so
-- the hot paths (grade/invoice/TC lookups, admissions) become index seeks.

-- Student grades
CREATE INDEX IF NOT EXISTS idx_student_grades_tenant ON student_grades (tenant_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_tenant_class_section
    ON student_grades (tenant_id, class_level, section);

-- Student invoices
CREATE INDEX IF NOT EXISTS idx_student_invoices_tenant ON student_invoices (tenant_id);
CREATE INDEX IF NOT EXISTS idx_student_invoices_tenant_grade_section
    ON student_invoices (tenant_id, grade_level, section);

-- Transfer certificates
CREATE INDEX IF NOT EXISTS idx_transfer_certificates_tenant ON transfer_certificates (tenant_id);
CREATE INDEX IF NOT EXISTS idx_transfer_certificates_tenant_class_section
    ON transfer_certificates (tenant_id, class_level, section);
CREATE INDEX IF NOT EXISTS idx_transfer_certificates_tenant_admission
    ON transfer_certificates (tenant_id, admission_no);

-- Admission leads
CREATE INDEX IF NOT EXISTS idx_admission_leads_tenant ON admission_leads (tenant_id);

-- Fee items
CREATE INDEX IF NOT EXISTS idx_fee_items_tenant ON fee_items (tenant_id);

-- Public catalog / notification tables (rendered on the website)
CREATE INDEX IF NOT EXISTS idx_academic_courses_tenant ON academic_courses (tenant_id);
CREATE INDEX IF NOT EXISTS idx_academic_programs_tenant ON academic_programs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_faculty_members_tenant ON faculty_members (tenant_id);
CREATE INDEX IF NOT EXISTS idx_student_achievers_tenant ON student_achievers (tenant_id);
CREATE INDEX IF NOT EXISTS idx_school_news_tenant ON school_news (tenant_id);
CREATE INDEX IF NOT EXISTS idx_school_events_tenant ON school_events (tenant_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_tenant ON gallery_items (tenant_id);
CREATE INDEX IF NOT EXISTS idx_pages_tenant ON pages (tenant_id);
