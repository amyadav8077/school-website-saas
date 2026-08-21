package com.schoolwebsite.backend.config;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.schoolwebsite.backend.academics.entity.AcademicCourse;
import com.schoolwebsite.backend.academics.entity.AcademicProgram;
import com.schoolwebsite.backend.academics.entity.BoardResult;
import com.schoolwebsite.backend.academics.entity.EnrichmentActivity;
import com.schoolwebsite.backend.academics.entity.FacultyMember;
import com.schoolwebsite.backend.academics.entity.GalleryItem;
import com.schoolwebsite.backend.academics.entity.JobApplication;
import com.schoolwebsite.backend.academics.entity.JobPosting;
import com.schoolwebsite.backend.academics.entity.SchoolBranch;
import com.schoolwebsite.backend.academics.entity.StudentAchiever;
import com.schoolwebsite.backend.academics.entity.TransferCertificate;
import com.schoolwebsite.backend.academics.repository.AcademicCourseRepository;
import com.schoolwebsite.backend.academics.repository.AcademicProgramRepository;
import com.schoolwebsite.backend.academics.repository.BoardResultRepository;
import com.schoolwebsite.backend.academics.repository.EnrichmentActivityRepository;
import com.schoolwebsite.backend.academics.repository.FacultyMemberRepository;
import com.schoolwebsite.backend.academics.repository.GalleryItemRepository;
import com.schoolwebsite.backend.academics.repository.JobApplicationRepository;
import com.schoolwebsite.backend.academics.repository.JobPostingRepository;
import com.schoolwebsite.backend.academics.repository.SchoolBranchRepository;
import com.schoolwebsite.backend.academics.repository.StudentAchieverRepository;
import com.schoolwebsite.backend.academics.repository.TransferCertificateRepository;
import com.schoolwebsite.backend.admissions.entity.AdmissionLead;
import com.schoolwebsite.backend.admissions.repository.AdmissionLeadRepository;
import com.schoolwebsite.backend.auth.entity.AdminUser;
import com.schoolwebsite.backend.auth.repository.AdminUserRepository;
import com.schoolwebsite.backend.billing.entity.FeeItem;
import com.schoolwebsite.backend.billing.entity.StudentInvoice;
import com.schoolwebsite.backend.billing.repository.FeeItemRepository;
import com.schoolwebsite.backend.billing.repository.StudentInvoiceRepository;
import com.schoolwebsite.backend.grades.entity.StudentGrade;
import com.schoolwebsite.backend.grades.repository.StudentGradeRepository;
import com.schoolwebsite.backend.notifications.entity.SchoolEvent;
import com.schoolwebsite.backend.notifications.entity.SchoolNews;
import com.schoolwebsite.backend.notifications.repository.SchoolEventRepository;
import com.schoolwebsite.backend.notifications.repository.SchoolNewsRepository;
import com.schoolwebsite.backend.pagebuilder.entity.Page;
import com.schoolwebsite.backend.pagebuilder.entity.PageSection;
import com.schoolwebsite.backend.pagebuilder.repository.PageRepository;
import com.schoolwebsite.backend.pagebuilder.repository.PageSectionRepository;
import com.schoolwebsite.backend.siteconfiguration.entity.SiteConfig;
import com.schoolwebsite.backend.siteconfiguration.repository.SiteConfigRepository;
import com.schoolwebsite.backend.support.entity.SupportInquiry;
import com.schoolwebsite.backend.support.repository.SupportInquiryRepository;
import com.schoolwebsite.backend.tenantsubscription.entity.Tenant;
import com.schoolwebsite.backend.tenantsubscription.repository.TenantRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {
    private final TenantRepository tenantRepository;

    private final SiteConfigRepository siteConfigRepository;

    private final AdminUserRepository adminUserRepository;

    private final PasswordEncoder passwordEncoder;

    private final PageRepository pageRepository;

    private final PageSectionRepository pageSectionRepository;

    private final AcademicCourseRepository courseRepository;

    private final FacultyMemberRepository facultyRepository;

    private final AcademicProgramRepository programRepository;

    private final StudentAchieverRepository achieverRepository;

    private final GalleryItemRepository galleryRepository;

    private final SchoolBranchRepository branchRepository;

    private final EnrichmentActivityRepository enrichmentRepository;

    private final BoardResultRepository boardResultRepository;

    private final TransferCertificateRepository tcRepository;

    private final JobPostingRepository jobRepository;

    private final JobApplicationRepository applicationRepository;

    private final StudentInvoiceRepository invoiceRepository;

    private final FeeItemRepository feeItemRepository;

    private final AdmissionLeadRepository admissionRepository;

    private final SupportInquiryRepository supportRepository;

    private final StudentGradeRepository gradeRepository;

    private final SchoolNewsRepository newsRepository;

    private final SchoolEventRepository eventRepository;

    /**
     * When true, an existing "pioneer" tenant (and all its cascaded data) is
     * deleted on startup so the seeder re-runs and inserts the latest full
     * dataset. Set env var SEED_FORCE_REFRESH=true for a one-time refresh, then
     * remove/set it back to false to avoid wiping data on every restart.
     */
    @Value("${seed.force-refresh:false}")
    private boolean forceRefresh;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (adminUserRepository.findByUsername("admin").isEmpty()) {
            adminUserRepository.save(AdminUser.builder().username("admin").password(passwordEncoder.encode("admin123"))
                    .role("SUPER_ADMIN").email("admin@schoolsaas.com").phoneNumber("+15550199000").build());

        }

        if (forceRefresh && tenantRepository.existsBySubdomain("pioneer")) {
            Long oldId = tenantRepository.findBySubdomain("pioneer").map(Tenant::getId).orElse(null);
            System.out.println("[DatabaseSeeder] SEED_FORCE_REFRESH is enabled — "
                    + "deleting existing 'pioneer' tenant (id=" + oldId + ") and all cascaded data for a full reseed.");
            tenantRepository.findBySubdomain("pioneer").ifPresent(t -> tenantRepository.deleteById(t.getId()));
            tenantRepository.flush();
        }

        if (!tenantRepository.existsBySubdomain("pioneer")) {

            // ── TENANT ────────────────────────────────────────────────────
            Tenant tenant = tenantRepository
                    .save(Tenant.builder().name("SaaS Pioneer Academy").subdomain("pioneer").status("ACTIVE").build());
            Long tid = tenant.getId();

            adminUserRepository.save(AdminUser.builder().username("pioneer_admin")
                    .password(passwordEncoder.encode("pioneer123")).role("TENANT_ADMIN").tenantId(tid)
                    .email("admin@pioneer.edu").phoneNumber("+914010233440").build());

            // ── SITE CONFIG ───────────────────────────────────────────────
            siteConfigRepository.save(SiteConfig.builder().tenantId(tid).logoUrl("🎓").themeName("ROYAL_NAVY")
                    .primaryColor("#1e3a8a").secondaryColor("#991b1b").accentColor("#fbbf24").fontFamily("Inter")
                    .contactEmail("admissions@pioneer.edu").contactPhone("+91 40 1023 3440")
                    .socialLinks(
                            "{\"enabled\":true,\"text\":\"🎉 Admissions OPEN for 2026-27! Limited seats — Register your child today.\",\"direction\":\"left\",\"buttonText\":\"Apply Now!\",\"pageSlug\":\"admissions\",\"facebookUrl\":\"https://www.facebook.com/pioneeracademy\",\"instagramUrl\":\"https://www.instagram.com/pioneeracademy\",\"twitterUrl\":\"https://twitter.com/pioneeracademy\",\"youtubeUrl\":\"https://www.youtube.com/user/pioneeracademy\",\"googleMapUrl\":\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.18349141639!2d78.3820256!3d17.4485535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x1968805474a123bc!2sMadhapur%2C%20Hyderabad!5e0!3m2!1sen!2sin!4v1721380000000\",\"promoEnabled\":true,\"promoVideoUrl\":\"https://www.w3schools.com/html/mov_bbb.mp4\",\"promoPosterUrl\":\"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop\",\"promoTitle\":\"Admission\",\"promoSubtitle\":\"Open For 2026-27\",\"promoProcessText\":\"Begin your journey with SaaS Pioneer Academy. Our streamlined admission process makes it simple to join our vibrant community of learners.\",\"promoRequirementsText\":\"Please keep the following documents ready before you apply.\",\"promoRequirements\":[\"Completed application form\",\"Birth certificate copy\",\"Previous academic records\",\"Passport-size photographs\"],\"promoPhone\":\"+91 40 1023 3440\",\"promoWebsite\":\"www.pioneeracademy.edu\",\"promoAccent\":\"#d95d41\",\"promoCtaText\":\"Apply Now\",\"promoCtaSlug\":\"admissions\"}")
                    .build());

            // ── CMS PAGES ─────────────────────────────────────────────────

            // HOME PAGE — 8 rich sections
            Page home = pageRepository
                    .save(Page.builder().tenantId(tid).title("Home").slug("home").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(home.getId()).type("HERO").positionOrder(1).config(
                    "{\"title\":\"Nurturing Potential, Inspiring Excellence\",\"subtitle\":\"Welcome to SaaS Pioneer Academy — where high-tech labs, championship athletics, and world-class mentorship shape tomorrow's leaders.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(home.getId()).type("CAROUSEL").positionOrder(2)
                    .config("{\"images\":["
                            + "{\"url\":\"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80\",\"caption\":\"Iconic Campus & Architecture\",\"subtitle\":\"A sprawling, green campus designed to inspire curiosity and calm.\"},"
                            + "{\"url\":\"https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80\",\"caption\":\"Collaborative Learning Spaces\",\"subtitle\":\"Bright, modern classrooms built for interactive, concept-driven learning.\"},"
                            + "{\"url\":\"https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80\",\"caption\":\"High-Tech STEM Laboratories\",\"subtitle\":\"Industry-grade labs, robotics stations and 3D printing studios.\"},"
                            + "{\"url\":\"https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1600&q=80\",\"caption\":\"Vibrant Library & Reading Halls\",\"subtitle\":\"Thousands of titles and quiet corners for deep focus.\"},"
                            + "{\"url\":\"https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80\",\"caption\":\"Championship Athletics\",\"subtitle\":\"Synthetic tracks, courts and certified coaches for every sport.\"},"
                            + "{\"url\":\"https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=80\",\"caption\":\"A Culture of Reading & Research\",\"subtitle\":\"Nurturing lifelong learners through literature and inquiry.\"},"
                            + "{\"url\":\"https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=1600&q=80\",\"caption\":\"Robotics & Innovation Studios\",\"subtitle\":\"Where students design, build and program the future.\"},"
                            + "{\"url\":\"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80\",\"caption\":\"Smart Digital Classrooms\",\"subtitle\":\"Interactive boards and immersive learning for every subject.\"},"
                            + "{\"url\":\"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80\",\"caption\":\"Vibrant Community & Events\",\"subtitle\":\"Festivals, competitions and celebrations that build character.\"},"
                            + "{\"url\":\"https://images.unsplash.com/photo-1567168539593-59673ababaae?auto=format&fit=crop&w=1600&q=80\",\"caption\":\"Modern Science & Chemistry Labs\",\"subtitle\":\"Hands-on experimentation with industry-grade apparatus.\"}"
                            + "]}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(home.getId()).type("FEATURES").positionOrder(3)
                    .config("{\"f1_title\":\"STEM & Robotics Labs\",\"f1_desc\":\"Industry-grade hardware and 3D printing stations\",\"f2_title\":\"Championship Athletics\",\"f2_desc\":\"Synthetic tracks, courts and certified coaches\",\"f3_title\":\"Smart Classrooms\",\"f3_desc\":\"Interactive digital boards and climate-controlled halls\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(home.getId()).type("INTRO").positionOrder(4).config(
                    "{\"title\":\"About Pioneer Academy\",\"body\":\"SaaS Pioneer Academy has been a trailblazer in holistic, concept-driven learning since its founding. We combine certified mentors, top board curricula, and a comprehensive student development system to create an unparalleled environment for tomorrow's achievers. Our campus features high-tech science & computer labs, virtual visual auditoriums, world-class athletic facilities, and dedicated IIT-JEE and NEET coaching wings.\",\"imgUrl\":\"https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(home.getId()).type("FOUNDERS").positionOrder(5)
                    .config("{\"title\":\"Our Visionary Leadership\",\"founders\":[{\"name\":\"Dr. Arthur Pendragon\",\"role\":\"Founder & Managing Director\",\"bio\":\"25+ years in secondary pedagogy. Arthur's vision: concept clarity above rote memorization.\",\"photoUrl\":\"https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80\"},{\"name\":\"Prof. Guinevere Vance\",\"role\":\"Co-Founder & Academic Dean\",\"bio\":\"Designs core logic curriculum and rank acceleration models across all sister branches.\",\"photoUrl\":\"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80\"},{\"name\":\"Mr. Lancelot Sharma\",\"role\":\"Director of Sports & Athletics\",\"bio\":\"Former national-level athlete who built Pioneer's championship sports infrastructure from the ground up.\",\"photoUrl\":\"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80\"}]}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(home.getId()).type("FACILITIES").positionOrder(6)
                    .config("{\"title\":\"World-Class Infrastructure\",\"facilities\":[{\"title\":\"STEM & Robotics Hub\",\"description\":\"High-tech microprocessors, 3D printing labs, and interactive programming kits for hands-on innovation.\",\"photoUrl\":\"https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=500&q=80\"},{\"title\":\"Championship Athletics Arena\",\"description\":\"State-of-the-art synthetic tracks, multi-sport courts, and professional training coaches on-site.\",\"photoUrl\":\"https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=500&q=80\"},{\"title\":\"Smart Digitized Classrooms\",\"description\":\"Climate-controlled spaces with responsive touch-screens and high-fidelity sound systems.\",\"photoUrl\":\"https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=500&q=80\"},{\"title\":\"Science & Chemistry Labs\",\"description\":\"Fully equipped with modern apparatus, safety stations, and live demonstration setups.\",\"photoUrl\":\"https://images.unsplash.com/photo-1567168539593-59673ababaae?auto=format&fit=crop&w=500&q=80\"}]}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(home.getId()).type("VIDEO").positionOrder(7).config(
                    "{\"title\":\"Pioneer Academy — Virtual Campus Tour\",\"video_url\":\"https://www.youtube.com/embed/dQw4w9WgXcQ\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(home.getId()).type("PHOTO_GRID").positionOrder(8)
                    .config("{\"title\":\"Campus Life in Pictures\",\"photos\":[{\"url\":\"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80\",\"caption\":\"Science Fair Project Exhibition\",\"category\":\"ACADEMICS\"},{\"url\":\"https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80\",\"caption\":\"Inter-Branch Football Finals\",\"category\":\"SPORTS\"},{\"url\":\"https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80\",\"caption\":\"Annual Day Orchestral Symphony\",\"category\":\"CULTURAL\"},{\"url\":\"https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80\",\"caption\":\"Graduation Ceremony 2025\",\"category\":\"CAMPUS\"},{\"url\":\"https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=80\",\"caption\":\"NEET Topper Felicitation\",\"category\":\"ACADEMICS\"},{\"url\":\"https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=400&q=80\",\"caption\":\"Robotics Club Innovation Expo\",\"category\":\"ACADEMICS\"}]}")
                    .build());

            // ADMISSIONS PAGE
            Page adm = pageRepository.save(
                    Page.builder().tenantId(tid).title("Admissions").slug("admissions").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(adm.getId()).type("HERO").positionOrder(1).config(
                    "{\"title\":\"Secure Your Child's Academic Future\",\"subtitle\":\"Admissions for the cohort 2026-27 are officially open. Limited seats available — register your interest today.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(adm.getId()).type("FEATURES").positionOrder(2)
                    .config("{\"f1_title\":\"Step 1: Submit Inquiry\",\"f1_desc\":\"Fill in the admissions form below with your child's details\",\"f2_title\":\"Step 2: Assessment\",\"f2_desc\":\"Attend a brief aptitude assessment on campus\",\"f3_title\":\"Step 3: Confirmation\",\"f3_desc\":\"Receive seat confirmation and complete enrollment\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(adm.getId()).type("NOTICES").positionOrder(3)
                    .config("{\"title\":\"Important Admission Dates\",\"notices\":[{\"text\":\"Online registration closes: August 31, 2026\"},{\"text\":\"Aptitude assessments: September 5-10, 2026\"},{\"text\":\"Results announced: September 15, 2026\"},{\"text\":\"Fee payment deadline: September 25, 2026\"}]}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(adm.getId()).type("DISCLOSURES").positionOrder(4)
                    .config("{\"title\":\"Board Compliances & Affiliation\",\"link1_text\":\"View CBSE Affiliation Certificate (PDF)\",\"link2_text\":\"View School Recognition Order\"}")
                    .build());

            // ACADEMICS / COURSES PAGE
            Page courses = pageRepository
                    .save(Page.builder().tenantId(tid).title("Academics").slug("courses").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(courses.getId()).type("HERO").positionOrder(1)
                    .config("{\"title\":\"Comprehensive Academic Programs\",\"subtitle\":\"From foundational primary education to competitive entrance coaching — we cover every stage of a student's academic journey.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(courses.getId()).type("FEATURES").positionOrder(2)
                    .config("{\"f1_title\":\"CBSE Curriculum\",\"f1_desc\":\"Aligned with latest NCERT and CBSE board syllabus\",\"f2_title\":\"Competitive Coaching\",\"f2_desc\":\"Dedicated IIT-JEE, NEET and Olympiad preparation\",\"f3_title\":\"Skill Development\",\"f3_desc\":\"Coding, robotics and entrepreneurship tracks\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(courses.getId()).type("NOTICES").positionOrder(3)
                    .config("{\"title\":\"Academic Calendar Highlights\",\"notices\":[{\"text\":\"Term 1: June – September 2026\"},{\"text\":\"Mid-term Exams: August 2026\"},{\"text\":\"Term 2: October – February 2027\"},{\"text\":\"Board Practical Exams: January 2027\"},{\"text\":\"Annual Exams: March 2027\"}]}")
                    .build());

            // FACULTY PAGE
            Page faculty = pageRepository
                    .save(Page.builder().tenantId(tid).title("Faculty").slug("faculty").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(faculty.getId()).type("HERO").positionOrder(1)
                    .config("{\"title\":\"Meet Our Expert Faculty\",\"subtitle\":\"Our team of 120+ dedicated educators brings decades of academic excellence, research experience, and student-first mentorship.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(faculty.getId()).type("FEATURES").positionOrder(2)
                    .config("{\"f1_title\":\"120+ Educators\",\"f1_desc\":\"Across all subjects and grade levels\",\"f2_title\":\"PhD & Masters\",\"f2_desc\":\"85% of faculty hold postgraduate or doctoral degrees\",\"f3_title\":\"Avg 12 Years\",\"f3_desc\":\"Average teaching experience per faculty member\"}")
                    .build());

            // FEES PAGE
            Page fees = pageRepository.save(
                    Page.builder().tenantId(tid).title("Fees & Payments").slug("fees").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(fees.getId()).type("HERO").positionOrder(1).config(
                    "{\"title\":\"Fee Structure & Online Payments\",\"subtitle\":\"Transparent, structured fee schedules with secure online payment options for all grades.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(fees.getId()).type("FEATURES").positionOrder(2)
                    .config("{\"f1_title\":\"Online Payment\",\"f1_desc\":\"Pay tuition, bus and activity fees securely below\",\"f2_title\":\"EMI Options\",\"f2_desc\":\"Quarterly and half-yearly payment schedules available\",\"f3_title\":\"Scholarships\",\"f3_desc\":\"Merit-based fee waivers up to 100% for toppers\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(fees.getId()).type("NOTICES").positionOrder(3)
                    .config("{\"title\":\"Fee Payment Guidelines\",\"notices\":[{\"text\":\"Term 1 fees due by June 30, 2026\"},{\"text\":\"Late payment attracts 2% per month penalty\"},{\"text\":\"Contact accounts@pioneer.edu for payment receipts\"},{\"text\":\"Scholarship applications open until May 31, 2026\"}]}")
                    .build());

            // CONTACT PAGE
            Page contact = pageRepository
                    .save(Page.builder().tenantId(tid).title("Contact Us").slug("contact").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(contact.getId()).type("HERO").positionOrder(1)
                    .config("{\"title\":\"Get In Touch With Us\",\"subtitle\":\"We are here to answer all your questions about admissions, academics, fees, and campus life.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(contact.getId()).type("FEATURES").positionOrder(2)
                    .config("{\"f1_title\":\"Admissions Office\",\"f1_desc\":\"admissions@pioneer.edu | +91 40 1023 3440\",\"f2_title\":\"Principal Office\",\"f2_desc\":\"principal@pioneer.edu | +91 40 1023 3441\",\"f3_title\":\"Accounts Dept\",\"f3_desc\":\"accounts@pioneer.edu | +91 40 1023 3442\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(contact.getId()).type("NOTICES").positionOrder(3)
                    .config("{\"title\":\"Office Hours\",\"notices\":[{\"text\":\"Monday – Friday: 8:00 AM – 5:00 PM\"},{\"text\":\"Saturday: 9:00 AM – 1:00 PM (Admissions only)\"},{\"text\":\"Sunday & Public Holidays: Closed\"},{\"text\":\"Emergency contact: +91 98765 43210\"}]}")
                    .build());

            // NEWS & EVENTS PAGE
            Page news = pageRepository
                    .save(Page.builder().tenantId(tid).title("News & Events").slug("news").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(news.getId()).type("HERO").positionOrder(1).config(
                    "{\"title\":\"Latest News & Upcoming Events\",\"subtitle\":\"Stay updated with school announcements, circulars, event schedules, and achievement highlights.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(news.getId()).type("NOTICES").positionOrder(2)
                    .config("{\"title\":\"Quick Announcements\",\"notices\":[{\"text\":\"PTM scheduled for August 15, 2026 — All parents must attend\"},{\"text\":\"Annual Sports Day: September 20, 2026 at Main Ground\"},{\"text\":\"School will remain closed August 10-12 for staff training\"}]}")
                    .build());

            // GRADES PAGE
            Page grades = pageRepository.save(
                    Page.builder().tenantId(tid).title("Student Grades").slug("grades").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(grades.getId()).type("HERO").positionOrder(1)
                    .config("{\"title\":\"Student Report Card Portal\",\"subtitle\":\"Parents and students can look up grade reports, term results, and subject-wise performance using admission number or name.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(grades.getId()).type("NOTICES").positionOrder(2)
                    .config("{\"title\":\"Grading Information\",\"notices\":[{\"text\":\"Grade A++ = 95-100% | Outstanding Performance\"},{\"text\":\"Grade A+ = 90-95% | Excellent Performance\"},{\"text\":\"Grade A = 80-90% | Very Good Performance\"},{\"text\":\"Grade B+ = 70-80% | Good Performance\"},{\"text\":\"For re-assessment requests contact: exams@pioneer.edu\"}]}")
                    .build());

            // GALLERY PAGE
            Page gallery = pageRepository.save(
                    Page.builder().tenantId(tid).title("Campus Gallery").slug("gallery").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(gallery.getId()).type("HERO").positionOrder(1)
                    .config("{\"title\":\"Campus Life Gallery\",\"subtitle\":\"A visual journey through academics, sports, cultural events, and campus life at Pioneer Academy.\"}")
                    .build());

            // CAREERS PAGE
            Page careers = pageRepository
                    .save(Page.builder().tenantId(tid).title("Careers").slug("careers").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(careers.getId()).type("HERO").positionOrder(1)
                    .config("{\"title\":\"Join Our World-Class Team\",\"subtitle\":\"Pioneer Academy is always looking for passionate educators and support staff who share our mission of shaping tomorrow's leaders.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(careers.getId()).type("FEATURES").positionOrder(2)
                    .config("{\"f1_title\":\"Competitive Pay\",\"f1_desc\":\"Industry-leading compensation with annual increments\",\"f2_title\":\"Growth Path\",\"f2_desc\":\"Clear career progression and leadership opportunities\",\"f3_title\":\"Great Culture\",\"f3_desc\":\"Collaborative, research-driven academic environment\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(careers.getId()).type("NOTICES").positionOrder(3)
                    .config("{\"title\":\"Application Process\",\"notices\":[{\"text\":\"Step 1: Apply using the form below\"},{\"text\":\"Step 2: Shortlisted candidates contacted within 7 days\"},{\"text\":\"Step 3: Demo lecture / skill assessment on campus\"},{\"text\":\"Step 4: HR interview and offer letter\"}]}")
                    .build());

            // DISCLOSURES PAGE
            Page disclosures = pageRepository.save(Page.builder().tenantId(tid).title("Mandatory Disclosures")
                    .slug("disclosures").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(disclosures.getId()).type("HERO").positionOrder(1)
                    .config("{\"title\":\"CBSE Mandatory Disclosures\",\"subtitle\":\"As per CBSE Circular No. 09/2021, all affiliated schools must publish mandatory statutory disclosures on their website.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(disclosures.getId()).type("DISCLOSURES")
                    .positionOrder(2)
                    .config("{\"title\":\"Statutory Compliance Documents\",\"link1_text\":\"CBSE Affiliation Certificate (Aff. No. 1234567)\",\"link2_text\":\"School Recognition Order — Telangana State\",\"link3_text\":\"Fire Safety NOC Certificate\",\"link4_text\":\"Building Safety Certificate\",\"link5_text\":\"Land Certificate & Ownership Documents\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(disclosures.getId()).type("NOTICES")
                    .positionOrder(3)
                    .config("{\"title\":\"School Particulars\",\"notices\":[{\"text\":\"School Name: SaaS Pioneer Academy\"},{\"text\":\"CBSE Affiliation No: 1234567\"},{\"text\":\"Affiliation Period: 2020 – 2030\"},{\"text\":\"Medium of Instruction: English\"},{\"text\":\"Classes: Nursery to Grade 12\"}]}")
                    .build());

            // TRANSFER CERTIFICATE PAGE
            Page tc = pageRepository.save(
                    Page.builder().tenantId(tid).title("Transfer Certificate").slug("tc").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(tc.getId()).type("HERO").positionOrder(1).config(
                    "{\"title\":\"Transfer Certificate Verification\",\"subtitle\":\"Parents and students can verify and download issued Transfer Certificates online using admission number and personal details.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(tc.getId()).type("NOTICES").positionOrder(2).config(
                    "{\"title\":\"TC Application Guidelines\",\"notices\":[{\"text\":\"TC requests take 5-7 working days to process\"},{\"text\":\"Original fee receipts must be cleared before TC issuance\"},{\"text\":\"Apply in person at the admin office with parent's ID proof\"},{\"text\":\"For urgent TC: contact admin@pioneer.edu\"}]}")
                    .build());

            // ACHIEVEMENTS PAGE
            Page achievements = pageRepository.save(Page.builder().tenantId(tid).title("Achievements")
                    .slug("achievements").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(achievements.getId()).type("HERO").positionOrder(1)
                    .config("{\"title\":\"Our Proud Students' Achievements\",\"subtitle\":\"Celebrating excellence, dedication and the spirit to succeed.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(achievements.getId()).type("CAROUSEL")
                    .positionOrder(2)
                    .config("{\"images\":[{\"url\":\"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80\",\"caption\":\"Toppers & Rank Holders Felicitation\"},{\"url\":\"https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80\",\"caption\":\"National Olympiad & Competition Winners\"}]}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(achievements.getId()).type("INTRO").positionOrder(3)
                    .config("{\"title\":\"Hall of Fame\",\"body\":\"Our students consistently achieve outstanding results across academics, sports, and cultural arenas. Manage individual achiever profiles from the Achievers catalog in the Admin panel — they render automatically in the carousel and directory on this page.\",\"imgUrl\":\"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80\"}")
                    .build());

            // STUDENT CORNER PAGE
            Page studentCorner = pageRepository.save(Page.builder().tenantId(tid).title("Student Corner")
                    .slug("student-corner").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(studentCorner.getId()).type("HERO").positionOrder(1)
                    .config("{\"title\":\"Student Corner\",\"subtitle\":\"Explore student life — everything you need in one place.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(studentCorner.getId()).type("FEATURES")
                    .positionOrder(2)
                    .config("{\"f1_title\":\"View Student Life\",\"f1_desc\":\"A glimpse into daily life, events and traditions on campus.\",\"f2_title\":\"Clubs & Activities\",\"f2_desc\":\"Discover clubs, societies and extracurricular programs.\",\"f3_title\":\"Student Achievements\",\"f3_desc\":\"Celebrating our students' accomplishments and milestones.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(studentCorner.getId()).type("INTRO")
                    .positionOrder(3)
                    .config("{\"title\":\"Welcome, Students\",\"body\":\"This is your space. Find quick links, resources and updates that matter to your journey with us. Admins can customize this page from the Page Builder.\",\"imgUrl\":\"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80\"}")
                    .build());

            // PARENT CORNER PAGE
            Page parentCorner = pageRepository.save(Page.builder().tenantId(tid).title("Parent Corner")
                    .slug("parent-corner").status("PUBLISHED").build());
            pageSectionRepository.save(PageSection.builder().pageId(parentCorner.getId()).type("HERO").positionOrder(1)
                    .config("{\"title\":\"Parent Corner\",\"subtitle\":\"Find important school information, all in one place.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(parentCorner.getId()).type("FEATURES")
                    .positionOrder(2)
                    .config("{\"f1_title\":\"Admissions\",\"f1_desc\":\"Enrollment steps, requirements and key admission dates.\",\"f2_title\":\"School Calendar\",\"f2_desc\":\"Term dates, holidays and upcoming school events.\",\"f3_title\":\"Fees & Policies\",\"f3_desc\":\"Fee structure, payment options and school policies.\"}")
                    .build());
            pageSectionRepository.save(PageSection.builder().pageId(parentCorner.getId()).type("INTRO").positionOrder(3)
                    .config("{\"title\":\"Welcome, Parents\",\"body\":\"We value our partnership with you. Here you'll find the information and resources you need to stay involved and informed. Admins can customize this page from the Page Builder.\",\"imgUrl\":\"https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80\"}")
                    .build());

            // ── ACADEMIC COURSES (8) ──────────────────────────────────────
            courseRepository.save(AcademicCourse.builder().tenantId(tid).name("Honors Computer Science")
                    .gradeLevel("High School (G9-12)")
                    .description("Object-oriented programming in Java, data structures, and algorithm design.")
                    .syllabusSummary("OOP, Arrays, Sorting Algorithms, Recursion, File I/O").build());
            courseRepository.save(AcademicCourse.builder().tenantId(tid).name("Advanced Placement Physics")
                    .gradeLevel("High School (G9-12)")
                    .description("Deep dive into classical mechanics, electromagnetism, and wave optics.")
                    .syllabusSummary("Newtonian Mechanics, Maxwell Equations, Optics, Thermodynamics").build());
            courseRepository.save(AcademicCourse.builder().tenantId(tid).name("Primary Mathematics & Logic")
                    .gradeLevel("Primary (G1-5)")
                    .description("Core number sense, fractional logic, and spatial geometries using interactive tools.")
                    .syllabusSummary("Fractions, Geometry, Logical Puzzles, Mental Arithmetic").build());
            courseRepository.save(AcademicCourse.builder().tenantId(tid).name("Advanced Chemistry (IIT-JEE)")
                    .gradeLevel("High School (G11-12)")
                    .description("In-depth organic, inorganic, and physical chemistry for competitive entrance exams.")
                    .syllabusSummary("Organic Reactions, Electrochemistry, Chemical Equilibrium, Stoichiometry")
                    .build());
            courseRepository.save(AcademicCourse.builder().tenantId(tid).name("Biology & Life Sciences (NEET)")
                    .gradeLevel("High School (G11-12)")
                    .description(
                            "Comprehensive biology covering botany, zoology, and human physiology for NEET preparation.")
                    .syllabusSummary("Cell Biology, Genetics, Human Physiology, Ecology, Plant Biology").build());
            courseRepository.save(AcademicCourse.builder().tenantId(tid).name("English Literature & Communication")
                    .gradeLevel("Middle School (G6-8)")
                    .description("Developing critical reading, essay writing, and public speaking skills.")
                    .syllabusSummary("Prose, Poetry, Grammar, Essay Writing, Debate & Elocution").build());
            courseRepository.save(AcademicCourse.builder().tenantId(tid).name("Social Studies & Civics")
                    .gradeLevel("Middle School (G6-8)")
                    .description(
                            "History, geography, civics and economics with a focus on modern India and global events.")
                    .syllabusSummary("Indian History, World Geography, Constitution, Economics Basics").build());
            courseRepository.save(AcademicCourse.builder().tenantId(tid).name("Robotics & AI Fundamentals")
                    .gradeLevel("All Grades")
                    .description(
                            "Hands-on coding, microcontroller programming, and introduction to artificial intelligence.")
                    .syllabusSummary("Python, Arduino, Scratch, Machine Learning Basics, Robot Design").build());

            // ── ACADEMIC PROGRAMS (4) ─────────────────────────────────────
            programRepository.save(AcademicProgram.builder().tenantId(tid).name("Pioneer Schools (K-10)").type("SCHOOL")
                    .description(
                            "Holistic childhood development for Primary & Middle School — CBSE curriculum with co-curricular integration.")
                    .details(
                            "Concept-clarity teaching, interactive labs, weekly assessments, sports and arts integration, parent-teacher sync.")
                    .build());
            programRepository.save(AcademicProgram.builder().tenantId(tid).name("Integrated Junior Colleges (11-12)")
                    .type("COLLEGE")
                    .description(
                            "Board exam mastery with professional career counseling integrated into daily academics.")
                    .details(
                            "Dual-stream board prep, PCM/PCB/Commerce tracks, weekly mock exams, doubt-clearing sessions, career mapping.")
                    .build());
            programRepository.save(AcademicProgram.builder().tenantId(tid).name("NEET & JEE Premier Coaching")
                    .type("COACHING")
                    .description("India's most structured engineering and medical entrance rank training program.")
                    .details(
                            "Daily rank-acceleration modules, weekly mock tests, performance analytics dashboards, personalized mentor sessions, AIR tracking.")
                    .build());
            programRepository.save(AcademicProgram.builder().tenantId(tid).name("Entrepreneurship & Innovation Academy")
                    .type("PROFESSIONAL")
                    .description("Preparing next-gen business leaders, software engineers, and digital innovators.")
                    .details(
                            "Coding bootcamps, startup incubation, global mentorship webinars, industrial internship placements, pitch competitions.")
                    .build());

            // ── FACULTY (12) ──────────────────────────────────────────────
            facultyRepository.save(FacultyMember.builder().tenantId(tid).name("Dr. Arthur Pendragon")
                    .designation("Head of Science Department").qualification("Ph.D. Theoretical Chemistry, IIT Bombay")
                    .bio("15+ years of academic research and classroom excellence. Known for making complex chemistry intuitive and engaging for all learners.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80")
                    .build());
            facultyRepository.save(FacultyMember.builder().tenantId(tid).name("Prof. Guinevere Vance")
                    .designation("Mathematics Lead Instructor")
                    .qualification("M.Sc. Applied Mathematics, IISc Bangalore")
                    .bio("Specializes in making advanced calculus, algebra, and statistics incredibly accessible. Trained 200+ IIT-JEE rank achievers.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80")
                    .build());
            facultyRepository.save(FacultyMember.builder().tenantId(tid).name("Mr. Lancelot Sharma")
                    .designation("Physics Senior Lecturer").qualification("M.Sc. Physics, Delhi University")
                    .bio("Expert in classical mechanics, optics and electromagnetism. Consistently produces top NEET and JEE Physics scorers.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80")
                    .build());
            facultyRepository.save(FacultyMember.builder().tenantId(tid).name("Ms. Hermione Patel")
                    .designation("English & Literature Faculty")
                    .qualification("M.A. English Literature, Hyderabad University")
                    .bio("Passionate about building confident communicators. Leads the school debate club and annual drama productions.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80")
                    .build());
            facultyRepository.save(FacultyMember.builder().tenantId(tid).name("Dr. Vikram Rajan")
                    .designation("Biology & Life Sciences HOD").qualification("Ph.D. Biotechnology, AIIMS Delhi")
                    .bio("Former AIIMS researcher bringing real-world medical science into the classroom. Mentors NEET top-500 aspirants directly.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80")
                    .build());
            facultyRepository.save(FacultyMember.builder().tenantId(tid).name("Ms. Priya Nair")
                    .designation("Computer Science & Robotics Faculty")
                    .qualification("B.Tech Computer Science, NIT Trichy")
                    .bio("Full-stack developer turned educator. Runs the school's Robotics Club and annual Hackathon. Taught Python to 500+ students.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80")
                    .build());
            facultyRepository.save(FacultyMember.builder().tenantId(tid).name("Mr. Rajesh Iyer")
                    .designation("Social Studies & History Faculty").qualification("M.A. History, Pune University")
                    .bio("Brings history alive through storytelling, debate, and immersive classroom activities. Students consistently score 90%+ under his guidance.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=300&q=80")
                    .build());
            facultyRepository.save(FacultyMember.builder().tenantId(tid).name("Ms. Sunita Menon")
                    .designation("Primary School Coordinator").qualification("B.Ed., M.Ed. — Child Development")
                    .bio("Dedicated to nurturing foundational learning in grades 1-5 through play-based pedagogy and emotional intelligence development.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=80")
                    .build());
            facultyRepository.save(FacultyMember.builder().tenantId(tid).name("Dr. Ananya Deshpande")
                    .designation("Economics & Commerce HOD").qualification("Ph.D. Economics, Delhi School of Economics")
                    .bio("Blends real-world market case studies with board curriculum. Her commerce students consistently top CBSE district rankings.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=300&q=80")
                    .build());
            facultyRepository.save(FacultyMember.builder().tenantId(tid).name("Mr. Faisal Khan")
                    .designation("Physical Education & Sports Head")
                    .qualification("M.P.Ed., National Sports Coaching Diploma")
                    .bio("Certified athletics coach who has trained state and national-level champions in track, football, and basketball.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80")
                    .build());
            facultyRepository.save(FacultyMember.builder().tenantId(tid).name("Ms. Kavya Reddy")
                    .designation("Visual & Performing Arts Faculty").qualification("M.F.A. Fine Arts, JNAFAU Hyderabad")
                    .bio("Leads the annual arts festival and mentors students in painting, classical dance, and theatre productions.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1521252659862-eec69941b071?auto=format&fit=crop&w=300&q=80")
                    .build());
            facultyRepository.save(FacultyMember.builder().tenantId(tid).name("Dr. Samuel George")
                    .designation("Counselling & Student Wellbeing Lead").qualification("Ph.D. Educational Psychology")
                    .bio("Champions mental health and career counselling. Runs weekly wellbeing circles and one-on-one student mentorship sessions.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80")
                    .build());

            // ── STUDENT ACHIEVERS (12) ────────────────────────────────────
            achieverRepository.save(StudentAchiever.builder().tenantId(tid).name("Riddhi Sharma")
                    .score("CBSE Class 12 — 499/500").courseName("Commerce Stream")
                    .testimonialText(
                            "The structured curriculum and constant mentoring at Pioneer kept me laser-focused. Regular mock assessments and approachable teachers made accounting and economics mastery effortless.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80")
                    .build());
            achieverRepository.save(StudentAchiever.builder().tenantId(tid).name("Somya Reddy")
                    .score("NEET UG — AIR 14").courseName("Pre-Medical Coaching")
                    .testimonialText(
                            "Securing AIR 14 is the pinnacle of my academic life. Pioneer's personalized mentorship, rank-boosting schedules, and detailed evaluations kept me sharp right until exam day.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=500&q=80")
                    .build());
            achieverRepository.save(StudentAchiever.builder().tenantId(tid).name("B. Sanjana Krishnan")
                    .score("CBSE Class 12 — 498/500").courseName("Science (PCM) Stream")
                    .testimonialText(
                            "Pioneer provides an extraordinary learning environment with conceptual study modules. Weekly doubt-resolution sessions boosted my exam confidence immensely.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=500&q=80")
                    .build());
            achieverRepository.save(StudentAchiever.builder().tenantId(tid).name("Arjun Mehta")
                    .score("IIT-JEE Advanced — AIR 47").courseName("IIT-JEE Integrated Program")
                    .testimonialText(
                            "The IIT-JEE coaching wing at Pioneer is exceptional. Mock tests, peer learning groups, and dedicated mentor sessions made the difference between a good rank and a great one.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80")
                    .build());
            achieverRepository.save(StudentAchiever.builder().tenantId(tid).name("Priya Nambiar")
                    .score("CBSE Class 10 — 500/500").courseName("Secondary School (Grade 10)")
                    .testimonialText(
                            "A perfect score felt impossible until Pioneer showed me how. The systematic revision schedules, practice papers, and encouraging faculty made 500/500 feel natural.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80")
                    .build());
            achieverRepository.save(StudentAchiever.builder().tenantId(tid).name("Karthik Suresh")
                    .score("National Science Olympiad — Gold").courseName("STEM & Olympiad Track")
                    .testimonialText(
                            "The Robotics Club and Science Olympiad preparation at Pioneer gave me the platform to shine nationally. Dr. Pendragon's mentorship was truly transformative.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80")
                    .build());
            achieverRepository.save(StudentAchiever.builder().tenantId(tid).name("Meera Iyer")
                    .score("CBSE Class 12 — 497/500").courseName("Humanities Stream")
                    .testimonialText(
                            "Pioneer's humanities faculty encouraged critical thinking over memorization. Their essay workshops and mentorship helped me top the district in political science.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=500&q=80")
                    .build());
            achieverRepository.save(StudentAchiever.builder().tenantId(tid).name("Aditya Verma")
                    .score("IIT-JEE Mains — AIR 122").courseName("IIT-JEE Integrated Program")
                    .testimonialText(
                            "The daily problem-solving drills and mentor check-ins kept me consistent for two years. Pioneer turned my JEE dream into an IIT reality.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80")
                    .build());
            achieverRepository.save(StudentAchiever.builder().tenantId(tid).name("Ishita Gupta")
                    .score("NEET UG — AIR 208").courseName("Pre-Medical Coaching")
                    .testimonialText(
                            "The biology faculty's real-world approach and Dr. Rajan's AIIMS insights gave me an edge. The regular NEET mock series was a game-changer.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=80")
                    .build());
            achieverRepository.save(StudentAchiever.builder().tenantId(tid).name("Rohan Malhotra")
                    .score("International Math Olympiad — Silver").courseName("STEM & Olympiad Track")
                    .testimonialText(
                            "Representing India internationally was a dream. Prof. Vance's advanced problem sets and one-on-one coaching prepared me for the world stage.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80")
                    .build());
            achieverRepository.save(StudentAchiever.builder().tenantId(tid).name("Tanvi Joshi")
                    .score("CBSE Class 10 — 499/500").courseName("Secondary School (Grade 10)")
                    .testimonialText(
                            "Balancing academics with the debate club felt effortless at Pioneer. The teachers genuinely cared about my growth beyond just marks.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80")
                    .build());
            achieverRepository.save(StudentAchiever.builder().tenantId(tid).name("Nikhil Rao")
                    .score("National Robotics Championship — Winner").courseName("Robotics & Innovation Track")
                    .testimonialText(
                            "From building my first robot in the Robotics Club to winning nationals — Pioneer's innovation studio and mentors made it all possible.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=500&q=80")
                    .build());

            // ── GALLERY (12 items) ────────────────────────────────────────
            galleryRepository.save(GalleryItem.builder().tenantId(tid).type("PHOTO")
                    .title("STEM & Robotics Innovation Fair 2025").category("Academic Expo")
                    .mediaUrl(
                            "https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&w=800&q=80")
                    .build());
            galleryRepository.save(GalleryItem.builder().tenantId(tid).type("PHOTO")
                    .title("Inter-Branch Soccer League Championship").category("Sports Day")
                    .mediaUrl(
                            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80")
                    .build());
            galleryRepository.save(GalleryItem.builder().tenantId(tid).type("PHOTO")
                    .title("Annual Theater & Orchestral Concert").category("Annual Day")
                    .mediaUrl(
                            "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80")
                    .build());
            galleryRepository
                    .save(GalleryItem.builder().tenantId(tid).type("VIDEO").title("Morning Assembly & Student Pledge")
                            .category("Campus Life").mediaUrl("https://www.youtube.com/embed/dQw4w9WgXcQ").build());
            galleryRepository.save(GalleryItem.builder().tenantId(tid).type("PHOTO")
                    .title("Graduation Ceremony Class of 2025").category("Annual Day")
                    .mediaUrl(
                            "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80")
                    .build());
            galleryRepository.save(GalleryItem.builder().tenantId(tid).type("PHOTO")
                    .title("Science Lab — Chemistry Practicals").category("Academic Expo")
                    .mediaUrl(
                            "https://images.unsplash.com/photo-1567168539593-59673ababaae?auto=format&fit=crop&w=800&q=80")
                    .build());
            galleryRepository.save(GalleryItem.builder().tenantId(tid).type("PHOTO")
                    .title("Basketball Inter-House Tournament").category("Sports Day")
                    .mediaUrl(
                            "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80")
                    .build());
            galleryRepository.save(GalleryItem.builder().tenantId(tid).type("PHOTO")
                    .title("Republic Day Parade & Cultural Program").category("Cultural Fest")
                    .mediaUrl(
                            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80")
                    .build());
            galleryRepository.save(GalleryItem.builder().tenantId(tid).type("PHOTO")
                    .title("NEET & JEE Topper Felicitation 2025").category("Academic Expo")
                    .mediaUrl(
                            "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80")
                    .build());
            galleryRepository.save(GalleryItem.builder().tenantId(tid).type("PHOTO")
                    .title("Classical Dance & Music Festival").category("Cultural Fest")
                    .mediaUrl(
                            "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80")
                    .build());
            galleryRepository.save(GalleryItem.builder().tenantId(tid).type("PHOTO")
                    .title("Smart Classroom — Interactive Learning").category("Campus Life")
                    .mediaUrl(
                            "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80")
                    .build());
            galleryRepository.save(
                    GalleryItem.builder().tenantId(tid).type("VIDEO").title("Pioneer Academy — Student Testimonials")
                            .category("Campus Life").mediaUrl("https://www.youtube.com/embed/dQw4w9WgXcQ").build());

            // ── SCHOOL BRANCHES (5) ───────────────────────────────────────
            branchRepository
                    .save(SchoolBranch.builder().tenantId(tid).name("Madhapur IT-Corridor Campus").state("Telangana")
                            .city("Hyderabad").address("Patrika Nagar, Madhapur, Hyderabad, Telangana 500081")
                            .contactEmail("madhapur@pioneer.edu").phone("+91 40 1023 3440").build());
            branchRepository.save(SchoolBranch.builder().tenantId(tid).name("Secunderabad Central Campus")
                    .state("Telangana").city("Hyderabad").address("S P Road, Secunderabad, Telangana 500003")
                    .contactEmail("secunderabad@pioneer.edu").phone("+91 40 1023 3445").build());
            branchRepository.save(SchoolBranch.builder().tenantId(tid).name("HSR Layout Tech Campus").state("Karnataka")
                    .city("Bengaluru").address("Sector 2, HSR Layout, Bengaluru, Karnataka 560102")
                    .contactEmail("hsr@pioneer.edu").phone("+91 80 1023 3355").build());
            branchRepository.save(SchoolBranch.builder().tenantId(tid).name("Dwarka Institutional Campus")
                    .state("Delhi").city("New Delhi").address("Sector 10, Dwarka, New Delhi 110075")
                    .contactEmail("dwarka@pioneer.edu").phone("+91 11 1023 3366").build());
            branchRepository.save(SchoolBranch.builder().tenantId(tid).name("Aundh Knowledge Park Campus")
                    .state("Maharashtra").city("Pune").address("Aundh Road, Pune, Maharashtra 411007")
                    .contactEmail("pune@pioneer.edu").phone("+91 20 1023 3377").build());

            // ── ENRICHMENT ACTIVITIES (5) ─────────────────────────────────
            enrichmentRepository.save(EnrichmentActivity.builder().tenantId(tid).type("SPORTS")
                    .title("Sports Athletics & League Championship")
                    .description(
                            "Structured basketball, football, cricket, and track training with inter-school league fixtures.")
                    .details(
                            "Weekly inter-school leagues, international-certified coaches, synthetic courts, student physical health analytics.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80")
                    .build());
            enrichmentRepository.save(EnrichmentActivity.builder().tenantId(tid).type("UNIFORMS")
                    .title("Official School Uniform Guidelines")
                    .description(
                            "Uniform protocols designed to instill identity, discipline, and pride across all students.")
                    .details(
                            "Formal academic uniform for weekdays, active sports tracksuit for PE days, lab aprons for senior lab experiments.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80")
                    .build());
            enrichmentRepository.save(EnrichmentActivity.builder().tenantId(tid).type("EXPO")
                    .title("National STEM & Robotics Innovation Expo")
                    .description(
                            "Annual project expo where students showcase coding, robotics, and scientific innovations.")
                    .details(
                            "Live robot combat arena, software solution pitches, science project gallery, parent-teacher evaluation panels.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=600&q=80")
                    .build());
            enrichmentRepository.save(EnrichmentActivity.builder().tenantId(tid).type("SPORTS")
                    .title("Swimming & Aquatics Training Program")
                    .description("Certified swimming coaching for all grade levels with safety-first infrastructure.")
                    .details(
                            "Olympic-size pool, FINA-certified coaches, competitive swimming meets, aquatic therapy sessions.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=600&q=80")
                    .build());
            enrichmentRepository.save(EnrichmentActivity.builder().tenantId(tid).type("EXPO")
                    .title("Annual Cultural & Performing Arts Festival")
                    .description(
                            "A week-long celebration of music, dance, theater, and visual arts showcasing student creativity.")
                    .details(
                            "Classical and contemporary dance, orchestral performances, drama productions, painting exhibitions, student-curated art shows.")
                    .imageUrl(
                            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80")
                    .build());

            // ── BOARD RESULTS (6 — Class 10 & 12 over 3 years) ───────────
            boardResultRepository.save(BoardResult.builder().tenantId(tid).classLevel("CLASS 10").assessmentYear(2023)
                    .registeredStudents(150).passedStudents(150).passPercentage(100.0)
                    .remarks("Outstanding — All students cleared with Distinction").build());
            boardResultRepository.save(BoardResult.builder().tenantId(tid).classLevel("CLASS 10").assessmentYear(2024)
                    .registeredStudents(175).passedStudents(174).passPercentage(99.4)
                    .remarks("First Position in Hyderabad Zone").build());
            boardResultRepository.save(BoardResult.builder().tenantId(tid).classLevel("CLASS 10").assessmentYear(2025)
                    .registeredStudents(200).passedStudents(200).passPercentage(100.0)
                    .remarks("Cent-percent pass with 42 students scoring 500/500").build());
            boardResultRepository.save(BoardResult.builder().tenantId(tid).classLevel("CLASS 12").assessmentYear(2023)
                    .registeredStudents(120).passedStudents(118).passPercentage(98.3)
                    .remarks("High JEE & NEET qualifier ratio").build());
            boardResultRepository.save(BoardResult.builder().tenantId(tid).classLevel("CLASS 12").assessmentYear(2024)
                    .registeredStudents(140).passedStudents(140).passPercentage(100.0)
                    .remarks("State toppers in Science and Commerce streams").build());
            boardResultRepository.save(BoardResult.builder().tenantId(tid).classLevel("CLASS 12").assessmentYear(2025)
                    .registeredStudents(160).passedStudents(159).passPercentage(99.3)
                    .remarks("NEET AIR 14 & IIT-JEE AIR 47 secured").build());

            // ── TRANSFER CERTIFICATES (5) ─────────────────────────────────
            tcRepository.save(TransferCertificate.builder().tenantId(tid).studentName("Harry Potter")
                    .admissionNo("ADM-901").classLevel("10th").section("A").fatherName("James Potter")
                    .aadharNo("1234-5678-9012").dateOfBirth("2010-07-31").tcNumber("TC-2026-001")
                    .issueDate(LocalDateTime.now().minusDays(10)).pdfUrl("/tc/TC-2026-001.pdf").build());
            tcRepository.save(TransferCertificate.builder().tenantId(tid).studentName("Ron Weasley")
                    .admissionNo("ADM-902").classLevel("12th").section("B").fatherName("Arthur Weasley")
                    .aadharNo("9876-5432-1098").dateOfBirth("2008-03-01").tcNumber("TC-2026-002")
                    .issueDate(LocalDateTime.now().minusDays(5)).pdfUrl("/tc/TC-2026-002.pdf").build());
            tcRepository.save(TransferCertificate.builder().tenantId(tid).studentName("Bruce Wayne")
                    .admissionNo("ADM-103").classLevel("10th").section("A").fatherName("Thomas Wayne")
                    .aadharNo("1111-2222-3333").dateOfBirth("2010-02-19").tcNumber("TC-2026-003")
                    .issueDate(LocalDateTime.now().minusDays(3)).pdfUrl("/tc/TC-2026-003.pdf").build());
            tcRepository.save(TransferCertificate.builder().tenantId(tid).studentName("Diana Prince")
                    .admissionNo("ADM-201").classLevel("8th").section("C").fatherName("King Hippolyta")
                    .aadharNo("2222-3333-4444").dateOfBirth("2012-03-22").tcNumber("TC-2026-004")
                    .issueDate(LocalDateTime.now().minusDays(1)).pdfUrl("/tc/TC-2026-004.pdf").build());
            tcRepository.save(TransferCertificate.builder().tenantId(tid).studentName("Peter Parker")
                    .admissionNo("ADM-105").classLevel("2nd").section("B").fatherName("Richard Parker")
                    .aadharNo("5555-6666-7777").dateOfBirth("2016-08-10").tcNumber("TC-2026-005")
                    .issueDate(LocalDateTime.now().minusDays(7)).pdfUrl("/tc/TC-2026-005.pdf").build());

            // ── JOB POSTINGS (5) ─────────────────────────────────────────
            JobPosting physJob = jobRepository.save(JobPosting.builder().tenantId(tid)
                    .title("Senior Physics Faculty — IIT-JEE Wing").department("Competitive Coaching")
                    .qualification("M.Sc. / Ph.D. Physics or Engineering").experience("5+ years")
                    .description(
                            "Deliver high-level lectures on classical mechanics, electrodynamics, and wave optics. Design weekly rank-boosting mock assessments for JEE aspirants.")
                    .build());
            JobPosting mathJob = jobRepository.save(JobPosting.builder().tenantId(tid)
                    .title("Primary Mathematics Teacher (Grades 1-5)").department("Academics")
                    .qualification("B.Sc. / B.Ed. Mathematics").experience("2-3 years")
                    .description(
                            "Instruct foundational mathematical concepts using interactive visual aids and play-based learning for primary grade students.")
                    .build());
            jobRepository.save(JobPosting.builder().tenantId(tid).title("Biology Faculty — NEET Preparation")
                    .department("Competitive Coaching").qualification("M.Sc. Biology / MBBS").experience("3+ years")
                    .description(
                            "Teach botany, zoology and human physiology with a focus on NEET exam pattern. Conduct weekly mock tests and doubt-clearing sessions.")
                    .build());
            jobRepository.save(JobPosting.builder().tenantId(tid).title("School Counselor & Psychologist")
                    .department("Student Welfare").qualification("M.A. / M.Sc. Psychology, RCI Certified")
                    .experience("3+ years")
                    .description(
                            "Provide academic and emotional counseling to students. Conduct group sessions, career guidance workshops, and parent consultations.")
                    .build());
            jobRepository.save(JobPosting.builder().tenantId(tid).title("Sports Coach — Cricket & Football")
                    .department("Athletics").qualification("NIS Certified Coach / State-Level Athlete")
                    .experience("4+ years")
                    .description(
                            "Coach students across cricket and football with structured practice schedules, inter-school tournament participation, and fitness assessments.")
                    .build());

            // ── JOB APPLICATIONS (4) ──────────────────────────────────────
            applicationRepository.save(JobApplication.builder().tenantId(tid).jobId(physJob.getId())
                    .jobTitle(physJob.getTitle()).candidateName("Bruce Banner").candidateEmail("gamma@mail.com")
                    .candidatePhone("+1 555 762 2374").status("PENDING").build());
            applicationRepository.save(JobApplication.builder().tenantId(tid).jobId(physJob.getId())
                    .jobTitle(physJob.getTitle()).candidateName("Tony Stark").candidateEmail("tony@starkindustries.com")
                    .candidatePhone("+1 555 100 3000").status("SHORTLISTED").build());
            applicationRepository.save(JobApplication.builder().tenantId(tid).jobId(mathJob.getId())
                    .jobTitle(mathJob.getTitle()).candidateName("Wanda Maximoff").candidateEmail("wanda@mail.com")
                    .candidatePhone("+1 555 200 4001").status("PENDING").build());
            applicationRepository.save(JobApplication.builder().tenantId(tid).jobId(mathJob.getId())
                    .jobTitle(mathJob.getTitle()).candidateName("Stephen Strange").candidateEmail("strange@sanctum.com")
                    .candidatePhone("+1 555 999 1111").status("REJECTED").build());

            // ── FEE ITEMS (5) ─────────────────────────────────────────────
            FeeItem tuition = feeItemRepository.save(FeeItem.builder().tenantId(tid).name("Term 1 Tuition Fee")
                    .amount(15000.0).gradeLevel("All Grades")
                    .description("Standard academic term tuition fee — covers all core subjects and teaching resources")
                    .build());
            FeeItem bus = feeItemRepository.save(FeeItem.builder().tenantId(tid).name("Annual Bus Transportation Fee")
                    .amount(8000.0).gradeLevel("All Grades")
                    .description("Annual school bus pass covering all designated routes across Hyderabad").build());
            FeeItem lab = feeItemRepository.save(FeeItem.builder().tenantId(tid).name("Science & Computer Lab Fee")
                    .amount(3000.0).gradeLevel("High School (G9-12)")
                    .description(
                            "Annual lab usage fee covering consumables, equipment maintenance and practical sessions")
                    .build());
            FeeItem sports = feeItemRepository.save(FeeItem.builder().tenantId(tid)
                    .name("Sports & Athletics Annual Fee").amount(2500.0).gradeLevel("All Grades")
                    .description(
                            "Covers sports kit, coaching sessions, inter-school tournament registration and facilities")
                    .build());
            FeeItem jee = feeItemRepository.save(FeeItem.builder().tenantId(tid)
                    .name("JEE/NEET Coaching Supplementary Fee").amount(25000.0).gradeLevel("High School (G11-12)")
                    .description(
                            "Supplementary coaching fee for IIT-JEE and NEET preparation wing — includes study material and mock tests")
                    .build());

            // ── STUDENT INVOICES (10) ─────────────────────────────────────
            invoiceRepository.save(StudentInvoice.builder().tenantId(tid).studentName("John Doe").admissionNo("ADM-101")
                    .gradeLevel("10th").section("A").fatherName("Richard Doe").aadharNo("1234-5678-9012")
                    .dateOfBirth("2010-01-12").feeItemName(tuition.getName()).amount(tuition.getAmount())
                    .status("PENDING").dueDate(LocalDateTime.now().plusDays(15)).build());
            invoiceRepository.save(StudentInvoice.builder().tenantId(tid).studentName("Harry Potter")
                    .admissionNo("ADM-901").gradeLevel("10th").section("A").fatherName("James Potter")
                    .aadharNo("1234-5678-9012").dateOfBirth("2010-07-31").feeItemName(tuition.getName())
                    .amount(tuition.getAmount()).status("PAID").dueDate(LocalDateTime.now().plusDays(30))
                    .paymentDate(LocalDateTime.now().minusDays(2)).build());
            invoiceRepository.save(StudentInvoice.builder().tenantId(tid).studentName("Bruce Wayne")
                    .admissionNo("ADM-103").gradeLevel("10th").section("A").fatherName("Thomas Wayne")
                    .aadharNo("1111-2222-3333").dateOfBirth("2010-02-19").feeItemName(tuition.getName())
                    .amount(tuition.getAmount()).status("PAID").dueDate(LocalDateTime.now().plusDays(30))
                    .paymentDate(LocalDateTime.now().minusDays(5)).build());
            invoiceRepository.save(StudentInvoice.builder().tenantId(tid).studentName("Ron Weasley")
                    .admissionNo("ADM-902").gradeLevel("12th").section("B").fatherName("Arthur Weasley")
                    .aadharNo("9876-5432-1098").dateOfBirth("2008-03-01").feeItemName(tuition.getName())
                    .amount(tuition.getAmount()).status("PENDING").dueDate(LocalDateTime.now().plusDays(10)).build());
            invoiceRepository.save(StudentInvoice.builder().tenantId(tid).studentName("Hermione Granger")
                    .admissionNo("ADM-104").gradeLevel("12th").section("B").fatherName("Mr. Granger")
                    .aadharNo("4444-5555-6666").dateOfBirth("2008-09-19").feeItemName(tuition.getName())
                    .amount(tuition.getAmount()).status("PAID").dueDate(LocalDateTime.now().plusDays(30))
                    .paymentDate(LocalDateTime.now().minusDays(8)).build());
            invoiceRepository.save(StudentInvoice.builder().tenantId(tid).studentName("Jane Smith")
                    .admissionNo("ADM-102").gradeLevel("2nd").section("B").fatherName("Robert Smith")
                    .aadharNo("9876-5432-1098").dateOfBirth("2016-04-05").feeItemName(bus.getName())
                    .amount(bus.getAmount()).status("PENDING").dueDate(LocalDateTime.now().plusDays(20)).build());
            invoiceRepository.save(StudentInvoice.builder().tenantId(tid).studentName("Peter Parker")
                    .admissionNo("ADM-105").gradeLevel("2nd").section("B").fatherName("Richard Parker")
                    .aadharNo("5555-6666-7777").dateOfBirth("2016-08-10").feeItemName(bus.getName())
                    .amount(bus.getAmount()).status("PAID").dueDate(LocalDateTime.now().plusDays(30))
                    .paymentDate(LocalDateTime.now().minusDays(1)).build());
            invoiceRepository.save(StudentInvoice.builder().tenantId(tid).studentName("Arjun Mehta")
                    .admissionNo("ADM-301").gradeLevel("12th").section("A").fatherName("Suresh Mehta")
                    .aadharNo("7777-8888-9999").dateOfBirth("2008-11-23").feeItemName(jee.getName())
                    .amount(jee.getAmount()).status("PAID").dueDate(LocalDateTime.now().plusDays(30))
                    .paymentDate(LocalDateTime.now().minusDays(3)).build());
            invoiceRepository.save(StudentInvoice.builder().tenantId(tid).studentName("Priya Nambiar")
                    .admissionNo("ADM-302").gradeLevel("12th").section("A").fatherName("Rajan Nambiar")
                    .aadharNo("6666-7777-8888").dateOfBirth("2008-06-14").feeItemName(jee.getName())
                    .amount(jee.getAmount()).status("PENDING").dueDate(LocalDateTime.now().plusDays(5)).build());
            invoiceRepository.save(StudentInvoice.builder().tenantId(tid).studentName("John Doe").admissionNo("ADM-101")
                    .gradeLevel("10th").section("A").fatherName("Richard Doe").aadharNo("1234-5678-9012")
                    .dateOfBirth("2010-01-12").feeItemName(sports.getName()).amount(sports.getAmount()).status("PAID")
                    .dueDate(LocalDateTime.now().plusDays(30)).paymentDate(LocalDateTime.now().minusDays(4)).build());

            // ── STUDENT GRADES (12) ───────────────────────────────────────
            gradeRepository.save(StudentGrade.builder().tenantId(tid).studentName("John Doe").admissionNo("ADM-101")
                    .classLevel("10th").section("A").fatherName("Richard Doe").aadharNo("1234-5678-9012")
                    .subjectName("Mathematics").term("Term 1 Midterm").grade("A+")
                    .remarks("Outstanding logical capability and problem-solving skills.").build());
            gradeRepository.save(StudentGrade.builder().tenantId(tid).studentName("John Doe").admissionNo("ADM-101")
                    .classLevel("10th").section("A").fatherName("Richard Doe").aadharNo("1234-5678-9012")
                    .subjectName("Science & Physics").term("Term 1 Midterm").grade("A")
                    .remarks("Excellent lab focus and scientific writing clarity.").build());
            gradeRepository.save(StudentGrade.builder().tenantId(tid).studentName("Harry Potter").admissionNo("ADM-901")
                    .classLevel("10th").section("A").fatherName("James Potter").aadharNo("1234-5678-9012")
                    .subjectName("Mathematics").term("Term 1 Midterm").grade("A")
                    .remarks("Displays amazing focus under pressure.").build());
            gradeRepository.save(StudentGrade.builder().tenantId(tid).studentName("Harry Potter").admissionNo("ADM-901")
                    .classLevel("10th").section("A").fatherName("James Potter").aadharNo("1234-5678-9012")
                    .subjectName("English Literature").term("Term 1 Midterm").grade("A+")
                    .remarks("Creative writing and comprehension scores are exceptional.").build());
            gradeRepository.save(StudentGrade.builder().tenantId(tid).studentName("Bruce Wayne").admissionNo("ADM-103")
                    .classLevel("10th").section("A").fatherName("Thomas Wayne").aadharNo("1111-2222-3333")
                    .subjectName("Computer Science").term("Term 1 Midterm").grade("A++")
                    .remarks("Incredibly advanced structural logic and programming skills.").build());
            gradeRepository.save(StudentGrade.builder().tenantId(tid).studentName("Ron Weasley").admissionNo("ADM-902")
                    .classLevel("12th").section("B").fatherName("Arthur Weasley").aadharNo("9876-5432-1098")
                    .subjectName("English Literature").term("Term 1 Midterm").grade("B+")
                    .remarks("Highly imaginative essay writing and active class participation.").build());
            gradeRepository.save(StudentGrade.builder().tenantId(tid).studentName("Hermione Granger")
                    .admissionNo("ADM-104").classLevel("12th").section("B").fatherName("Mr. Granger")
                    .aadharNo("4444-5555-6666").subjectName("Mathematics").term("Term 1 Midterm").grade("A++")
                    .remarks("Flawless precision and mathematical logic — class topper.").build());
            gradeRepository.save(StudentGrade.builder().tenantId(tid).studentName("Hermione Granger")
                    .admissionNo("ADM-104").classLevel("12th").section("B").fatherName("Mr. Granger")
                    .aadharNo("4444-5555-6666").subjectName("Chemistry").term("Term 1 Midterm").grade("A++")
                    .remarks("Exceptional organic chemistry problem solving.").build());
            gradeRepository.save(StudentGrade.builder().tenantId(tid).studentName("Jane Smith").admissionNo("ADM-102")
                    .classLevel("2nd").section("B").fatherName("Robert Smith").aadharNo("9876-5432-1098")
                    .subjectName("Primary Mathematics").term("Term 1 Midterm").grade("A")
                    .remarks("Very attentive and quick with fractional logic puzzles.").build());
            gradeRepository.save(StudentGrade.builder().tenantId(tid).studentName("Peter Parker").admissionNo("ADM-105")
                    .classLevel("2nd").section("B").fatherName("Richard Parker").aadharNo("5555-6666-7777")
                    .subjectName("Primary Mathematics").term("Term 1 Midterm").grade("A+")
                    .remarks("Incredibly swift creative spatial logic solver.").build());
            gradeRepository.save(StudentGrade.builder().tenantId(tid).studentName("Arjun Mehta").admissionNo("ADM-301")
                    .classLevel("12th").section("A").fatherName("Suresh Mehta").aadharNo("7777-8888-9999")
                    .subjectName("Physics").term("Term 1 Midterm").grade("A++")
                    .remarks("Consistently top performer in JEE mock exams. Mechanics mastery is exceptional.")
                    .build());
            gradeRepository.save(StudentGrade.builder().tenantId(tid).studentName("Priya Nambiar")
                    .admissionNo("ADM-302").classLevel("12th").section("A").fatherName("Rajan Nambiar")
                    .aadharNo("6666-7777-8888").subjectName("Biology").term("Term 1 Midterm").grade("A+")
                    .remarks("Outstanding NEET-level biology answers. Strong conceptual clarity in genetics.").build());

            // ── NEWS BULLETINS (5) ────────────────────────────────────────
            newsRepository.save(SchoolNews.builder().tenantId(tid).title("AP Science Assessment Schedules Published")
                    .content(
                            "The complete timetable for Advanced Placement science assessments has been published. Midterm exams begin August 1st, 2026. All students must carry their admit cards.")
                    .author("Principal's Office").publishedDate(LocalDateTime.now().minusDays(1)).build());
            newsRepository.save(SchoolNews.builder().tenantId(tid)
                    .title("NEET & JEE Topper Felicitation Ceremony — July 28")
                    .content(
                            "Pioneer Academy is proud to celebrate our 2025 batch achievers. Arjun Mehta (IIT-JEE AIR 47) and Somya Reddy (NEET AIR 14) will be felicitated at the Main Auditorium on July 28, 2026 at 10:00 AM. All parents and students are cordially invited.")
                    .author("Academic Council").publishedDate(LocalDateTime.now().minusDays(3)).build());
            newsRepository.save(SchoolNews.builder().tenantId(tid).title("Admissions 2026-27: Limited Seats Remaining")
                    .content(
                            "Admissions for the academic year 2026-27 are in the final stages. Only 42 seats remain across all grades. Parents are advised to submit their admission inquiry form immediately to secure a slot. Walk-in registration is available Saturday 9AM-1PM.")
                    .author("Admissions Office").publishedDate(LocalDateTime.now().minusDays(5)).build());
            newsRepository.save(SchoolNews.builder().tenantId(tid).title("Annual Sports Day — September 20, 2026")
                    .content(
                            "Pioneer Academy's Annual Sports Day will be held on September 20, 2026 at the Main Athletic Ground, Madhapur Campus. Events include 100m sprint, relay races, basketball, football, and cultural performances. All parents are warmly invited.")
                    .author("Sports Department").publishedDate(LocalDateTime.now().minusDays(7)).build());
            newsRepository.save(SchoolNews.builder().tenantId(tid)
                    .title("New Robotics Lab Inaugurated — State-of-the-Art STEM Hub")
                    .content(
                            "We are thrilled to announce the inauguration of our brand-new Robotics & AI Innovation Lab at the Madhapur campus. Equipped with Arduino kits, 3D printers, VR headsets, and Raspberry Pi stations, this lab will supercharge STEM learning for all students from Grade 5 onwards.")
                    .author("Principal Dr. Arthur Pendragon").publishedDate(LocalDateTime.now().minusDays(10)).build());

            // ── SCHOOL EVENTS (10) ────────────────────────────────────────
            eventRepository.save(SchoolEvent.builder().tenantId(tid).title("Parent-Teacher Association Meet — Term 1")
                    .description(
                            "Comprehensive discussion on student performance, STEM lab expansion, and Term 1 assessment schedules. All parents must attend. Report cards will be distributed.")
                    .eventDate(LocalDateTime.now().plusDays(7)).location("Main Auditorium, Madhapur Campus").build());
            eventRepository.save(SchoolEvent.builder().tenantId(tid).title("NEET & JEE Topper Felicitation Ceremony")
                    .description(
                            "Felicitation of Pioneer Academy's 2025 board and competitive exam toppers. Chief Guest: Dr. Vikram Rajan, HOD Biology. Refreshments provided for all attendees.")
                    .eventDate(LocalDateTime.now().plusDays(14)).location("Main Auditorium, Madhapur Campus").build());
            eventRepository.save(SchoolEvent.builder().tenantId(tid).title("Annual Sports Day 2026").description(
                    "Track and field events, team sports, relay races, and cultural performances. Inter-house championship trophy to be awarded. Students must report by 7:30 AM in sports uniform.")
                    .eventDate(LocalDateTime.now().plusDays(50)).location("Athletic Ground, Madhapur Campus").build());
            eventRepository.save(SchoolEvent.builder().tenantId(tid)
                    .title("National Science & Robotics Olympiad — Campus Round")
                    .description(
                            "Campus-level screening round for the National Science Olympiad and Robotics Championship. Top 10 students advance to district finals. Registration via class teacher.")
                    .eventDate(LocalDateTime.now().plusDays(21)).location("STEM Lab, Madhapur Campus").build());
            eventRepository.save(SchoolEvent.builder().tenantId(tid).title("Annual Cultural & Performing Arts Festival")
                    .description(
                            "Three-day cultural extravaganza featuring classical dance, instrumental music, drama, painting competitions, and student art exhibitions. Open to all parents and community members.")
                    .eventDate(LocalDateTime.now().plusDays(35)).location("Main Auditorium & Open-Air Amphitheatre")
                    .build());
            eventRepository.save(SchoolEvent.builder().tenantId(tid).title("Career Guidance & University Fair 2026")
                    .description(
                            "Representatives from 40+ national and international universities, plus expert career counsellors, guide students on higher education pathways, scholarships, and entrance exams.")
                    .eventDate(LocalDateTime.now().plusDays(28)).location("Sports Complex Hall, Madhapur Campus")
                    .build());
            eventRepository.save(SchoolEvent.builder().tenantId(tid)
                    .title("Inter-School Debate & Model UN Championship")
                    .description(
                            "Pioneer hosts 20 schools for a two-day debate and Model United Nations tournament. Sharpen public speaking, diplomacy, and critical-thinking skills. Spectators welcome.")
                    .eventDate(LocalDateTime.now().plusDays(42)).location("Main Auditorium, Madhapur Campus").build());
            eventRepository.save(SchoolEvent.builder().tenantId(tid).title("Annual Day & Prize Distribution Ceremony")
                    .description(
                            "A grand celebration of the academic year with cultural performances, felicitation of toppers, and distribution of merit awards. Chief Guest to be announced. Formal attire required.")
                    .eventDate(LocalDateTime.now().plusDays(60)).location("Open-Air Amphitheatre, Madhapur Campus")
                    .build());
            eventRepository.save(SchoolEvent.builder().tenantId(tid).title("Health, Wellness & Yoga Awareness Camp")
                    .description(
                            "A day dedicated to student wellbeing featuring yoga sessions, nutrition workshops, free health check-ups, and mental-health counselling led by Dr. Samuel George. Parents encouraged to join.")
                    .eventDate(LocalDateTime.now().plusDays(17)).location("Athletic Ground & Wellness Centre").build());
            eventRepository.save(SchoolEvent.builder().tenantId(tid).title("Science Exhibition & Innovation Expo 2026")
                    .description(
                            "Students showcase working models, research projects, and robotics innovations across physics, chemistry, biology, and computer science. Judged by industry experts. Open house for all parents.")
                    .eventDate(LocalDateTime.now().plusDays(45)).location("STEM Lab & Exhibition Hall, Madhapur Campus")
                    .build());

            // ── ADMISSION LEADS (5) ───────────────────────────────────────
            admissionRepository.save(AdmissionLead.builder().tenantId(tid).studentName("Robert Junior")
                    .gradeLevel("Kindergarten").parentName("Robert Senior").parentEmail("robert@email.com")
                    .parentPhone("+91 99001 12345").status("PENDING")
                    .message("Inquiring about KG bus route schedules and school timing. Need admission for July 2026.")
                    .build());
            admissionRepository.save(AdmissionLead.builder().tenantId(tid).studentName("Anika Sharma")
                    .gradeLevel("Grade 6").parentName("Deepak Sharma").parentEmail("deepak@email.com")
                    .parentPhone("+91 98765 11111").status("CONTACTED")
                    .message(
                            "Looking for a school with strong STEM focus and sports for my daughter. Shifting from Pune.")
                    .build());
            admissionRepository.save(AdmissionLead.builder().tenantId(tid).studentName("Rohan Gupta")
                    .gradeLevel("Grade 11 (Science)").parentName("Manoj Gupta").parentEmail("manoj@email.com")
                    .parentPhone("+91 99887 22222").status("PENDING")
                    .message(
                            "Interested in IIT-JEE integrated program for Grade 11. Please share the detailed fee structure and hostel availability.")
                    .build());
            admissionRepository.save(AdmissionLead.builder().tenantId(tid).studentName("Meera Iyer")
                    .gradeLevel("Grade 1").parentName("Suresh Iyer").parentEmail("suresh.iyer@email.com")
                    .parentPhone("+91 91234 33333").status("ENROLLED")
                    .message(
                            "Would like to enroll my daughter for Grade 1. We visited the campus last week and loved the infrastructure.")
                    .build());
            admissionRepository.save(AdmissionLead.builder().tenantId(tid).studentName("Vikrant Singh")
                    .gradeLevel("Grade 9").parentName("Rajinder Singh").parentEmail("rajinder@email.com")
                    .parentPhone("+91 93456 44444").status("PENDING")
                    .message(
                            "We are relocating to Hyderabad and need a CBSE school with good sports facilities. Please confirm Grade 9 seat availability.")
                    .build());

            // ── SUPPORT INQUIRIES (4) ─────────────────────────────────────
            supportRepository.save(SupportInquiry.builder().tenantId(tid).senderName("Diana Prince")
                    .senderEmail("diana@amazon.com").subject("Locker Key Card Replacement")
                    .message(
                            "My daughter lost her gym locker key card. Who is the admin contact for issuing a replacement? She has PE class tomorrow.")
                    .status("RESOLVED").resolutionNotes("Directed to admin office. Replacement issued on July 28.")
                    .build());
            supportRepository.save(SupportInquiry.builder().tenantId(tid).senderName("Tony Stark")
                    .senderEmail("tony@starkindustries.com").subject("Fee Payment Receipt Not Received")
                    .message(
                            "I paid the Term 1 tuition fee online on July 20 but have not received the receipt on my email yet. Please resend to tony@starkindustries.com")
                    .status("PENDING").build());
            supportRepository.save(SupportInquiry.builder().tenantId(tid).senderName("Priya Menon")
                    .senderEmail("priya.menon@email.com").subject("Request for Bonafide Certificate")
                    .message(
                            "My son Karthik Menon (ADM-301, Grade 12A) requires a bonafide certificate for bank account opening. How do I apply and how long does it take?")
                    .status("PENDING").build());
            supportRepository.save(SupportInquiry.builder().tenantId(tid).senderName("Amit Verma")
                    .senderEmail("amit.verma@email.com").subject("School Bus Route Inquiry — Kondapur Area")
                    .message(
                            "We recently moved to Kondapur. Does the school bus cover that area? If not, is there a shared cab arrangement? My daughter is in Grade 4.")
                    .status("RESOLVED")
                    .resolutionNotes(
                            "Bus Route 7 covers Kondapur. Parent provided schedule and contact details of bus in-charge.")
                    .build());

        }
    }
}
