export type UserRole = "admin" | "user";

export interface SessionResponse {
  role: UserRole;
}

export interface ProfessionGroup {
  id: number;
  name: string;
  created_at?: string;
}

export interface PersonListItem {
  id: number;
  first_name: string;
  last_name: string;
  tckn_masked: string;
  email: string;
  profession_group_id: number;
  profession_group: ProfessionGroup | null;
  created_at: string;
}

export interface PersonDetail extends Omit<PersonListItem, "tckn_masked"> {
  tckn: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

export interface ApiErrorBody {
  detail: string | { msg: string; type: string }[];
}

export type SortField = "first_name" | "last_name" | "created_at" | "email";
export type SortDirection = "asc" | "desc";

export interface PersonListParams {
  page: number;
  size: number;
  sortField: SortField | null;
  sortDirection: SortDirection;
  professionGroupIds: number[];
  nameContains: string;
  tcknPrefix: string;
}
