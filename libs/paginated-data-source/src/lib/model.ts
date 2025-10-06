import { Observable } from 'rxjs';

export interface Filters {
  filtering?: Record<string, any>;
}

export interface PaginationParams extends Filters {
  page: number;
  pageSize: number;
  query?: string;
  sorting?: { column: string; sortingType: 'ascending' | 'descending' };
}

export interface PaginationResult<T> {
  items: T[];
  hasMore?: boolean;
  totalItems?: number;
}

export type FetchFn<T> = (
  params: PaginationParams
) => Observable<PaginationResult<T>>;

export type PaginatedDataSourceConfig<T> = {
  fetchFn: FetchFn<T>;
  pageSize?: number;
  concatData?: boolean;
  triggerInitialFetch?: boolean;
};
