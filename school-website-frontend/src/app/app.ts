import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TenantOnboardingComponent } from './features/tenant-onboarding';
import { BrandingSettingsComponent } from './features/branding-settings';
import { PageBuilderComponent } from './features/page-builder';
import { AdmissionsFormComponent } from './features/admissions-form';
import { AdmissionsManagerComponent } from './features/admissions-manager';
import { AcademicsManagerComponent } from './features/academics-manager';
import { BillingManagerComponent } from './features/billing-manager';
import { PaymentPortalComponent } from './features/payment-portal';
import { ContactFormComponent } from './features/contact-form';
import { SupportManagerComponent } from './features/support-manager';
import { NewsManagerComponent } from './features/news-manager';
import { AchieversCarouselComponent } from './features/achievers-carousel';
import { GradebookManagerComponent } from './features/gradebook-manager';
import { ReportCardLookupComponent } from './features/report-card-lookup';
import { CampusGalleryComponent } from './features/campus-gallery';
import { SchoolBranchesComponent } from './features/school-branches';
import { CampusEnrichmentComponent } from './features/campus-enrichment';
import { CareersPortalComponent } from './features/careers-portal';
import { CareersManagerComponent } from './features/careers-manager';
import { PublicDisclosuresComponent } from './features/public-disclosures';
import { TCManagerComponent } from './features/tc-manager';
import { TCLookupComponent } from './features/tc-lookup';
import { LoginComponent } from './features/login';
import { UserProfileComponent } from './features/user-profile';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    CommonModule,
    FormsModule,
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
    LoginComponent,
    UserProfileComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly title = signal('School Website SaaS Platform');
  protected readonly backendStatus = signal<string>('Checking...');
  protected readonly backendMessage = signal<string>('');
  protected readonly currentUser = signal<any>(null);

  // Track the active tenant being customized / previewed
  protected readonly activeTenant = signal<any>(null);
  protected readonly schoolPages = signal<any[]>([]);
  protected readonly activePreviewPage = signal<any>(null);
  protected readonly isMobileMenuOpen = signal<boolean>(false);
  protected readonly showMoreDropdown = signal<boolean>(false);
  protected readonly maxVisibleTabs = signal<number>(5);

  @HostListener('window:resize', [])
  onResize() {
    this.updateMaxVisibleTabs();
  }

  private updateMaxVisibleTabs() {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 1400) {
        this.maxVisibleTabs.set(7);
      } else if (width >= 1200) {
        this.maxVisibleTabs.set(5);
      } else if (width >= 1024) {
        this.maxVisibleTabs.set(4);
      } else if (width >= 850) {
        this.maxVisibleTabs.set(2);
      } else {
        this.maxVisibleTabs.set(1);
      }
    }
  }

  // SaaS Hub tenants directory
  protected readonly tenantsList = signal<any[]>([]);

  // Home Page Image Slider State
  protected readonly activeHomeSlideIdx = signal<number>(0);
  protected readonly activeBanner = signal<any>(null);

  // Dynamic public catalog directories
  protected readonly publicCourses = signal<any[]>([]);
  protected readonly publicFaculty = signal<any[]>([]);
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
  protected readonly googleMapUrl = signal<string>('');
  protected readonly logoUrl = signal<string>('🏰');
  protected readonly contactEmail = signal<string>('info@schoolsaas.com');
  protected readonly contactPhone = signal<string>('+1 (555) 019-9000');

  ngOnInit() {
    this.checkBackendHealth();
    this.updateMaxVisibleTabs();
    
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
            this.fetchTenantsList();
          }
        } catch (e) {
          console.error('Failed to parse saved user session', e);
          sessionStorage.removeItem('school_saas_user');
          this.fetchTenantsList();
        }
      } else {
        this.fetchTenantsList();
      }
    } else {
      this.fetchTenantsList();
    }
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
    this.http.get<any[]>('http://localhost:8080/api/admin/tenants')
      .subscribe({
        next: (data) => this.tenantsList.set(data),
        error: (err) => console.error('Failed to fetch tenants list', err)
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
    this.http.get<any[]>(`http://localhost:8080/api/sites/${tenantId}/pages`)
      .subscribe({
        next: (data) => {
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
            'tc': 10
          };
          data.sort((a, b) => {
            const orderA = pageSortOrder[a.slug] || 99;
            const orderB = pageSortOrder[b.slug] || 99;
            return orderA - orderB;
          });

          this.schoolPages.set(data);
          
          // Select first page by default if none selected or if active preview no longer exists
          if (data.length > 0) {
            const currentActive = this.activePreviewPage();
            const found = currentActive ? data.find(p => p.id === currentActive.id) : null;
            if (found) {
              this.activePreviewPage.set(found);
            } else {
              this.activePreviewPage.set(data[0]);
            }
          } else {
            this.activePreviewPage.set(null);
          }
        },
        error: (err) => {
          console.error('Failed to load school pages', err);
        }
      });
  }

  loadTenantCatalogs(tenantId: number) {
    this.http.get<any[]>(`http://localhost:8080/api/sites/${tenantId}/courses`)
      .subscribe({
        next: (data) => this.publicCourses.set(data),
        error: (err) => console.error(err)
      });

    this.http.get<any[]>(`http://localhost:8080/api/sites/${tenantId}/programs`)
      .subscribe({
        next: (data) => this.publicPrograms.set(data),
        error: (err) => console.error(err)
      });

    this.http.get<any[]>(`http://localhost:8080/api/sites/${tenantId}/faculty`)
      .subscribe({
        next: (data) => this.publicFaculty.set(data),
        error: (err) => console.error(err)
      });
  }

  loadTenantNotifications(tenantId: number) {
    this.http.get<any[]>(`http://localhost:8080/api/sites/${tenantId}/news`)
      .subscribe({
        next: (data) => this.publicNews.set(data),
        error: (err) => console.error(err)
      });

    this.http.get<any[]>(`http://localhost:8080/api/sites/${tenantId}/events`)
      .subscribe({
        next: (data) => this.publicEvents.set(data),
        error: (err) => console.error(err)
      });
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
        this.googleMapUrl.set(banner.googleMapUrl || '');
      } catch (e) {
        this.activeBanner.set(null);
        this.facebookUrl.set('');
        this.instagramUrl.set('');
        this.twitterUrl.set('');
        this.youtubeUrl.set('');
        this.googleMapUrl.set('');
      }
    } else {
      this.activeBanner.set(null);
      this.facebookUrl.set('');
      this.instagramUrl.set('');
      this.twitterUrl.set('');
      this.youtubeUrl.set('');
      this.googleMapUrl.set('');
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

  parsedSectionConfig(configStr: string): any {
    try {
      return JSON.parse(configStr);
    } catch (e) {
      return {};
    }
  }

  getSafeUrl(url: string): SafeResourceUrl {
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
      sessionStorage.setItem('school_saas_user', JSON.stringify(user));
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
      sessionStorage.removeItem('school_saas_user');
    }
    this.currentUser.set(null);
    this.activeTenant.set(null);
  }
}
