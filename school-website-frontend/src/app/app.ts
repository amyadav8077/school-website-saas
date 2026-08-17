import { Component, OnInit, inject, signal, effect, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { TenantOnboardingComponent } from './admin/tenant-onboarding/tenant-onboarding.component';
import { BrandingSettingsComponent } from './admin/branding-settings/branding-settings.component';
import { PageBuilderComponent } from './admin/page-builder/page-builder.component';
import { AdmissionsFormComponent } from './pages/admissions/admissions-form.component';
import { AdmissionsManagerComponent } from './admin/admissions-manager/admissions-manager.component';
import { AcademicsManagerComponent } from './admin/academics-manager/academics-manager.component';
import { BillingManagerComponent } from './admin/billing-manager/billing-manager.component';
import { PaymentPortalComponent } from './pages/payment/payment-portal.component';
import { ContactFormComponent } from './pages/contact/contact-form.component';
import { SupportManagerComponent } from './admin/support-manager/support-manager.component';
import { NewsManagerComponent } from './admin/news-manager/news-manager.component';
import { AchieversCarouselComponent } from './pages/achievers/achievers-carousel.component';
import { GradebookManagerComponent } from './admin/gradebook-manager/gradebook-manager.component';
import { ReportCardLookupComponent } from './pages/grades/report-card-lookup.component';
import { CampusGalleryComponent } from './pages/gallery/campus-gallery.component';
import { SchoolBranchesComponent } from './pages/branches/school-branches.component';
import { CampusEnrichmentComponent } from './pages/enrichment/campus-enrichment.component';
import { CareersPortalComponent } from './pages/careers/careers-portal.component';
import { CareersManagerComponent } from './admin/careers-manager/careers-manager.component';
import { PublicDisclosuresComponent } from './pages/disclosures/public-disclosures.component';
import { TCManagerComponent } from './admin/tc-manager/tc-manager.component';
import { TCLookupComponent } from './pages/tc-lookup/tc-lookup.component';
import { LoginComponent } from './admin/login/login.component';
import { UserProfileComponent } from './admin/user-profile/user-profile.component';
import { ScrollRevealDirective } from './shared/directives/scroll-reveal.directive';
import { HeroCarouselComponent } from './pages/hero-carousel/hero-carousel.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';
import { AdmissionsPromoComponent } from './pages/admissions-promo/admissions-promo.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    FormsModule,
    LoginComponent,
    TenantOnboardingComponent,
    BrandingSettingsComponent,
    PageBuilderComponent,
    AdmissionsFormComponent,
    AdmissionsManagerComponent,
    AcademicsManagerComponent,
    BillingManagerComponent,
    PaymentPortalComponent,
    ContactFormComponent,
    SupportManagerComponent,
    NewsManagerComponent,
    AchieversCarouselComponent,
    GradebookManagerComponent,
    ReportCardLookupComponent,
    CampusGalleryComponent,
    SchoolBranchesComponent,
    CampusEnrichmentComponent,
    CareersPortalComponent,
    CareersManagerComponent,
    PublicDisclosuresComponent,
    TCManagerComponent,
    TCLookupComponent,
    UserProfileComponent,
    ScrollRevealDirective,
    HeroCarouselComponent,
    ErrorPageComponent,
    AdmissionsPromoComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly titleService = inject(Title);
  private static readonly PLATFORM_TITLE = 'School Website SaaS Platform';
  protected readonly title = signal(App.PLATFORM_TITLE);

  constructor() {
    // Keep the browser tab title in sync with the active tenant. On a tenant's
    // public site (or when an admin selects a tenant) show the school's name;
    // fall back to the platform name on the marketing/admin hub.
    effect(() => {
      const tenant = this.activeTenant();
      this.titleService.setTitle(tenant?.name ? tenant.name : App.PLATFORM_TITLE);
    });
  }
  protected readonly backendStatus = signal<string>('Checking...');
  protected readonly backendMessage = signal<string>('');
  protected readonly currentUser = signal<any>(null);

  // Track the active tenant being customized / previewed
  protected readonly activeTenant = signal<any>(null);
  protected readonly schoolPages = signal<any[]>([]);

  // Error/offline state for the public site preview
  protected readonly connectionLost = signal<boolean>(false);
  protected readonly activePreviewPage = signal<any>(null);
  protected readonly isMobileMenuOpen = signal<boolean>(false);
  protected readonly showMoreDropdown = signal<boolean>(false);
  protected readonly maxVisibleTabs = signal<number>(5);

  @HostListener('window:resize', [])
  onResize() {
    this.updateMaxVisibleTabs();
  }

  @HostListener('document:click', [])
  onDocumentClick() {
    this.showMoreDropdown.set(false);
  }

  toggleMoreDropdown(event: Event) {
    event.stopPropagation();
    this.showMoreDropdown.set(!this.showMoreDropdown());
  }

  private updateMaxVisibleTabs() {
    if (typeof window !== 'undefined') {
      const containerWidth = window.innerWidth;
      // Space for school brand logo and margins is roughly 380px.
      // Each tab requires approx 120px to prevent overflow in a single row.
      const availableWidth = containerWidth - 380;
      const calculatedTabs = Math.floor(availableWidth / 120);
      // Clamp between at least 1 and up to total pages
      const finalCount = Math.max(1, calculatedTabs);
      this.maxVisibleTabs.set(finalCount);
    }
  }

  // SaaS Hub tenants directory
  protected readonly tenantsList = signal<any[]>([]);

  // Home Page Image Slider State
  protected readonly activeHomeSlideIdx = signal<number>(0);
  protected readonly activeBanner = signal<any>(null);

  // Admissions promo popup (rich splash overlay)
  protected readonly promoConfig = signal<any>(null);
  protected readonly showPromo = signal<boolean>(false);

  // Top announcement banner visibility (dismissible)
  protected readonly showAnnouncement = signal<boolean>(true);

  // Dynamic public catalog directories
  protected readonly publicCourses = signal<any[]>([]);
  protected readonly publicFaculty = signal<any[]>([]);
  protected readonly publicAchievers = signal<any[]>([]);
  protected readonly publicPrograms = signal<any[]>([]);
  protected readonly publicNews = signal<any[]>([]);
  protected readonly publicEvents = signal<any[]>([]);

  // Synchronization triggers
  protected readonly admissionsRefreshTrigger = signal<number>(0);
  protected readonly billingRefreshTrigger = signal<number>(0);
  protected readonly supportRefreshTrigger = signal<number>(0);
  protected readonly gradebookRefreshTrigger = signal<number>(0);
  protected readonly careersRefreshTrigger = signal<number>(0);
  protected readonly tcRefreshTrigger = signal<number>(0);

  // Parent lookup link pre-fill synchronization
  protected readonly prefilledSearchName = signal<string>('');
  protected readonly showGradesDropdown = signal<boolean>(false);

  // Security Role-Based Access Control
  protected readonly activeRole = signal<string>('SCHOOL_ADMIN'); // SCHOOL_ADMIN, PARENT_VISITOR

  // When the app is opened via a tenant's custom domain / subdomain, it runs in
  // public-only mode: no admin console, no onboarding, forced visitor view.
  protected readonly publicSiteMode = signal<boolean>(false);
  protected readonly publicSiteLoading = signal<boolean>(false);
  protected readonly publicSiteError = signal<boolean>(false);
  private publicHost = '';
  private publicRetryCount = 0;
  protected readonly isFullscreenPreview = signal<boolean>(false);
  protected readonly activeGalleryFilter = signal<string>('ALL');
  protected readonly activeCloneTenantId = signal<number | null>(null);
  protected readonly isCloning = signal<boolean>(false);
  protected readonly cloneError = signal<string>('');
  cloneName = '';
  cloneSubdomain = '';

  // Dynamic design tokens
  protected readonly primaryColor = signal<string>('#1e3a8a');
  protected readonly secondaryColor = signal<string>('#3b82f6');
  protected readonly accentColor = signal<string>('#f59e0b');
  protected readonly fontFamily = signal<string>('Segoe UI');
  protected readonly facebookUrl = signal<string>('');
  protected readonly instagramUrl = signal<string>('');
  protected readonly twitterUrl = signal<string>('');
  protected readonly youtubeUrl = signal<string>('');
  protected readonly linkedinUrl = signal<string>('');
  protected readonly googleMapUrl = signal<string>('');
  protected readonly logoUrl = signal<string>('🏰');
  protected readonly contactEmail = signal<string>('info@schoolsaas.com');
  protected readonly contactPhone = signal<string>('+1 (555) 019-9000');

  // Footer content
  protected readonly footerMotto = signal<string>('Knowledge · Character · Service');
  protected readonly footerAddress = signal<string>('123 Campus Avenue, Education City, 560001');
  protected readonly footerOfficeHours = signal<string>('Mon – Fri · 8:00 AM – 4:00 PM');
  protected readonly prospectusUrl = signal<string>('');
  protected readonly handbookUrl = signal<string>('');
  protected readonly academicCalendarUrl = signal<string>('');

  // Footer student-resource links
  protected readonly studentPortalUrl = signal<string>('');
  protected readonly parentPortalUrl = signal<string>('');
  protected readonly libraryUrl = signal<string>('');
  protected readonly transportUrl = signal<string>('');
  protected readonly calendarUrl = signal<string>('');

  // Configurable footer link columns (internal page links)
  protected readonly footerExploreLinks = signal<{ label: string; slug: string }[]>([]);
  protected readonly footerResourceLinks = signal<{ label: string; slug: string }[]>([]);
  protected readonly footerAcademicsLinks = signal<{ label: string; slug: string }[]>([]);
  protected readonly footerAdmissionsLinks = signal<{ label: string; slug: string }[]>([]);

  ngOnInit() {
    this.checkBackendHealth();
    this.updateMaxVisibleTabs();

    // If opened via a tenant's custom domain / subdomain, serve that school's
    // public website directly and skip the admin dashboard entirely.
    if (this.tryResolveTenantByHost()) {
      return;
    }

    if (typeof sessionStorage !== 'undefined') {
      const savedUser = sessionStorage.getItem('school_saas_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          this.currentUser.set(user);
          if (user.role === 'TENANT_ADMIN') {
            this.activeTenant.set({ id: user.tenantId, name: user.tenantName, subdomain: user.subdomain });
            this.loadTenantProjectAndWebsite(user.subdomain);
          } else {
            // Super-admin: the tenants list is admin-only, fetch it now that we have a token.
            this.fetchTenantsList();
          }
        } catch (e) {
          console.error('Failed to parse saved user session', e);
          sessionStorage.removeItem('school_saas_user');
        }
      }
      // Anonymous visitors: do NOT call the admin-only tenants endpoint (it would 403).
      // The list is loaded after a super-admin logs in (see onLoginSuccess).
    }
  }

  /**
   * Detects whether the app is being served from a tenant's own domain or
   * subdomain. Platform hosts (localhost, *.vercel.app, bare IPs) fall through
   * to the normal admin/demo experience. A recognised tenant host switches the
   * app into public-only mode and loads that school's website directly.
   *
   * @returns true if a tenant host was detected (resolution in progress).
   */
  tryResolveTenantByHost(): boolean {
    if (typeof window === 'undefined' || !window.location) {
      return false;
    }
    const host = (window.location.hostname || '').toLowerCase();
    if (this.isPlatformHost(host)) {
      return false;
    }
    // We're on a tenant host: commit to public mode immediately so the visitor
    // never sees the admin dashboard, even while the data is loading.
    this.publicHost = host;
    this.publicSiteMode.set(true);
    this.activeRole.set('PARENT_VISITOR');
    this.loadPublicSite();
    return true;
  }

  /**
   * Loads the entire public site in a single request. On transient failures
   * (e.g. a backend cold start) it retries with backoff and shows a branded
   * loading screen — never a broken page. A confirmed "unknown host" stops
   * retrying and shows a friendly not-found screen.
   */
  loadPublicSite(): void {
    this.publicSiteLoading.set(true);
    this.publicSiteError.set(false);

    this.http.get<any>(`http://localhost:8080/api/sites/bootstrap?host=${encodeURIComponent(this.publicHost)}`)
      .subscribe({
        next: (data) => {
          this.publicRetryCount = 0;
          this.applyBootstrap(data);
          this.publicSiteLoading.set(false);
        },
        error: (err) => {
          const status = err?.status;
          // 404 = host genuinely not mapped to a tenant; don't retry forever.
          if (status === 404) {
            this.publicSiteLoading.set(false);
            this.publicSiteError.set(true);
            return;
          }
          // Transient (0/5xx, e.g. backend waking up) — retry with backoff.
          if (this.publicRetryCount < 6) {
            this.publicRetryCount++;
            const delay = Math.min(1000 * this.publicRetryCount, 5000);
            setTimeout(() => this.loadPublicSite(), delay);
          } else {
            this.publicSiteLoading.set(false);
            this.publicSiteError.set(true);
          }
        }
      });
  }

  retryPublicSite(): void {
    this.publicRetryCount = 0;
    this.loadPublicSite();
  }

  /** Applies a single aggregated bootstrap payload to all public signals. */
  private applyBootstrap(data: any): void {
    if (!data || !data.tenant) {
      this.publicSiteError.set(true);
      return;
    }
    this.activeTenant.set(data.tenant);

    if (data.config) {
      this.applyBrandingTokens(data.config);
    }
    this.applyPagesData(data.pages || []);
    this.publicCourses.set(data.courses || []);
    this.publicPrograms.set(data.programs || []);
    this.publicFaculty.set(data.faculty || []);
    this.publicAchievers.set(data.achievers || []);
    this.publicNews.set(data.news || []);
    this.publicEvents.set(data.events || []);
    this.connectionLost.set(false);
  }

  private isPlatformHost(host: string): boolean {
    if (!host) return true;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') return true;
    if (host.endsWith('.vercel.app')) return true;
    if (host.endsWith('.onrender.com')) return true;
    // Bare IPv4 address.
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
    return false;
  }

  checkBackendHealth() {
    this.http.get<{status: string, message: string}>('http://localhost:8080/api/health')
      .subscribe({
        next: (data) => {
          this.backendStatus.set(data.status);
          this.backendMessage.set(data.message);
        },
        error: (err) => {
          this.backendStatus.set('DOWN');
          this.backendMessage.set('Could not connect to the backend server.');
          console.error(err);
        }
      });
  }

  fetchTenantsList() {
    // Admin-only endpoint; only meaningful for a logged-in super-admin.
    this.http.get<any[]>('http://localhost:8080/api/admin/tenants')
      .subscribe({
        next: (data) => this.tenantsList.set(data),
        error: (err) => {
          if (err?.status !== 401 && err?.status !== 403) {
            console.error('Failed to fetch tenants list', err);
          }
        }
      });
  }

  onTenantOnboarded(tenant: any) {
    this.activeTenant.set(tenant);
    this.loadBranding(tenant.subdomain);
    this.loadTenantPages(tenant.id);
    this.loadTenantCatalogs(tenant.id);
    this.loadTenantNotifications(tenant.id);
    this.fetchTenantsList();
  }

  onBrandingUpdated(config: any) {
    this.applyBrandingTokens(config);
    if (this.activeTenant()) {
      this.http.get<any>(`http://localhost:8080/api/admin/tenants/${this.activeTenant().subdomain}`)
        .subscribe({
          next: (tenant) => {
            this.activeTenant.set(tenant);
          },
          error: (err) => {
            console.error('Failed to reload tenant details', err);
          }
        });
    }
  }

  onContentModified() {
    if (this.activeTenant()) {
      this.loadTenantPages(this.activeTenant().id);
    }
  }

  onCatalogModified() {
    if (this.activeTenant()) {
      this.loadTenantCatalogs(this.activeTenant().id);
    }
  }

  onNotificationModified() {
    if (this.activeTenant()) {
      this.loadTenantNotifications(this.activeTenant().id);
    }
  }

  onGradebookModified() {
    this.gradebookRefreshTrigger.update(n => n + 1);
  }

  onBillingModified() {
    this.billingRefreshTrigger.update(n => n + 1);
  }

  onInquirySubmitted() {
    this.admissionsRefreshTrigger.update(n => n + 1);
  }

  onCareersModified() {
    this.careersRefreshTrigger.update(n => n + 1);
  }

  onTCModified() {
    this.tcRefreshTrigger.update(n => n + 1);
  }

  nextHomeSlide(total: number) {
    if (total <= 0) return;
    this.activeHomeSlideIdx.update(idx => (idx + 1) % total);
  }

  prevHomeSlide(total: number) {
    if (total <= 0) return;
    this.activeHomeSlideIdx.update(idx => (idx - 1 + total) % total);
  }

  onSupportSubmitted() {
    this.supportRefreshTrigger.update(n => n + 1);
  }

  loadBranding(subdomain: string) {
    this.http.get<any>(`http://localhost:8080/api/sites/${subdomain}/config`)
      .subscribe({
        next: (config) => {
          this.applyBrandingTokens(config);
        },
        error: (err) => {
          console.error('Failed to load branding config', err);
        }
      });
  }

  loadTenantPages(tenantId: number) {
    this.http.get<any>(`http://localhost:8080/api/sites/${tenantId}/pages`)
      .subscribe({
        next: (data: any[]) => this.applyPagesData(data),
        error: (err) => {
          console.error('Failed to load school pages', err);
          this.connectionLost.set(true);
          // Clear active page so no stale content renders beneath the error page
          this.activePreviewPage.set(null);
        }
      });
  }

  /** Sorts pages into the canonical nav order and picks the active page. */
  private applyPagesData(data: any[]): void {
    const pageSortOrder: Record<string, number> = {
      'home': 1,
      'courses': 2,
      'admissions': 3,
      'faculty': 4,
      'fees': 5,
      'careers': 6,
      'news': 7,
      'gallery': 8,
      'disclosures': 9,
      'tc': 10,
      'student-corner': 20,
      'parent-corner': 21
    };
    data.sort((a, b) => {
      const orderA = pageSortOrder[a.slug] || 99;
      const orderB = pageSortOrder[b.slug] || 99;
      return orderA - orderB;
    });

    this.schoolPages.set(data);
    this.connectionLost.set(false);

    // Select first page by default if none selected or if active preview no longer exists
    if (data.length > 0) {
      const currentActive = this.activePreviewPage();
      const found = currentActive ? data.find(p => p.id === currentActive.id) : null;
      this.activePreviewPage.set(found ? found : data[0]);
    } else {
      this.activePreviewPage.set(null);
    }
  }

  /** Retry loading the active tenant's pages after a connection error. */
  retryConnection() {
    const tenant = this.activeTenant();
    if (tenant?.id) {
      this.connectionLost.set(false);
      this.loadTenantPages(tenant.id);
      this.loadTenantCatalogs(tenant.id);
    }
  }

  loadTenantCatalogs(tenantId: number) {
    this.http.get<any[]>(`http://localhost:8080/api/sites/${tenantId}/courses`)
      .subscribe({ next: (data) => this.publicCourses.set(data), error: () => console.error('Failed to load public content') });

    this.http.get<any[]>(`http://localhost:8080/api/sites/${tenantId}/programs`)
      .subscribe({ next: (data) => this.publicPrograms.set(data), error: () => console.error('Failed to load public content') });

    this.http.get<any[]>(`http://localhost:8080/api/sites/${tenantId}/faculty`)
      .subscribe({ next: (data) => this.publicFaculty.set(data), error: () => console.error('Failed to load public content') });

    this.http.get<any[]>(`http://localhost:8080/api/sites/${tenantId}/achievers`)
      .subscribe({ next: (data) => this.publicAchievers.set(data), error: () => console.error('Failed to load public content') });
  }

  openAchievementsPage() {
    const existing = this.schoolPages().find(p => p.slug === 'achievements');
    this.activePreviewPage.set(existing ?? { slug: 'achievements', title: 'Achievements', sections: [] });
    this.isMobileMenuOpen.set(false);
    this.showMoreDropdown.set(false);
  }

  loadTenantNotifications(tenantId: number) {
    this.http.get<any[]>(`http://localhost:8080/api/sites/${tenantId}/news`)
      .subscribe({ next: (data) => this.publicNews.set(data), error: () => console.error('Failed to load public content') });

    this.http.get<any[]>(`http://localhost:8080/api/sites/${tenantId}/events`)
      .subscribe({ next: (data) => this.publicEvents.set(data), error: () => console.error('Failed to load public content') });
  }

  selectPreviewPage(page: any) {
    this.activePreviewPage.set(page);
    this.isMobileMenuOpen.set(false);
    this.showMoreDropdown.set(false);
    if (page.slug !== 'grades') {
      this.prefilledSearchName.set('');
    }
  }

  selectGradeLevelLookup(studentName: string, page: any) {
    this.prefilledSearchName.set(studentName);
    this.selectPreviewPage(page);
  }

  selectPreviewPageBySlug(slug: string) {
    const page = this.schoolPages().find(p => p.slug === slug);
    if (page) {
      this.activePreviewPage.set(page);
      this.isMobileMenuOpen.set(false);
      this.showMoreDropdown.set(false);
    }
  }

  applyBrandingTokens(config: any) {
    this.primaryColor.set(config.primaryColor);
    this.secondaryColor.set(config.secondaryColor);
    this.accentColor.set(config.accentColor);
    this.fontFamily.set(config.fontFamily);
    this.logoUrl.set(config.logoUrl || '🏰');
    this.contactEmail.set(config.contactEmail || 'info@' + (this.activeTenant()?.subdomain || 'school') + '.edu');
    this.contactPhone.set(config.contactPhone || '+1 (555) 019-9000');

    if (config.socialLinks) {
      try {
        const banner = JSON.parse(config.socialLinks);
        this.activeBanner.set(banner);
        this.facebookUrl.set(banner.facebookUrl || '');
        this.instagramUrl.set(banner.instagramUrl || '');
        this.twitterUrl.set(banner.twitterUrl || '');
        this.youtubeUrl.set(banner.youtubeUrl || '');
        this.linkedinUrl.set(banner.linkedinUrl || '');
        this.googleMapUrl.set(banner.googleMapUrl || '');
        if (banner.footerMotto) this.footerMotto.set(banner.footerMotto);
        if (banner.footerAddress) this.footerAddress.set(banner.footerAddress);
        if (banner.footerOfficeHours) this.footerOfficeHours.set(banner.footerOfficeHours);
        this.prospectusUrl.set(banner.prospectusUrl || '');
        this.handbookUrl.set(banner.handbookUrl || '');
        this.academicCalendarUrl.set(banner.academicCalendarUrl || '');
        this.studentPortalUrl.set(banner.studentPortalUrl || '');
        this.parentPortalUrl.set(banner.parentPortalUrl || '');
        this.libraryUrl.set(banner.libraryUrl || '');
        this.transportUrl.set(banner.transportUrl || '');
        this.calendarUrl.set(banner.calendarUrl || '');
        const footerCols = banner.footerColumns || {};
        this.footerExploreLinks.set(Array.isArray(footerCols.explore) ? footerCols.explore : []);
        this.footerResourceLinks.set(Array.isArray(footerCols.studentResources) ? footerCols.studentResources : []);
        this.footerAcademicsLinks.set(Array.isArray(footerCols.academics) ? footerCols.academics : []);
        this.footerAdmissionsLinks.set(Array.isArray(footerCols.admissions) ? footerCols.admissions : []);
        this.applyPromoConfig(banner);
      } catch (e) {
        this.activeBanner.set(null);
        this.facebookUrl.set('');
        this.instagramUrl.set('');
        this.twitterUrl.set('');
        this.youtubeUrl.set('');
        this.linkedinUrl.set('');
        this.googleMapUrl.set('');
        this.prospectusUrl.set('');
        this.handbookUrl.set('');
        this.academicCalendarUrl.set('');
        this.studentPortalUrl.set('');
        this.parentPortalUrl.set('');
        this.libraryUrl.set('');
        this.transportUrl.set('');
        this.calendarUrl.set('');
        this.footerExploreLinks.set([]);
        this.footerResourceLinks.set([]);
        this.footerAcademicsLinks.set([]);
        this.footerAdmissionsLinks.set([]);
        this.promoConfig.set(null);
        this.showPromo.set(false);
      }
    } else {
      this.activeBanner.set(null);
      this.facebookUrl.set('');
      this.instagramUrl.set('');
      this.twitterUrl.set('');
      this.youtubeUrl.set('');
      this.linkedinUrl.set('');
      this.googleMapUrl.set('');
      this.prospectusUrl.set('');
      this.handbookUrl.set('');
      this.academicCalendarUrl.set('');
      this.studentPortalUrl.set('');
      this.parentPortalUrl.set('');
      this.libraryUrl.set('');
      this.transportUrl.set('');
      this.calendarUrl.set('');
      this.footerExploreLinks.set([]);
      this.footerResourceLinks.set([]);
      this.footerAcademicsLinks.set([]);
      this.footerAdmissionsLinks.set([]);
      this.promoConfig.set(null);
      this.showPromo.set(false);
    }

    // Inject CSS Custom Properties dynamically!
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--tenant-primary', config.primaryColor);
      root.style.setProperty('--tenant-secondary', config.secondaryColor);
      root.style.setProperty('--tenant-accent', config.accentColor);
      root.style.setProperty('--tenant-font', config.fontFamily);
    }
  }

  /**
   * Reads the promo popup fields (stored inside the same banner JSON) and shows
   * the splash overlay once per session when enabled.
   */
  applyPromoConfig(banner: any) {
    if (banner && banner.promoEnabled) {
      this.promoConfig.set(banner);
      const dismissed = typeof sessionStorage !== 'undefined'
        && sessionStorage.getItem('school_saas_promo_dismissed') === (this.activeTenant()?.subdomain || '1');
      this.showPromo.set(!dismissed);
    } else {
      this.promoConfig.set(null);
      this.showPromo.set(false);
    }
  }

  closePromo() {
    this.showPromo.set(false);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('school_saas_promo_dismissed', this.activeTenant()?.subdomain || '1');
    }
  }

  onPromoCta(slug: string) {
    this.closePromo();
    this.selectPreviewPageBySlug(slug || 'admissions');
  }

  dismissAnnouncement() {
    this.showAnnouncement.set(false);
  }

  parsedSectionConfig(configStr: string): any {
    try {
      return JSON.parse(configStr);
    } catch (e) {
      return {};
    }
  }

  // Only trust embeddable URLs from known video/https hosts. This prevents
  // javascript:/data: and arbitrary hostile embeds injected via tenant content.
  private static readonly ALLOWED_EMBED_HOSTS = [
    'youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com',
    'player.vimeo.com', 'vimeo.com', 'drive.google.com'
  ];

  private isSafeEmbedUrl(url: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url, 'https://invalid.local');
      if (parsed.protocol !== 'https:') return false;
      const host = parsed.hostname.toLowerCase();
      return App.ALLOWED_EMBED_HOSTS.some(h => host === h || host.endsWith('.' + h));
    } catch {
      return false;
    }
  }

  getSafeUrl(url: string): SafeResourceUrl {
    if (!this.isSafeEmbedUrl(url)) {
      // Refuse to trust an unrecognized/unsafe URL; return a harmless blank.
      return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getCarouselImages(configStr: string): any[] {
    try {
      const config = JSON.parse(configStr);
      if (config.images && Array.isArray(config.images) && config.images.length > 0) {
        return config.images;
      }
      const fallback = [];
      if (config.img1) {
        fallback.push({ url: config.img1, caption: 'World-Class Campus Landscapes & Infrastructure' });
      }
      if (config.img2) {
        fallback.push({ url: config.img2, caption: 'High-Tech Interactive STEM Laboratories' });
      }
      return fallback;
    } catch (e) {
      return [];
    }
  }

  getVideoList(configStr: string): any[] {
    try {
      const config = JSON.parse(configStr);
      if (config.videos && Array.isArray(config.videos) && config.videos.length > 0) {
        return config.videos;
      }
      const fallback = [];
      if (config.video_url) {
        fallback.push({ url: config.video_url, title: config.title || 'Experience Our School Virtual Tour' });
      }
      return fallback;
    } catch (e) {
      return [];
    }
  }

  getFoundersList(configStr: string): any[] {
    try {
      const config = JSON.parse(configStr);
      return config.founders && Array.isArray(config.founders) ? config.founders : [];
    } catch (e) {
      return [];
    }
  }

  getFacilitiesList(configStr: string): any[] {
    try {
      const config = JSON.parse(configStr);
      return config.facilities && Array.isArray(config.facilities) ? config.facilities : [];
    } catch (e) {
      return [];
    }
  }

  getPhotoGridList(configStr: string): any[] {
    try {
      const config = JSON.parse(configStr);
      return config.photos && Array.isArray(config.photos) ? config.photos : [];
    } catch (e) {
      return [];
    }
  }

  resetDemo() {
    this.activeTenant.set(null);
    this.schoolPages.set([]);
    this.activePreviewPage.set(null);
    this.publicCourses.set([]);
    this.publicFaculty.set([]);
    this.publicPrograms.set([]);
    this.publicNews.set([]);
    this.publicEvents.set([]);
    this.primaryColor.set('#1e3a8a');
    this.secondaryColor.set('#3b82f6');
    this.accentColor.set('#f59e0b');
    this.fontFamily.set('Segoe UI');
    this.logoUrl.set('🏰');
    this.fetchTenantsList();
    
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.removeProperty('--tenant-primary');
      root.style.removeProperty('--tenant-secondary');
      root.style.removeProperty('--tenant-accent');
      root.style.removeProperty('--tenant-font');
    }
  }

  loadTenantProjectAndWebsite(subdomain: string) {
    this.loadBranding(subdomain);
    this.http.get<any>(`http://localhost:8080/api/sites/${subdomain}/config`)
      .subscribe({
        next: (config) => {
          this.loadTenantPages(config.tenantId);
          this.loadTenantCatalogs(config.tenantId);
          this.loadTenantNotifications(config.tenantId);
        },
        error: (err) => console.error('Failed to load tenant details', err)
      });
  }

  onLoginSuccess(user: any) {
    if (typeof sessionStorage !== 'undefined') {
      // Persist the JWT separately; keep the stored profile free of the token.
      if (user?.token) {
        sessionStorage.setItem('school_saas_token', user.token);
      }
      const { token, ...profile } = user || {};
      sessionStorage.setItem('school_saas_user', JSON.stringify(profile));
    }
    this.currentUser.set(user);
    if (user.role === 'TENANT_ADMIN') {
      this.activeTenant.set({ id: user.tenantId, name: user.tenantName, subdomain: user.subdomain });
      this.loadTenantProjectAndWebsite(user.subdomain);
    } else {
      this.fetchTenantsList();
    }
  }

  toggleCloneForm(tenantId: number) {
    this.activeCloneTenantId.set(tenantId);
    this.cloneName = '';
    this.cloneSubdomain = '';
    this.cloneError.set('');
  }

  cancelClone() {
    this.activeCloneTenantId.set(null);
    this.cloneName = '';
    this.cloneSubdomain = '';
    this.cloneError.set('');
  }

  submitClone(sourceTenantId: number) {
    this.isCloning.set(true);
    this.cloneError.set('');

    this.http.post<any>(`http://localhost:8080/api/admin/tenants/${sourceTenantId}/clone?name=${encodeURIComponent(this.cloneName)}&subdomain=${encodeURIComponent(this.cloneSubdomain)}`, {})
      .subscribe({
        next: (newTenant) => {
          this.isCloning.set(false);
          this.activeCloneTenantId.set(null);
          this.fetchTenantsList();
        },
        error: (err) => {
          this.isCloning.set(false);
          this.cloneError.set(err.error?.message || 'Failed to clone website. Subdomain must be unique.');
          console.error(err);
        }
      });
  }

  logout() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('school_saas_token');
      sessionStorage.removeItem('school_saas_user');
    }
    this.currentUser.set(null);
    this.activeTenant.set(null);
  }
}
