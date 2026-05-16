import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, tap, scheduled, asyncScheduler, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import {
  CarteFideliteResponse,
  FidelityHistoryResponse,
  RewardResponse,
  CarteStatsResponse,
  TopClientResponse,
  LoyaltyDashboardResponse,
  LoyaltyAdminOverviewResponse,
  TransferRecipientResponse,
} from '../models/carte.model';

@Injectable({ providedIn: 'root' })
export class CarteService {
  private api = environment.apiUrl;
  private cachedCarte: CarteFideliteResponse | null = null;
  private cachedHistory: FidelityHistoryResponse[] | null = null;
  private cachedRewards: any[] | null = null;

  private client?: Client;
  private connectionId = 0;

  /** Emits whenever the backend pushes an updated loyalty card in real-time */
  loyaltyUpdate$ = new Subject<CarteFideliteResponse>();

  constructor(private http: HttpClient, private ngZone: NgZone) {}

  // ── WebSocket ────────────────────────────────────────────────────────────

  connectLoyalty(userId: number, token: string | null): void {
    const id = ++this.connectionId;
    if (this.client?.active) this.client.deactivate();

    this.client = new Client({
      webSocketFactory: () => new (SockJS as any)(`${this.api}/ws`),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,

      onConnect: () => {
        if (this.connectionId !== id) return;

        this.client!.subscribe(`/topic/loyalty/${userId}`, (frame: IMessage) => {
          if (this.connectionId !== id) return;
          try {
            const updated: CarteFideliteResponse = JSON.parse(frame.body);
            this.ngZone.run(() => {
              this.cachedCarte = updated;   // update cache so other pages see fresh data
              this.cachedHistory = null;    // invalidate history so it reloads
              this.loyaltyUpdate$.next(updated);
            });
          } catch {}
        });
      },

      onStompError:    (f) => { if (this.connectionId !== id) return; console.warn('[LoyaltyWS] error', f); },
      onWebSocketClose:(e) => { if (this.connectionId !== id) return; },
    });

    this.client.activate();
  }

  disconnectLoyalty(): void {
    this.connectionId++;
    if (this.client?.active) this.client.deactivate();
  }

  // ── HTTP — user ──────────────────────────────────────────────────────────

  getMaCarte() {
    if (this.cachedCarte) return scheduled(of(this.cachedCarte), asyncScheduler);
    return this.http.get<CarteFideliteResponse>(`${this.api}/carte/me`).pipe(
      tap((carte) => { this.cachedCarte = carte; }),
    );
  }

  getDashboard() {
    return this.http.get<LoyaltyDashboardResponse>(`${this.api}/carte/dashboard`);
  }

  getHistory() {
    if (this.cachedHistory) return scheduled(of(this.cachedHistory), asyncScheduler);
    return this.http.get<FidelityHistoryResponse[]>(`${this.api}/carte/history`).pipe(
      tap((history) => { this.cachedHistory = history || []; }),
    );
  }

  getRewards() {
    if (this.cachedRewards) return scheduled(of(this.cachedRewards), asyncScheduler);
    return this.http.get<any[]>(`${this.api}/carte/rewards`).pipe(
      tap((rewards) => { this.cachedRewards = rewards || []; }),
    );
  }

  redeemReward(reward: string) {
    return this.http.post<RewardResponse>(`${this.api}/carte/redeem?reward=${reward}`, {});
  }

  transferPoints(toUserId: number, points: number) {
    return this.http.post(
      `${this.api}/carte/transfer?toUserId=${toUserId}&points=${points}`,
      {},
      { responseType: 'text' },
    );
  }

  searchTransferRecipients(query: string) {
    const safeQuery = encodeURIComponent(query.trim());
    return this.http.get<TransferRecipientResponse[]>(
      `${this.api}/carte/transfer/recipients?query=${safeQuery}`,
    );
  }

  // ── HTTP — admin ─────────────────────────────────────────────────────────

  getAdminOverview() {
    return this.http.get<LoyaltyAdminOverviewResponse>(`${this.api}/carte/admin/overview`);
  }

  getStats() {
    return this.http.get<CarteStatsResponse>(`${this.api}/carte/admin/stats`);
  }

  getTop(limit?: number) {
    const q = limit ? `?limit=${limit}` : '';
    return this.http.get<TopClientResponse[]>(`${this.api}/carte/admin/top${q}`);
  }

  addPoints(userId: number, points: number) {
    return this.http.post(
      `${this.api}/carte/admin/add-points/${userId}?points=${points}`,
      {},
      { responseType: 'text' },
    );
  }

  clearCache() {
    this.cachedCarte = null;
    this.cachedHistory = null;
    this.cachedRewards = null;
  }
}
