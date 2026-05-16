import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: number;
  message: string;
  dateEnvoi: string;
  type: string;
  lue: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {

  private api = environment.apiUrl;
  private client?: Client;
  private connectionId = 0;

  unreadCount$  = new BehaviorSubject<number>(0);
  notification$ = new Subject<Notification>();
  connected$    = new BehaviorSubject<boolean>(false);

  private seenIds = new Set<number>();

  constructor(private http: HttpClient, private ngZone: NgZone) {}

  // ── WebSocket ────────────────────────────────────────────────────────────

  connect(userId: number, token: string | null): void {
    const id = ++this.connectionId;
    if (this.client?.active) this.client.deactivate();

    this.client = new Client({
      webSocketFactory: () => new (SockJS as any)(`${this.api}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,

      onConnect: () => {
        if (this.connectionId !== id) return;

        // User-specific notifications only — avoids duplicates with broadcast topic
        this.client!.subscribe(`/topic/notifications/${userId}`, (frame: IMessage) => {
          if (this.connectionId !== id) return;
          try {
            const notif: Notification = JSON.parse(frame.body);
            this.ngZone.run(() => this.emitNotif(notif));
          } catch {}
        });

        this.ngZone.run(() => this.connected$.next(true));
      },

      onDisconnect:    () => { if (this.connectionId !== id) return; this.ngZone.run(() => this.connected$.next(false)); },
      onStompError:    (f) => { if (this.connectionId !== id) return; console.warn('[NotifWS] STOMP error', f); this.ngZone.run(() => this.connected$.next(false)); },
      onWebSocketClose:(e) => { if (this.connectionId !== id) return; this.ngZone.run(() => this.connected$.next(false)); },
      onWebSocketError:(e) => { if (this.connectionId !== id) return; console.warn('[NotifWS] WS error', e); this.ngZone.run(() => this.connected$.next(false)); },
    });

    this.client.activate();
  }

  private emitNotif(notif: Notification): void {
    if (notif?.id && this.seenIds.has(notif.id)) return;
    if (notif?.id) {
      this.seenIds.add(notif.id);
      setTimeout(() => this.seenIds.delete(notif.id), 10_000);
    }
    this.notification$.next(notif);
    this.unreadCount$.next(this.unreadCount$.getValue() + 1);
  }

  disconnect(): void {
    this.connectionId++;
    if (this.client?.active) this.client.deactivate();
    this.ngZone.run(() => this.connected$.next(false));
  }

  ngOnDestroy(): void { this.disconnect(); }

  // ── HTTP ─────────────────────────────────────────────────────────────────

  getNotificationsByUserId(userId: number) {
    return this.http.get<Notification[]>(`${this.api}/api/notifications/user/${userId}`);
  }

  getUnreadCount(userId: number) {
    return this.http.get<any>(`${this.api}/api/notifications/unread/user/${userId}`);
  }

  markAsRead(notificationId: number) {
    return this.http.put<any>(`${this.api}/api/notifications/read/${notificationId}`, {});
  }

  markAllAsRead(userId: number) {
    return this.http.put<any>(`${this.api}/api/notifications/read/user/${userId}`, {});
  }

  deleteNotification(notificationId: number) {
    return this.http.delete(`${this.api}/api/notifications/${notificationId}`);
  }

  getAllNotifications() {
    return this.http.get<Notification[]>(`${this.api}/api/notifications/all`);
  }

  deleteAllNotifications() {
    return this.http.delete<{ success: boolean }>(`${this.api}/api/notifications/delete/all`);
  }

  // ── Count helpers ────────────────────────────────────────────────────────

  setUnreadCount(count: number)  { this.unreadCount$.next(count); }

  decrementUnreadCount() {
    const c = this.unreadCount$.getValue();
    if (c > 0) this.unreadCount$.next(c - 1);
  }

  resetUnreadCount()              { this.unreadCount$.next(0); }
  getCurrentUnreadCount(): number { return this.unreadCount$.getValue(); }
}
