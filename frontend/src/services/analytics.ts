import { apiGet } from "../lib/api";
import type { AnalyticsSummary, RankingAnalytics } from "../types/analytics";

export async function fetchAnalyticsSummary(
  studentId: string
): Promise<AnalyticsSummary> {
  return apiGet(
    `/api/analytics/summary/${studentId}`
  ) as Promise<AnalyticsSummary>;
}

export async function fetchAnalyticsRanking(
  studentId: string
): Promise<RankingAnalytics> {
  return apiGet(
    `/api/analytics/ranking/${studentId}`
  ) as Promise<RankingAnalytics>;
}
