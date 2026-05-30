import api from "./api";
import type { AnalyticsSummary, RankingAnalytics } from "../types/analytics";

export async function fetchAnalyticsSummary(
  studentId: string
): Promise<AnalyticsSummary> {
  const { data } = await api.get<AnalyticsSummary>(
    `/api/analytics/summary/${studentId}`
  );
  return data;
}

export async function fetchAnalyticsRanking(
  studentId: string
): Promise<RankingAnalytics> {
  const { data } = await api.get<RankingAnalytics>(
    `/api/analytics/ranking/${studentId}`
  );
  return data;
}
