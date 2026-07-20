package com.schoolwebsite.backend.config;

import com.schoolwebsite.backend.academics.AcademicCourse;
import com.schoolwebsite.backend.academics.AcademicCourseRepository;
import com.schoolwebsite.backend.academics.AcademicProgram;
import com.schoolwebsite.backend.academics.AcademicProgramRepository;
import com.schoolwebsite.backend.academics.FacultyMember;
import com.schoolwebsite.backend.academics.FacultyMemberRepository;
import com.schoolwebsite.backend.academics.SchoolBranch;
import com.schoolwebsite.backend.academics.SchoolBranchRepository;
import com.schoolwebsite.backend.academics.StudentAchiever;
import com.schoolwebsite.backend.academics.StudentAchieverRepository;
import com.schoolwebsite.backend.academics.GalleryItem;
import com.schoolwebsite.backend.academics.GalleryItemRepository;
import com.schoolwebsite.backend.academics.EnrichmentActivity;
import com.schoolwebsite.backend.academics.EnrichmentActivityRepository;
import com.schoolwebsite.backend.academics.BoardResult;
import com.schoolwebsite.backend.academics.BoardResultRepository;
import com.schoolwebsite.backend.academics.TransferCertificate;
import com.schoolwebsite.backend.academics.TransferCertificateRepository;
import com.schoolwebsite.backend.academics.JobPosting;
import com.schoolwebsite.backend.academics.JobPostingRepository;
import com.schoolwebsite.backend.academics.JobApplication;
import com.schoolwebsite.backend.academics.JobApplicationRepository;
import com.schoolwebsite.backend.admissions.AdmissionLead;
import com.schoolwebsite.backend.admissions.AdmissionLeadRepository;
import com.schoolwebsite.backend.billing.FeeItem;
import com.schoolwebsite.backend.billing.FeeItemRepository;
import com.schoolwebsite.backend.billing.StudentInvoice;
import com.schoolwebsite.backend.billing.StudentInvoiceRepository;
import com.schoolwebsite.backend.grades.StudentGrade;
import com.schoolwebsite.backend.grades.StudentGradeRepository;
import com.schoolwebsite.backend.notifications.SchoolEvent;
import com.schoolwebsite.backend.notifications.SchoolEventRepository;
import com.schoolwebsite.backend.notifications.SchoolNews;
import com.schoolwebsite.backend.notifications.SchoolNewsRepository;
import com.schoolwebsite.backend.pagebuilder.Page;
import com.schoolwebsite.backend.pagebuilder.PageRepository;
import com.schoolwebsite.backend.pagebuilder.PageSection;
import com.schoolwebsite.backend.pagebuilder.PageSectionRepository;
import com.schoolwebsite.backend.siteconfiguration.SiteConfig;
import com.schoolwebsite.backend.siteconfiguration.SiteConfigRepository;
import com.schoolwebsite.backend.support.SupportInquiry;
import com.schoolwebsite.backend.support.SupportInquiryRepository;
import com.schoolwebsite.backend.tenantsubscription.Tenant;
import com.schoolwebsite.backend.tenantsubscription.TenantRepository;
import com.schoolwebsite.backend.auth.AdminUser;
import com.schoolwebsite.backend.auth.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final TenantRepository tenantRepository;
    private final SiteConfigRepository siteConfigRepository;
    private final AdminUserRepository adminUserRepository;
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

    @Override
    public void run(String... args) throws Exception {
        // Seed default Super Admin
        if (adminUserRepository.findByUsername("admin").isEmpty()) {
            adminUserRepository.save(AdminUser.builder()
                    .username("admin")
                    .password("admin123")
                    .role("SUPER_ADMIN")
                    .email("admin@schoolsaas.com")
                    .phoneNumber("+15550199000")
                    .build());
            System.out.println("🌱 Seeded Default Super Admin: admin / admin123");
        }

        // Seed the gorgeous default mock school named "SaaS Pioneer Academy" if it doesn't exist yet
        if (!tenantRepository.existsBySubdomain("pioneer")) {
            System.out.println("🌱 Seeding gorgeous pre-populated school: SaaS Pioneer Academy...");

            // 1. Seed Tenant
            Tenant tenant = Tenant.builder()
                    .name("SaaS Pioneer Academy")
                    .subdomain("pioneer")
                    .status("ACTIVE")
                    .build();
            Tenant savedTenant = tenantRepository.save(tenant);
            Long tenantId = savedTenant.getId();

            // Seed default tenant admin credentials
            adminUserRepository.save(AdminUser.builder()
                    .username("pioneer_admin")
                    .password("pioneer123")
                    .role("TENANT_ADMIN")
                    .tenantId(tenantId)
                    .email("admin@pioneer.edu")
                    .phoneNumber("+91401023344")
                    .build());
            System.out.println("🌱 Seeded Tenant Admin for Pioneer School: pioneer_admin / pioneer123");

            // 2. Seed Site Config (Narayana-style Royal Navy and Crimson branding)
            SiteConfig siteConfig = SiteConfig.builder()
                    .tenantId(tenantId)
                    .logoUrl("🎓") // Pre-seeded Scholar Emblem
                    .themeName("ROYAL_NAVY")
                    .primaryColor("#1e3a8a") // Royal Navy Blue
                    .secondaryColor("#991b1b") // Academic Crimson
                    .accentColor("#fbbf24") // Bright Gold
                    .fontFamily("Inter")
                    .contactEmail("admissions@pioneer.edu")
                    .contactPhone("+1 (555) 746-6337")
                    .socialLinks("{\"enabled\":true,\"text\":\"🎉 Admissions are officially OPEN for the Academic Cohort of 2026-27! Register your child's seat today.\",\"direction\":\"left\",\"buttonText\":\"Enroll Now!\",\"pageSlug\":\"admissions\",\"facebookUrl\":\"https://www.facebook.com/pioneeracademy\",\"instagramUrl\":\"https://www.instagram.com/pioneeracademy\",\"twitterUrl\":\"https://twitter.com/pioneeracademy\",\"youtubeUrl\":\"https://www.youtube.com/user/pioneeracademy\",\"googleMapUrl\":\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.18349141639!2d78.3820256!3d17.4485535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93dc8c5d69df%3A0x1968805474a123bc!2sMadhapur%2C%20Hyderabad!5e0!3m2!1sen!2sin!4v1721380000000\"}")
                    .build();
            siteConfigRepository.save(siteConfig);

            // 3. Seed CMS Pages & Sections
            // Home Page
            Page homePage = Page.builder()
                    .tenantId(tenantId)
                    .title("Home")
                    .slug("home")
                    .status("PUBLISHED")
                    .build();
            Page savedHome = pageRepository.save(homePage);

            pageSectionRepository.save(PageSection.builder()
                    .pageId(savedHome.getId())
                    .type("HERO")
                    .positionOrder(1)
                    .config("{\"title\":\"Nurturing Potential, Inspiring Excellence\",\"subtitle\":\"Welcome to SaaS Pioneer Academy, where high-tech labs and championship athletics meet world-class pedagogy.\"}")
                    .build());

            pageSectionRepository.save(PageSection.builder()
                    .pageId(savedHome.getId())
                    .type("CAROUSEL")
                    .positionOrder(2)
                    .config("{\"img1\":\"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80\",\"img2\":\"https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80\"}")
                    .build());

            pageSectionRepository.save(PageSection.builder()
                    .pageId(savedHome.getId())
                    .type("FEATURES")
                    .positionOrder(3)
                    .config("{\"f1_title\":\"STEM & Robotic Labs\",\"f2_title\":\"Championship Athletics Ground\"}")
                    .build());

            pageSectionRepository.save(PageSection.builder()
                    .pageId(savedHome.getId())
                    .type("VIDEO")
                    .positionOrder(4)
                    .config("{\"title\":\"SaaS Pioneer Academy Virtual Tour\",\"video_url\":\"https://www.youtube.com/embed/dQw4w9WgXcQ\"}")
                    .build());

            pageSectionRepository.save(PageSection.builder()
                    .pageId(savedHome.getId())
                    .type("INTRO")
                    .positionOrder(5)
                    .config("{\"title\":\"About Pioneer Academy\",\"body\":\"SaaS Pioneer Academy has been a leader in holistic, concept-driven learning. Combining certified mentors, top board curricula, and comprehensive development systems, we provide an unparalleled environment for prospective achievers to thrive and lead. Our campus is fully equipped with high-tech science & computer labs, virtual visual auditoriums, and world-class athletic sports grounds.\",\"imgUrl\":\"https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80\"}")
                    .build());

            pageSectionRepository.save(PageSection.builder()
                    .pageId(savedHome.getId())
                    .type("FOUNDERS")
                    .positionOrder(6)
                    .config("{\"title\":\"Our Visionary Founders\",\"founders\":[{\"name\":\"Dr. Arthur Pendragon\",\"role\":\"Founder & Managing Director\",\"bio\":\"With over 25 years in secondary pedagogy, Arthur envisions a learning architecture where concept clarity comes first.\",\"photoUrl\":\"https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80\"},{\"name\":\"Prof. Guinevere Vance\",\"role\":\"Co-Founder & Academic Dean\",\"bio\":\"Guinevere designs the core logic curriculum and rank acceleration models across all sister branch campuses.\",\"photoUrl\":\"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80\"}]}")
                    .build());

            pageSectionRepository.save(PageSection.builder()
                    .pageId(savedHome.getId())
                    .type("FACILITIES")
                    .positionOrder(7)
                    .config("{\"title\":\"Our World-Class Infrastructure\",\"facilities\":[{\"title\":\"STEM & Robotics Hub\",\"description\":\"Featuring high-tech microprocessors, 3D printing labs, and interactive programming kits.\",\"photoUrl\":\"https://images.unsplash.com/photo-1564069114354-d1a6e0e1cf2e?auto=format&fit=crop&w=500&q=80\"},{\"title\":\"Championship Athletics Arena\",\"description\":\"State-of-the-art synthetic tracks, multi-sport courts, and professional training coaches.\",\"photoUrl\":\"https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=500&q=80\"},{\"title\":\"Smart Digitized Classrooms\",\"description\":\"Fully climate-controlled spaces with responsive touch screens and high-fidelity sound.\",\"photoUrl\":\"https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=500&q=80\"}]}")
                    .build());

            pageSectionRepository.save(PageSection.builder()
                    .pageId(savedHome.getId())
                    .type("PHOTO_GRID")
                    .positionOrder(8)
                    .config("{\"title\":\"Campus Life & Moments Grid\",\"photos\":[{\"url\":\"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80\",\"caption\":\"Science Fair Project Exhibition\",\"category\":\"ACADEMICS\"},{\"url\":\"https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80\",\"caption\":\"Inter-Branch Football Finals\",\"category\":\"SPORTS\"},{\"url\":\"https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80\",\"caption\":\"Annual Day Instrumental Symphony\",\"category\":\"CULTURAL\"},{\"url\":\"https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80\",\"caption\":\"Graduation Ceremony Group Portrait\",\"category\":\"CAMPUS\"}]}")
                    .build());

            // Admissions Page
            Page admPage = Page.builder()
                    .tenantId(tenantId)
                    .title("Admissions")
                    .slug("admissions")
                    .status("PUBLISHED")
                    .build();
            Page savedAdm = pageRepository.save(admPage);

            pageSectionRepository.save(PageSection.builder()
                    .pageId(savedAdm.getId())
                    .type("HERO")
                    .positionOrder(1)
                    .config("{\"title\":\"Secure Your Child's Academic Seat\",\"subtitle\":\"Admissions for the cohort of 2026-27 are officially open. Express interest using our interactive form below.\"}")
                    .build());

            pageSectionRepository.save(PageSection.builder()
                    .pageId(savedAdm.getId())
                    .type("DISCLOSURES")
                    .positionOrder(2)
                    .config("{\"title\":\"Board Compliances & Affiliation Certificates\",\"link1_text\":\"View Statutory Board Affiliation Certificate (PDF)\"}")
                    .build());

            // Academics / Courses Page
            Page coursePage = Page.builder()
                    .tenantId(tenantId)
                    .title("Academics")
                    .slug("courses")
                    .status("PUBLISHED")
                    .build();
            pageRepository.save(coursePage);

            // Faculty Page
            Page facultyPage = Page.builder()
                    .tenantId(tenantId)
                    .title("Faculty")
                    .slug("faculty")
                    .status("PUBLISHED")
                    .build();
            pageRepository.save(facultyPage);

            // Fees Page
            Page billingPage = Page.builder()
                    .tenantId(tenantId)
                    .title("Fees & Payments")
                    .slug("fees")
                    .status("PUBLISHED")
                    .build();
            pageRepository.save(billingPage);

            // Contact Page
            Page contactPage = Page.builder()
                    .tenantId(tenantId)
                    .title("Contact Us")
                    .slug("contact")
                    .status("PUBLISHED")
                    .build();
            pageRepository.save(contactPage);

            // School Announcements Page
            Page newsPage = Page.builder()
                    .tenantId(tenantId)
                    .title("News & Events")
                    .slug("news")
                    .status("PUBLISHED")
                    .build();
            pageRepository.save(newsPage);

            // Student Grades Page
            Page gradesPage = Page.builder()
                    .tenantId(tenantId)
                    .title("Student Grades")
                    .slug("grades")
                    .status("PUBLISHED")
                    .build();
            pageRepository.save(gradesPage);

            // Campus Life Gallery Page
            Page galleryPage = Page.builder()
                    .tenantId(tenantId)
                    .title("Campus Gallery")
                    .slug("gallery")
                    .status("PUBLISHED")
                    .build();
            pageRepository.save(galleryPage);

            // Careers Portal Page
            Page careerPage = Page.builder()
                    .tenantId(tenantId)
                    .title("Careers")
                    .slug("careers")
                    .status("PUBLISHED")
                    .build();
            pageRepository.save(careerPage);

            // CBSE Mandatory Disclosures Page (Appendix IX)
            Page disclosurePage = Page.builder()
                    .tenantId(tenantId)
                    .title("Mandatory Disclosures")
                    .slug("disclosures")
                    .status("PUBLISHED")
                    .build();
            pageRepository.save(disclosurePage);

            // Transfer Certificate (TC) Page
            Page tcPage = Page.builder()
                    .tenantId(tenantId)
                    .title("Transfer Certificate")
                    .slug("tc")
                    .status("PUBLISHED")
                    .build();
            pageRepository.save(tcPage);

            // 4. Seed Academic Courses
            courseRepository.save(AcademicCourse.builder()
                    .tenantId(tenantId)
                    .name("Honors Computer Science")
                    .gradeLevel("High School (G9-12)")
                    .description("Introductory object-oriented programming in Java and standard algorithm structures.")
                    .syllabusSummary("Methods, Classes, Arrays, Algorithmic Complexity, Recursion")
                    .build());

            courseRepository.save(AcademicCourse.builder()
                    .tenantId(tenantId)
                    .name("Advanced Placement Physics")
                    .gradeLevel("High School (G9-12)")
                    .description("Deep dive into classical mechanics, electromagnetism, and optics principles.")
                    .syllabusSummary("Newtonian Mechanics, Thermodynamics, Maxwell Equations")
                    .build());

            courseRepository.save(AcademicCourse.builder()
                    .tenantId(tenantId)
                    .name("Primary Mathematics & Logic")
                    .gradeLevel("Primary School (G1-5)")
                    .description("Fostering core number sense, fractional logic, and spatial geometries using interactive visual tools.")
                    .syllabusSummary("Fractions, Geometries, Logical puzzles")
                    .build());

            // 5. Seed Faculty Members
            facultyRepository.save(FacultyMember.builder()
                    .tenantId(tenantId)
                    .name("Dr. Arthur Pendragon")
                    .designation("Head of Science Department")
                    .qualification("Ph.D. in Theoretical Chemistry")
                    .bio("Arthur has over 15 years of academic research and classroom teaching experience.")
                    .build());

            facultyRepository.save(FacultyMember.builder()
                    .tenantId(tenantId)
                    .name("Prof. Guinevere Vance")
                    .designation("Mathematics Lead Instructor")
                    .qualification("M.Sc. in Applied Mathematics")
                    .bio("Guinevere specializes in making advanced logic, calculus, and algebra incredibly accessible.")
                    .build());

            // 5.5 Seed Academic Programs (Narayana-style Coaching and Career streams)
            programRepository.save(AcademicProgram.builder()
                    .tenantId(tenantId)
                    .name("Narayana Schools")
                    .type("SCHOOL")
                    .description("Holistic childhood development programs designed specifically for Primary & Middle school (K-10).")
                    .details("Holistic Academic Excellence, Critical Logic Thinking, Advanced Science & Art Expos, Age-appropriate physical training and cognitive development schedules.")
                    .build());

            programRepository.save(AcademicProgram.builder()
                    .tenantId(tenantId)
                    .name("Integrated Junior Colleges")
                    .type("COLLEGE")
                    .description("Rigorous board examination mentoring and preparation integrated with professional career counseling (Grades 11-12).")
                    .details("Dual-focused board preparation, Deep concept clarity in mathematics, physics & chemistry, dedicated doubt-clearing sessions, and career path guidance.")
                    .build());

            programRepository.save(AcademicProgram.builder()
                    .tenantId(tenantId)
                    .name("NEET & JEE Coaching Centres")
                    .type("COACHING")
                    .description("India's premier engineering and medical rank training program with focused assessment models.")
                    .details("Weekly custom-schedule mock tests, comprehensive performance analytics dashboards, personalized doubt assistance, and daily rank acceleration modules.")
                    .build());

            programRepository.save(AcademicProgram.builder()
                    .tenantId(tenantId)
                    .name("Professional Entrepreneurship Academies")
                    .type("PROFESSIONAL")
                    .description("Preparing next-generation business leaders, software engineers, and new-age digital innovators.")
                    .details("Hands-on coding bootcamps, startup incubation models, global mentorship webinars, and industrial internship placements.")
                    .build());

            // 5.8 Seed Student Achievers (Narayana-style board toppers and rankers)
            achieverRepository.save(StudentAchiever.builder()
                    .tenantId(tenantId)
                    .name("Riddhi Sharma")
                    .score("CBSE Board (499/500)")
                    .courseName("Class 12 Commerce")
                    .testimonialText("The structured curriculum, constant counseling, and mock schedules at Pioneer Academy kept me focused. Regular assessments and approachable teachers made advanced calculus and accounting incredibly easy to master.")
                    .build());

            achieverRepository.save(StudentAchiever.builder()
                    .tenantId(tenantId)
                    .name("Somya Sharma")
                    .score("NEET UG (AIR 14)")
                    .courseName("Pre-Medical coaching")
                    .testimonialText("Securing All India Rank 14 has been the absolute pinnacle of my academic life. The personalized mentorship, rank-boosting schedules, and detailed evaluations here kept me highly motivated and sharp until the end.")
                    .build());

            achieverRepository.save(StudentAchiever.builder()
                    .tenantId(tenantId)
                    .name("B. Sanjana Reddy")
                    .score("CBSE Board (498/500)")
                    .courseName("Class 12 Science")
                    .testimonialText("This institution provides an extraordinary learning environment with conceptual study modules. The weekly doubt-resolution sessions and continuous mentoring boosted my exam confidence and results.")
                    .build());

            // 5.9 Seed Campus Life Galleries
            galleryRepository.save(GalleryItem.builder()
                    .tenantId(tenantId)
                    .type("PHOTO")
                    .title("STEM & Robotics Innovation Fair")
                    .category("Academic Expo")
                    .mediaUrl("https://images.unsplash.com/photo-1564069114354-d1a6e0e1cf2e?auto=format&fit=crop&w=800&q=80")
                    .build());

            galleryRepository.save(GalleryItem.builder()
                    .tenantId(tenantId)
                    .type("PHOTO")
                    .title("Inter-Branch Soccer League Championship")
                    .category("Sports Day")
                    .mediaUrl("https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80")
                    .build());

            galleryRepository.save(GalleryItem.builder()
                    .tenantId(tenantId)
                    .type("PHOTO")
                    .title("Annual Theater and Orchestral Concert Highlights")
                    .category("Annual Day")
                    .mediaUrl("https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80")
                    .build());

            galleryRepository.save(GalleryItem.builder()
                    .tenantId(tenantId)
                    .type("VIDEO")
                    .title("Morning Assembly Assembly & Student Pledge highlights")
                    .category("Assembly Highlights")
                    .mediaUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")
                    .build());

            // 5.9.5 Seed School Branches (Narayana-style nationwide campuses)
            branchRepository.save(SchoolBranch.builder()
                    .tenantId(tenantId)
                    .name("Madhapur IT-Corridor Campus")
                    .state("Telangana")
                    .city("Hyderabad")
                    .address("Patrika Nagar, Madhapur, Hyderabad, Telangana 500081")
                    .contactEmail("madhapur@pioneer.edu")
                    .phone("+91 40 102 3344")
                    .build());

            branchRepository.save(SchoolBranch.builder()
                    .tenantId(tenantId)
                    .name("Secunderabad Central Campus")
                    .state("Telangana")
                    .city("Hyderabad")
                    .address("S P Road, Secunderabad, Telangana 500003")
                    .contactEmail("secunderabad@pioneer.edu")
                    .phone("+91 40 102 3345")
                    .build());

            branchRepository.save(SchoolBranch.builder()
                    .tenantId(tenantId)
                    .name("HSR Layout Tech Campus")
                    .state("Karnataka")
                    .city("Bengaluru")
                    .address("Sector 2, HSR Layout, Bengaluru, Karnataka 560102")
                    .contactEmail("hsr@pioneer.edu")
                    .phone("+91 80 102 3355")
                    .build());

            branchRepository.save(SchoolBranch.builder()
                    .tenantId(tenantId)
                    .name("Dwarka Institutional Campus")
                    .state("Delhi")
                    .city("New Delhi")
                    .address("Sector 10, Dwarka, New Delhi, 110075")
                    .contactEmail("dwarka@pioneer.edu")
                    .phone("+91 11 102 3366")
                    .build());

            // 5.9.8 Seed Enrichment Activities (Narayana-style nSports and Uniform guides)
            enrichmentRepository.save(EnrichmentActivity.builder()
                    .tenantId(tenantId)
                    .type("SPORTS")
                    .title("nSports Athletics & League Championship")
                    .description("Our flagship physical development program, introducing structured basketball, football, and track training schedules.")
                    .details("Weekly inter-school leagues, international-certified fitness coaches, state-of-the-art sports complex courts, and student physical health analytics report charts.")
                    .build());

            enrichmentRepository.save(EnrichmentActivity.builder()
                    .tenantId(tenantId)
                    .type("UNIFORMS")
                    .title("Official School Uniform Protocols")
                    .description("Official dress codes designed to instill parity, shared identity, discipline, and pride among students.")
                    .details("Formal academic days uniforms, active sports tracksuits for training days, and seasonal wear/aprons for senior laboratory experiments.")
                    .build());

            enrichmentRepository.save(EnrichmentActivity.builder()
                    .tenantId(tenantId)
                    .type("EXPO")
                    .title("National STEM & Robotics Innovation Fair")
                    .description("Instilling conceptual scientific thought, logical design, and hands-on coding experiences from an early age.")
                    .details("Annual student project expo galleries, live robot combat arenas, innovative software code solutions, and parents-teachers trust evaluations.")
                    .build());

            // 5.9.9 Seed Job Openings
            JobPosting physJob = jobRepository.save(JobPosting.builder()
                    .tenantId(tenantId)
                    .title("Senior Physics Faculty (IIT-JEE Prep)")
                    .department("Competitive Coaching")
                    .qualification("M.Sc. / Ph.D. in Physics or Engineering")
                    .experience("5+ years")
                    .description("Deliver high-level lectures on classical mechanics, electrodynamics, and wave optics. Design Weekly rank-boosting mock sheets and assist competitive aspirants.")
                    .build());

            jobRepository.save(JobPosting.builder()
                    .tenantId(tenantId)
                    .title("Primary School Mathematics Teacher")
                    .department("Academics")
                    .qualification("B.Sc. / B.Ed. in Mathematics")
                    .experience("2-3 years")
                    .description("Instruct basic mathematical concepts, fractional logic, and spatial geometries using interactive visual aids for grades 1-5.")
                    .build());

            // Seed a default applicant
            applicationRepository.save(JobApplication.builder()
                    .tenantId(tenantId)
                    .jobId(physJob.getId())
                    .jobTitle(physJob.getTitle())
                    .candidateName("Bruce Banner")
                    .candidateEmail("gamma@mail.com")
                    .candidatePhone("+1 (555) 762-2374")
                    .status("PENDING")
                    .build());

            // 5.9.9.5 Seed CBSE Mandatory Disclosures 3-Year Board Results
            // Class 10
            boardResultRepository.save(BoardResult.builder()
                    .tenantId(tenantId)
                    .classLevel("CLASS 10")
                    .assessmentYear(2023)
                    .registeredStudents(150)
                    .passedStudents(150)
                    .passPercentage(100.0)
                    .remarks("Outstanding State District Toppers")
                    .build());

            boardResultRepository.save(BoardResult.builder()
                    .tenantId(tenantId)
                    .classLevel("CLASS 10")
                    .assessmentYear(2024)
                    .registeredStudents(175)
                    .passedStudents(174)
                    .passPercentage(99.4)
                    .remarks("First Position in Delhi Zone")
                    .build());

            boardResultRepository.save(BoardResult.builder()
                    .tenantId(tenantId)
                    .classLevel("CLASS 10")
                    .assessmentYear(2025)
                    .registeredStudents(200)
                    .passedStudents(200)
                    .passPercentage(100.0)
                    .remarks("Cent-percent Distinction Marks Board clearance")
                    .build());

            // Class 12
            boardResultRepository.save(BoardResult.builder()
                    .tenantId(tenantId)
                    .classLevel("CLASS 12")
                    .assessmentYear(2023)
                    .registeredStudents(120)
                    .passedStudents(118)
                    .passPercentage(98.3)
                    .remarks("High level JEE & NEET qualifiers")
                    .build());

            boardResultRepository.save(BoardResult.builder()
                    .tenantId(tenantId)
                    .classLevel("CLASS 12")
                    .assessmentYear(2024)
                    .registeredStudents(140)
                    .passedStudents(140)
                    .passPercentage(100.0)
                    .remarks("District Toppers in Science stream")
                    .build());

            boardResultRepository.save(BoardResult.builder()
                    .tenantId(tenantId)
                    .classLevel("CLASS 12")
                    .assessmentYear(2025)
                    .registeredStudents(160)
                    .passedStudents(159)
                    .passPercentage(99.3)
                    .remarks("Secured AIR 14 & 18 NEET national ranks")
                    .build());

            // 5.9.9.8 Seed Transfer Certificates (TCs for CBSE Compliance verification)
            tcRepository.save(TransferCertificate.builder()
                    .tenantId(tenantId)
                    .studentName("Harry Potter")
                    .admissionNo("ADM-901")
                    .classLevel("10th")
                    .section("A")
                    .fatherName("James Potter")
                    .aadharNo("1234-5678-9012")
                    .tcNumber("TC-2026-001")
                    .issueDate(LocalDateTime.now().minusDays(5))
                    .pdfUrl("/documents/tc-harry-potter.pdf")
                    .build());

            tcRepository.save(TransferCertificate.builder()
                    .tenantId(tenantId)
                    .studentName("Ron Weasley")
                    .admissionNo("ADM-902")
                    .classLevel("12th")
                    .section("B")
                    .fatherName("Arthur Weasley")
                    .aadharNo("9876-5432-1098")
                    .tcNumber("TC-2026-002")
                    .issueDate(LocalDateTime.now().minusDays(2))
                    .pdfUrl("/documents/tc-ron-weasley.pdf")
                    .build());

            // 6. Seed Fee Categories & Invoices
            FeeItem tuitionFee = feeItemRepository.save(FeeItem.builder()
                    .tenantId(tenantId)
                    .name("Term 1 Tuition Fee")
                    .amount(500.0)
                    .description("Standard academic enrollment tuition bill")
                    .gradeLevel("All Grades")
                    .build());

            FeeItem busFee = feeItemRepository.save(FeeItem.builder()
                    .tenantId(tenantId)
                    .name("Bus Transportation Fee")
                    .amount(150.0)
                    .description("Annual school bus line commuting pass")
                    .gradeLevel("All Grades")
                    .build());

            invoiceRepository.save(StudentInvoice.builder()
                    .tenantId(tenantId)
                    .studentName("John Doe")
                    .gradeLevel("10th")
                    .feeItemName(tuitionFee.getName())
                    .amount(tuitionFee.getAmount())
                    .status("PENDING")
                    .dueDate(LocalDateTime.now().plusDays(30))
                    .admissionNo("ADM-101")
                    .section("A")
                    .fatherName("Richard Doe")
                    .aadharNo("1234-5678-9012")
                    .build());

            invoiceRepository.save(StudentInvoice.builder()
                    .tenantId(tenantId)
                    .studentName("Jane Smith")
                    .gradeLevel("2nd")
                    .feeItemName(busFee.getName())
                    .amount(busFee.getAmount())
                    .status("PENDING")
                    .dueDate(LocalDateTime.now().plusDays(30))
                    .admissionNo("ADM-102")
                    .section("B")
                    .fatherName("Robert Smith")
                    .aadharNo("9876-5432-1098")
                    .build());

            // 7. Seed Admissions Inquiry leads
            admissionRepository.save(AdmissionLead.builder()
                    .tenantId(tenantId)
                    .studentName("Robert Junior")
                    .gradeLevel("Kindergarten")
                    .parentName("Robert Senior")
                    .parentEmail("parent@email.com")
                    .parentPhone("+1 (555) 012-3456")
                    .status("PENDING")
                    .message("Inquiring about bus route schedules and kindergarten timings.")
                    .build());

            // 8. Seed Support Inquiries
            supportRepository.save(SupportInquiry.builder()
                    .tenantId(tenantId)
                    .senderName("Diana Prince")
                    .senderEmail("diana@amazon.com")
                    .subject("Locker key card replacement")
                    .message("My daughter lost her gym locker key card. Who is the administrative contact person to issue a replacement?")
                    .status("PENDING")
                    .build());

            // 9. Seed Student Grades
            gradeRepository.save(StudentGrade.builder()
                    .tenantId(tenantId)
                    .studentName("John Doe")
                    .subjectName("Mathematics")
                    .term("Term 1 Midterm")
                    .grade("A+")
                    .remarks("Demonstrates outstanding logical capability and mathematical problem-solving skills.")
                    .admissionNo("ADM-101")
                    .classLevel("10th")
                    .section("A")
                    .fatherName("Richard Doe")
                    .aadharNo("1234-5678-9012")
                    .build());

            gradeRepository.save(StudentGrade.builder()
                    .tenantId(tenantId)
                    .studentName("John Doe")
                    .subjectName("Science & Physics")
                    .term("Term 1 Midterm")
                    .grade("A")
                    .remarks("Excellent lab experimentation focus and scientific writing clarity.")
                    .admissionNo("ADM-101")
                    .classLevel("10th")
                    .section("A")
                    .fatherName("Richard Doe")
                    .aadharNo("1234-5678-9012")
                    .build());

            // 10. Seed News Bulletins & Circulars
            newsRepository.save(SchoolNews.builder()
                    .tenantId(tenantId)
                    .title("AP Science Assessment Schedules Published")
                    .content("The complete timetable for Advanced Placement science assessment terms has been published. Midterm assessments are officially scheduled to begin from August 1st, 2026.")
                    .author("Principal's Office")
                    .publishedDate(LocalDateTime.now().minusDays(1))
                    .build());

            // 11. Seed Calendar Events
            eventRepository.save(SchoolEvent.builder()
                    .tenantId(tenantId)
                    .title("Annual Parents-Teacher Association Meet")
                    .description("Discussion on upcoming STEM laboratory curriculum expansions and student wellness program budgets.")
                    .eventDate(LocalDateTime.now().plusDays(7))
                    .location("Main Auditorium")
                    .build());

            System.out.println("⭐ Pre-populated school 'SaaS Pioneer Academy' successfully seeded!");
        }
    }
}
