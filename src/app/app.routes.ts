import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // ── Auth (public) ────────────────────────────────────────────────
  {
    path: 'auth/sign-in',
    loadComponent: () =>
      import('./pages/auth/sign-in/sign-in.component').then((m) => m.SignInComponent),
  },
  {
    path: 'auth/sign-up',
    loadComponent: () =>
      import('./pages/auth/sign-up/sign-up.component').then((m) => m.SignUpComponent),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./pages/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },

  // ── Pages publiques ──────────────────────────────────────────────
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./pages/events/events.component').then((m) => m.EventsComponent),
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./pages/events/event-detail/event-detail.component').then((m) => m.EventDetailComponent),
  },
  {
    path: 'films',
    loadComponent: () =>
      import('./pages/films/films.component').then((m) => m.FilmsComponent),
  },
  {
    path: 'cinemas',
    loadComponent: () =>
      import('./pages/cinemas/cinemas.component').then((m) => m.CinemasComponent),
  },
  {
    path: 'materials',
    loadComponent: () =>
      import('./pages/materials/materials.component').then((m) => m.MaterialsComponent),
  },
  {
    path: 'materials/:id',
    loadComponent: () =>
      import('./pages/materials/material-detail/material-detail.component').then((m) => m.MaterialDetailComponent),
  },
  {
    path: 'clubs',
    loadComponent: () =>
      import('./pages/clubs/clubs.component').then((m) => m.ClubsComponent),
  },
  {
    path: 'subscriptions',
    loadComponent: () =>
      import('./pages/subscriptions/subscriptions.component').then((m) => m.SubscriptionsComponent),
  },
  {
    path: 'logistics',
    loadComponent: () =>
      import('./pages/logistics/logistics.component').then((m) => m.LogisticsComponent),
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./pages/notifications/notifications.component').then((m) => m.NotificationsComponent),
  },

  // ── Pages protégées (auth requis) ────────────────────────────────
  {
    path: 'tickets',
    loadComponent: () =>
      import('./pages/tickets/tickets.component').then((m) => m.TicketsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'ticket/verify/:id',
    loadComponent: () =>
      import('./pages/ticket-verify/ticket-verify.component').then((m) => m.TicketVerifyComponent),
  },
  {
    path: 'loyalty',
    loadComponent: () =>
      import('./pages/loyalty/loyalty.component').then((m) => m.LoyaltyComponent),
    canActivate: [authGuard],
  },
  {
    path: 'feedback',
    loadComponent: () =>
      import('./pages/feedback/feedback.component').then((m) => m.FeedbackComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'materials-reservations',
    loadComponent: () =>
      import('./pages/materials/materials-reservations/materials-reservations.component').then(
        (m) => m.MaterialsReservationsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'reservations/mark-used/:id',
    loadComponent: () =>
      import('./pages/mark-reservation-used/mark-reservation-used').then(
        (m) => m.MarkReservationUsedComponent,
      ),
  },

  // ── Features (lazy) ──────────────────────────────────────────────
  {
    path: 'club',
    loadChildren: () => import('./features/club/club.routes').then((m) => m.CLUB_ROUTES),
  },
  {
    path: 'chat',
    loadChildren: () => import('./features/chat/chat.routes').then((m) => m.CHAT_ROUTES),
  },

  // ════════════════════════════════════════════════════════════════
  // ESPACE ADMIN
  // ════════════════════════════════════════════════════════════════
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/pages/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./admin/pages/events/admin-events.component').then((m) => m.AdminEventsComponent),
        canActivate: [permissionGuard(['CINEMA_CREATE', 'EVENT_CREATE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'films',
        loadComponent: () =>
          import('./admin/pages/films/admin-films.component').then((m) => m.AdminFilmsComponent),
        canActivate: [permissionGuard(['CINEMA_CREATE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'cinemas',
        loadComponent: () =>
          import('./admin/pages/cinemas/admin-cinemas.component').then((m) => m.AdminCinemasComponent),
        canActivate: [permissionGuard(['CINEMA_CREATE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'seances',
        loadComponent: () =>
          import('./admin/pages/seances/admin-seances.component').then((m) => m.AdminSeancesComponent),
      },
      {
        path: 'tickets',
        loadComponent: () =>
          import('./admin/pages/tickets/admin-tickets.component').then((m) => m.AdminTicketsComponent),
        canActivate: [permissionGuard(['CINEMA_CREATE', 'EVENT_CREATE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'club',
        loadComponent: () =>
          import('./admin/pages/club/admin-club.component').then((m) => m.AdminClubComponent),
        canActivate: [permissionGuard(['CLUB_MANAGE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'club/events/:id',
        loadComponent: () =>
          import('./admin/pages/club-event-detail/admin-club-event-detail.component').then(
            (m) => m.AdminClubEventDetailComponent,
          ),
        canActivate: [permissionGuard(['CLUB_MANAGE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'eventspaces',
        loadComponent: () =>
          import('./admin/pages/event-spaces/admin-event-spaces.component').then(
            (m) => m.AdminEventSpacesComponent,
          ),
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./admin/pages/chat/admin-chat.component').then((m) => m.AdminChatComponent),
        canActivate: [permissionGuard(['CINEMA_CREATE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'chat/:id',
        loadComponent: () =>
          import('./admin/pages/chat/admin-chat-detail.component').then(
            (m) => m.AdminChatDetailComponent,
          ),
        canActivate: [permissionGuard(['CINEMA_CREATE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'subscriptions',
        loadComponent: () =>
          import('./admin/pages/subscriptions/admin-subscriptions.component').then(
            (m) => m.AdminSubscriptionsComponent,
          ),
        canActivate: [permissionGuard(['ADMIN_MANAGE'])],
      },
      {
        path: 'materiels',
        loadComponent: () =>
          import('./admin/pages/materiels/admin-materiels-unified.component').then(
            (m) => m.AdminMaterielsUnifiedComponent,
          ),
        canActivate: [permissionGuard(['EVENT_CREATE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./admin/pages/reservations/admin-reservations.component').then(
            (m) => m.AdminReservationsComponent,
          ),
        canActivate: [permissionGuard(['EVENT_CREATE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/pages/users/admin-users.component').then((m) => m.AdminUsersComponent),
        canActivate: [permissionGuard(['ADMIN_MANAGE'])],
      },
      {
        path: 'loyalty',
        loadComponent: () =>
          import('./admin/pages/loyalty/admin-loyalty.component').then((m) => m.AdminLoyaltyComponent),
        canActivate: [permissionGuard(['FIDELITY_UPDATE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./admin/pages/roles/admin-roles.component').then((m) => m.AdminRolesComponent),
        canActivate: [permissionGuard(['ADMIN_MANAGE'])],
      },
      {
        path: 'logistics',
        loadComponent: () =>
          import('./admin/pages/logistics/admin-logistics.component').then(
            (m) => m.AdminLogisticsComponent,
          ),
        canActivate: [permissionGuard(['CINEMA_CREATE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'feedback',
        loadComponent: () =>
          import('./admin/pages/feedback/admin-feedback.component').then(
            (m) => m.AdminFeedbackComponent,
          ),
        canActivate: [permissionGuard(['CINEMA_CREATE', 'EVENT_CREATE', 'ADMIN_MANAGE'])],
      },
      {
        path: 'ml',
        loadComponent: () =>
          import('./admin/pages/ml/admin-ml.component').then((m) => m.AdminMlComponent),
        canActivate: [permissionGuard(['ADMIN_MANAGE'])],
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./admin/pages/notifications/admin-notifications.component').then(
            (m) => m.AdminNotificationsComponent,
          ),
      },
      {
        path: 'unauthorized',
        loadComponent: () =>
          import('./admin/pages/unauthorized/admin-unauthorized.component').then(
            (m) => m.AdminUnauthorizedComponent,
          ),
      },
    ],
  },

  // ── Wildcard ─────────────────────────────────────────────────────
  { path: '**', redirectTo: 'home' },
];
