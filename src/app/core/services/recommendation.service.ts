import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MovieRecommendation,
  RecommendationApiResponse,
  RecommendationPayload,
} from '../models/recommendation.model';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly apiUrl = environment.recommendationApiUrl;
  private readonly directUrl = environment.recommendationDirectUrl;

  constructor(private readonly http: HttpClient) {}

  getRecommendations(userId: number): Observable<MovieRecommendation[]> {
    return this.http.get<MovieRecommendation[]>(`${this.apiUrl}/reco/${userId}`);
  }

  getBestFeedbackRecommendation(userId: number): Observable<MovieRecommendation[]> {
    return this.http.get<MovieRecommendation[]>(`${this.apiUrl}/reco-feedback/${userId}`);
  }

  getHealth(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  recommend(payload: RecommendationPayload): Observable<RecommendationApiResponse> {
    return this.http.post<RecommendationApiResponse>(`${this.directUrl}/recommend`, payload);
  }
}
