export interface School {
  id: string;
  name: string;
  city: string;
  state: string;
}

export function formatSchoolLabel(school: School): string {
  return `${school.name} — ${school.city}, ${school.state}`;
}
