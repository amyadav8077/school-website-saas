import { Injectable, signal } from '@angular/core';
import { AdminUser } from '../models/models';

const SESSION_KEY = 'school_saas_user';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  readonly currentUser = signal<AdminUser | null>(null);

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    if (typeof sessionStorage === 'undefined') return;
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return;
    try {
      this.currentUser.set(JSON.parse(saved));
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  setUser(user: AdminUser): void {
    this.currentUser.set(user);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
  }

  logout(): void {
    this.currentUser.set(null);
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isTenantAdmin(): boolean {
    return this.currentUser()?.role === 'TENANT_ADMIN';
  }
}
