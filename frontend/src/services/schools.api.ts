import api from "./api";
import type { School } from "../types/school";

export async function fetchSchools(): Promise<School[]> {
  const { data } = await api.get<School[]>("/api/schools");
  return data;
}
