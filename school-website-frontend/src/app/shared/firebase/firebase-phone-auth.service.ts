import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp, getApps } from 'firebase/app';
import {
  Auth,
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from './firebase.config';

/**
 * Thin wrapper around Firebase phone authentication.
 *
 * Flow:
 *   1. sendOtp(phoneE164, recaptchaContainerId) → sends SMS, returns void
 *   2. confirmOtp(code) → returns a Firebase ID token to hand to the backend
 *
 * The backend (/api/auth/login/phone and /api/auth/profile/phone) verifies that
 * ID token with the Firebase Admin SDK.
 */
@Injectable({ providedIn: 'root' })
export class FirebasePhoneAuthService {
  private app?: FirebaseApp;
  private auth?: Auth;
  private recaptcha?: RecaptchaVerifier;
  private confirmation?: ConfirmationResult;

  /** Whether real Firebase config is present. */
  get isConfigured(): boolean {
    return isFirebaseConfigured();
  }

  private ensureInit(): Auth {
    if (!this.isConfigured) {
      throw new Error('Firebase is not configured. Add your web config in firebase.config.ts.');
    }
    if (!this.app) {
      this.app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    }
    if (!this.auth) {
      this.auth = getAuth(this.app);
    }
    return this.auth;
  }

  /**
   * Sends an OTP SMS to the given E.164 phone number (e.g. +919876543210).
   * `recaptchaContainerId` must be the id of an (invisible) container element
   * present in the DOM.
   */
  async sendOtp(phoneE164: string, recaptchaContainerId: string): Promise<void> {
    const auth = this.ensureInit();
    if (!this.recaptcha) {
      this.recaptcha = new RecaptchaVerifier(auth, recaptchaContainerId, { size: 'invisible' });
    }
    this.confirmation = await signInWithPhoneNumber(auth, phoneE164, this.recaptcha);
  }

  /** Confirms the SMS code and returns the Firebase ID token. */
  async confirmOtp(code: string): Promise<string> {
    if (!this.confirmation) {
      throw new Error('No OTP request in progress. Send an OTP first.');
    }
    const credential = await this.confirmation.confirm(code);
    return credential.user.getIdToken();
  }

  /** Clears in-flight reCAPTCHA/confirmation state (e.g. on cancel). */
  reset(): void {
    try {
      this.recaptcha?.clear();
    } catch {
      /* no-op */
    }
    this.recaptcha = undefined;
    this.confirmation = undefined;
  }
}
