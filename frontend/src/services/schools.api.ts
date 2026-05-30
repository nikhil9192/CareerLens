import { apiGet } from "../lib/api";
import type { School } from "../types/school";

export async function fetchSchools(): Promise<School[]> {
  return apiGet("/api/schools") as Promise<School[]>;
}
