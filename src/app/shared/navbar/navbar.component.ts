import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ImpersonationService } from '../../core/services/impersonation.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  managementDropdown = false;
  profileDropdown = false;
  userName = '';
  userAvatarUrl = '';
  userTier = 'SILVER';
  unreadNotificationCount = 0;

  private auth = inject(AuthService);
  private userService = inject(UserService);
  private impersonation = inject(ImpersonationService);
  private notificationService = inject(NotificationService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  private authSub?: Subscription;
  private notificationSub?: Subscription;
  private newNotifSub?: Subscription;
  private avatarSub?: Subscription;

  ngOnInit() {
    if (this.auth.isAuthenticated()) this.loadUser();

    this.authSub = this.auth.authState.subscribe((ok) => {
      if (ok) {
        this.loadUser();
        this.loadNotificationCount();
      } else {
        this.userName = '';
        this.userAvatarUrl = '';
        this.userTier = 'SILVER';
        this.unreadNotificationCount = 0;
        this.notificationService.disconnect();
      }
    });

    // Sync bell badge with the shared counter
    this.notificationSub = this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadNotificationCount = count;
      this.cdr.markForCheck();
    });

    // Show a toast popup whenever a real-time notification arrives
    this.newNotifSub = this.notificationService.notification$.subscribe((notif) => {
      this.toastService.show(`🔔 ${notif.message}`, 'info');
      this.cdr.markForCheck();
    });

    // Instantly reflect avatar changes made on the profile page
    this.avatarSub = this.userService.avatarChanged$.subscribe((url) => {
      this.userAvatarUrl = url;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.authSub?.unsubscribe();
    this.notificationSub?.unsubscribe();
    this.newNotifSub?.unsubscribe();
    this.avatarSub?.unsubscribe();
    this.notificationService.disconnect();
  }

  private loadNotificationCount() {
    const userId = this.auth.getCurrentUserId();
    const token  = this.auth.getToken();
    if (!userId) return;

    this.notificationService.getUnreadCount(userId).subscribe({
      next: (response: any) => {
        const count = response?.count || response?.unreadCount || 0;
        this.notificationService.setUnreadCount(count);
        this.cdr.markForCheck();
      },
      error: () => { this.cdr.markForCheck(); },
    });

    // Open real-time WebSocket connection
    this.notificationService.connect(userId, token);
  }

  private loadUser() {
    this.userService.getMe().subscribe({
      next: (u: any) => {
        this.userName = u.nom || u.fullName || u.name || '';
        this.userAvatarUrl = this.resolveUrl(u.avatarUrl);
        this.userTier = String(u.loyaltyLevel || u.level || 'SILVER').toUpperCase();
        this.cdr.markForCheck();
      },
      error: () => { this.cdr.markForCheck(); },
    });
  }

  private resolveUrl(raw: unknown): string {
    const v = typeof raw === 'string' ? raw.trim() : '';
    if (!v) return '';
    if (v.startsWith('http')) return v;
    return `${environment.apiUrl.replace(/\/$/, '')}${v.startsWith('/') ? v : '/' + v}`;
  }

  // ── Mode impersonation ─────────────────────────────────────────────────
  isImpersonatingMode(): boolean { return this.impersonation.isImpersonating(); }

  get clientBadgeLabel(): string {
    if (this.isImpersonatingMode()) return 'Mode Client';
    if (this.userTier === 'VIP') return 'VIP';
    if (this.userTier === 'GOLD') return 'Gold';
    return 'Silver';
  }

  get clientBadgeIcon(): string {
    if (this.isImpersonatingMode()) return '🎭';
    if (this.userTier === 'VIP') return '💎';
    if (this.userTier === 'GOLD') return '🥇';
    return '🥈';
  }

  get clientBadgeClass(): string {
    if (this.isImpersonatingMode()) return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (this.userTier === 'VIP') return 'bg-violet-50 text-violet-700 border border-violet-200';
    if (this.userTier === 'GOLD') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-gray-100 text-gray-500 border border-gray-200';
  }

  get adminBadgeLabel(): string {
    const roles = this.auth.getRoles();
    if (roles.includes('SUPER_ADMIN')) return 'Super Admin';
    if (roles.includes('ADMIN_CINEMA')) return 'Admin Cinéma';
    if (roles.includes('ADMIN_EVENT')) return 'Admin Events';
    if (roles.includes('ADMIN_CLUB')) return 'Admin Club';
    return 'Admin';
  }

  get adminBadgeIcon(): string {
    const roles = this.auth.getRoles();
    if (roles.includes('SUPER_ADMIN')) return '👑';
    if (roles.includes('ADMIN_CINEMA')) return '🎬';
    if (roles.includes('ADMIN_EVENT')) return '🎭';
    if (roles.includes('ADMIN_CLUB')) return '👥';
    return '🛡️';
  }

  get adminBadgeClass(): string {
    const roles = this.auth.getRoles();
    if (roles.includes('SUPER_ADMIN')) return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (roles.includes('ADMIN_CINEMA')) return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (roles.includes('ADMIN_EVENT')) return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (roles.includes('ADMIN_CLUB')) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    return 'bg-gray-100 text-gray-600 border border-gray-200';
  }

  isAdmin(): boolean         { return this.auth.isAdmin(); }
  isAuthenticated(): boolean { return this.auth.isAuthenticated(); }

  isBackOfficeAdmin(): boolean {
    return (
      !this.isImpersonatingMode() &&
      this.auth.getRoles().some((r) => ['SUPER_ADMIN', 'ADMIN_CINEMA', 'ADMIN_EVENT', 'ADMIN_CLUB'].includes(r))
    );
  }

  toggleMobileMenu()  { this.mobileMenuOpen = !this.mobileMenuOpen; }
  toggleManagement()  { this.managementDropdown = !this.managementDropdown; this.profileDropdown = false; }
  toggleProfile()     { this.profileDropdown = !this.profileDropdown; this.managementDropdown = false; }
  closeDropdowns()    { this.managementDropdown = false; this.profileDropdown = false; }
  logout()            { this.closeDropdowns(); this.auth.logout(); }
}
