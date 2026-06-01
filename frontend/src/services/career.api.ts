import { apiGet, apiPost } from "../lib/api";
import type {
  CareerQuestion,
  CareerAnswer,
  CareerResultsResponse,
  SubmitCareerResponse,
} from "../types/career";

export async function fetchCareerQuestions(): Promise<CareerQuestion[]> {
  return apiGet("/api/career/questions") as Promise<CareerQuestion[]>;
}

export async function submitCareerAssessment(
  answers: CareerAnswer[]
): Promise<SubmitCareerResponse> {
  return apiPost("/api/career/submit", { answers }) as Promise<SubmitCareerResponse>;
}

export async function fetchCareerResults(): Promise<CareerResultsResponse> {
  return apiGet("/api/career/results") as Promise<CareerResultsResponse>;
}

export async function retakeCareerQuiz(): Promise<{ success: boolean }> {
  return apiGet("/api/career/retake") as Promise<{ success: boolean }>;
}
