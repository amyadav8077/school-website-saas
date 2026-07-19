import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { App } from './app';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('App', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();

    // Trigger ngOnInit() lifecycle hooks
    fixture.detectChanges();

    // Satisfy health check & tenants list network calls on init
    const reqHealth = httpTestingController.expectOne('http://localhost:8080/api/health');
    reqHealth.flush({ status: 'UP', message: 'OK' });

    const reqTenants = httpTestingController.expectOne('http://localhost:8080/api/admin/tenants');
    reqTenants.flush([]);
  });

  it('should assert the initial titles and signals', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    // Trigger ngOnInit() lifecycle hooks
    fixture.detectChanges();

    // Satisfy initial network requests
    const reqHealth = httpTestingController.expectOne('http://localhost:8080/api/health');
    reqHealth.flush({ status: 'UP', message: 'OK' });

    const reqTenants = httpTestingController.expectOne('http://localhost:8080/api/admin/tenants');
    reqTenants.flush([]);

    expect((app as any).title()).toEqual('School Website SaaS Platform');
    expect((app as any).backendStatus()).toEqual('UP');
  });

  it('should correctly parse dynamic home page visual block config payloads', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    // 1. Assert getFoundersList parses correctly
    const foundersJson = JSON.stringify({
      title: 'Our Leaders',
      founders: [
        { name: 'Dr. Arthur', role: 'Director', bio: 'Bio...', photoUrl: 'img1.png' }
      ]
    });
    const founders = app.getFoundersList(foundersJson);
    expect(founders.length).toEqual(1);
    expect(founders[0].name).toEqual('Dr. Arthur');

    // 2. Assert getFacilitiesList parses correctly
    const facilitiesJson = JSON.stringify({
      title: 'Infrastructure',
      facilities: [
        { title: 'Labs', description: 'Interactive science labs...', photoUrl: 'img2.png' }
      ]
    });
    const facilities = app.getFacilitiesList(facilitiesJson);
    expect(facilities.length).toEqual(1);
    expect(facilities[0].title).toEqual('Labs');

    // 3. Assert getPhotoGridList parses correctly
    const photoGridJson = JSON.stringify({
      title: 'Gallery Grid',
      photos: [
        { url: 'img3.png', caption: 'Fair', category: 'ACADEMICS' }
      ]
    });
    const photos = app.getPhotoGridList(photoGridJson);
    expect(photos.length).toEqual(1);
    expect(photos[0].category).toEqual('ACADEMICS');

    // 4. Assert activeGalleryFilter initial state
    expect((app as any).activeGalleryFilter()).toEqual('ALL');
  });
});
