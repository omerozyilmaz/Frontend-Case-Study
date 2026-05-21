import { apiRequest } from "./api-client";
import type {
  PaginatedResponse,
  PersonDetail,
  PersonListItem,
  PersonListParams,
  ProfessionGroup,
} from "@/types/api";
import type { PersonFormValues } from "@/schemas/person-schema";

function buildQuery(params: PersonListParams): string {
  const q = new URLSearchParams();
  q.set("page", String(params.page));
  q.set("size", String(params.size));
  if (params.sortField) {
    q.set("sort", `${params.sortField},${params.sortDirection}`);
  }
  if (params.nameContains.trim()) {
    q.set("name_contains", params.nameContains.trim());
  }
  if (params.tcknPrefix.trim()) {
    q.set("tckn_prefix", params.tcknPrefix.trim());
  }
  for (const id of params.professionGroupIds) {
    q.append("profession_group_ids", String(id));
  }
  return q.toString();
}

export function fetchPersons(params: PersonListParams) {
  return apiRequest<PaginatedResponse<PersonListItem>>(`/api/v1/persons?${buildQuery(params)}`);
}

export function fetchPerson(id: number) {
  return apiRequest<PersonDetail>(`/api/v1/persons/${id}`);
}

export function createPerson(body: PersonFormValues) {
  return apiRequest<PersonDetail>("/api/v1/persons", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updatePerson(id: number, body: PersonFormValues) {
  return apiRequest<PersonDetail>(`/api/v1/persons/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deletePerson(id: number) {
  return apiRequest<void>(`/api/v1/persons/${id}`, { method: "DELETE" });
}

export function fetchProfessionGroups() {
  return apiRequest<ProfessionGroup[]>("/api/v1/profession-groups");
}
