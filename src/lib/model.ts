import { Observable } from 'rxjs';

export interface PaginationParams {
  page: number;
  pageSize: number;
  query?: string;
}

export interface PaginationResult<T> {
  items: T[];
  hasMore?: boolean;
  totalItems?: number;
}

export type FetchFn<T> = (
  params: PaginationParams,
) => Observable<PaginationResult<T>>;

export type PaginatedDataSourceConfig<T> = {
  fetchFn: FetchFn<T>;
  pageSize?: number;
  concatData?: boolean;
  triggerInitialFetch?: boolean;
};