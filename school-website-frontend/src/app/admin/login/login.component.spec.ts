import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoginComponent } from './login.component';
import { FirebasePhoneAuthService } from '../../shared/firebase/firebase-phone-auth.service';

class MockPhoneAuth {
  configured = false;
  get isConfigured() {
    return this.configured;
  }
  sendOtp = vi.fn().mockResolvedValue(undefined);
  confirmOtp = vi.fn().mockResolvedValue('fake-id-token');
  reset = vi.fn();
}

describe('LoginComponent — phone OTP', () => {
  let component: LoginComponent;
  let http: HttpTestingController;
  let phoneAuth: MockPhoneAuth;

  beforeEach(async () => {
    phoneAuth = new MockPhoneAuth();
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: FirebasePhoneAuthService, useValue: phoneAuth }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should default to the LOGIN view', () => {
    expect((component as any).currentView()).toEqual('LOGIN');
  });

  it('setView(PHONE) should switch view and set the phone header', () => {
    component.setView('PHONE');
    expect((component as any).currentView()).toEqual('PHONE');
    expect((component as any).headerTitle()).toEqual('Mobile sign in');
  });

  it('should send OTP and flip to the code-entry state', async () => {
    component.setView('PHONE');
    component.phoneNumber = '+919876543210';

    await component.onSendLoginOtp();

    expect(phoneAuth.sendOtp).toHaveBeenCalledWith('+919876543210', 'login-recaptcha');
    expect((component as any).otpSent()).toBe(true);
  });

  it('should confirm OTP, post the token, and emit loginSuccess', async () => {
    let emitted: any = null;
    component.loginSuccess.subscribe((v) => (emitted = v));

    component.setView('PHONE');
    component.phoneNumber = '+919876543210';
    await component.onSendLoginOtp();
    component.phoneOtp = '123456';

    await component.onVerifyLoginOtp();

    const req = http.expectOne('http://localhost:8080/api/auth/login/phone');
    expect(req.request.body).toEqual({ idToken: 'fake-id-token' });
    req.flush({ token: 'jwt', username: 'phoneadmin', role: 'TENANT_ADMIN' });

    expect(emitted).toBeTruthy();
    expect(emitted.username).toEqual('phoneadmin');
  });

  it('should surface a friendly error when no admin matches the number', async () => {
    component.setView('PHONE');
    component.phoneNumber = '+910000000000';
    await component.onSendLoginOtp();
    component.phoneOtp = '123456';

    await component.onVerifyLoginOtp();

    const req = http.expectOne('http://localhost:8080/api/auth/login/phone');
    req.flush({ message: 'No administrator account is registered with this mobile number.' },
      { status: 401, statusText: 'Unauthorized' });

    expect((component as any).errorMessage()).toContain('No admin');
  });

  it('resetPhoneLogin should clear OTP state', async () => {
    component.setView('PHONE');
    component.phoneNumber = '+919876543210';
    await component.onSendLoginOtp();

    component.resetPhoneLogin();

    expect((component as any).otpSent()).toBe(false);
    expect(component.phoneOtp).toEqual('');
    expect(phoneAuth.reset).toHaveBeenCalled();
  });
});
