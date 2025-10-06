import { DataSource } from '@angular/cdk/collections';
import { computed, signal } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, finalize, take, tap } from 'rxjs/operators';
import { FetchFn, PaginatedDataSourceConfig, PaginationResult } from './model';

/**
 * A generic data source with built-in pagination.
 *
 * Supports incremental loading (infinite scroll) or full page replacement,
 * tracks loading state, total items, and whether more pages are available.
 */
export class PaginatedDataSource<T> extends DataSource<T> {
  protected _items = signal<T[]>([]);
  protected _loading = signal<boolean>(false);
  protected _hasMore = signal<boolean>(true);
  protected _currentPage = signal<number>(0);
  protected _fetchFn: FetchFn<T> = () =>
    of({ items: [], hasMore: false, totalItems: 0 });
  protected _query = signal<string>('');
  protected _pageSize = signal<number>(10);
  protected _totalItems = signal<number>(0);
  protected _concatData = signal<boolean>(true);
  private readonly itemsSubject = new BehaviorSubject<T[]>([]);

  /** Whether a page fetch is currently in progress. */
  public readonly loading = computed(() => this._loading());
  /** Indicates if there are more pages to load. */
  public readonly hasMore = computed(() => this._hasMore());
  /** Total number of items reported by the backend (0 if unknown). */
  public readonly totalItems = computed(() => this._totalItems());

  /**
   * Creates a new paginated data source.
   * @param config Configuration including the `fetchFn` and options.
   */
  constructor(config: PaginatedDataSourceConfig<T>) {
    super();
    const {
      fetchFn,
      pageSize,
      concatData = true,
      triggerInitialFetch = true,
    } = config;
    if (fetchFn) this._fetchFn = fetchFn;
    if (pageSize !== undefined) this._pageSize.set(pageSize);
    if (concatData !== undefined) this._concatData.set(concatData);
    if (!triggerInitialFetch) return;
    this.loadNextPage();
  }

  /**
   * Connect method required by `DataSource`. Emits the current list of items
   * and replays the latest value to late subscribers.
   */
  override connect(): Observable<T[]> {
    return this.itemsSubject.asObservable();
  }

  /**
   * Disconnect method required by `DataSource`.
   * No-op because subscriptions are one-off and auto-complete.
   */
  override disconnect(): void {
    // no-op
  }

  /**
   * Loads the next page, respecting `loading` and `hasMore` guards.
   */
  loadNextPage(): void {
    if (this._loading()) return;
    if (!this._hasMore()) return;

    const nextPage = this._currentPage() + 1;
    this.fetchPage(nextPage).subscribe();
  }

  /**
   * Loads a specific page number. Skips if a fetch is already in progress.
   * @param page 1-based page index to load
   */
  loadPage(page: number): void {
    if (this._loading()) return;
    this.fetchPage(page).subscribe();
  }

  /**
   * Sets a new text query, resets pagination, and loads the first page.
   * @param query Free-text search query
   */
  setQuery(query: string): void {
    this._query.set(query);
    this.resetPaginationState();
    this.fetchPage(1).subscribe();
  }

  /**
   * Clears the current query, resets pagination, and reloads the first page.
   */
  refreshData() {
    this._query.set('');
    this.resetPaginationState();
    this.fetchPage(1).subscribe();
  }

  /**
   * Reloads the current page.
   */
  reloadPage() {
    this.fetchPage(this._currentPage()).subscribe();
  }

  /**
   * Performs the actual fetch for a given page and updates internal state.
   * @param page 1-based page index to fetch
   */
  private fetchPage(page: number): Observable<PaginationResult<T>> {
    this._currentPage.set(page);
    this._loading.set(true);

    if (!this._concatData()) {
      this._items.set([]);
      this.itemsSubject.next([]);
    }
    const params = {
      page: this._currentPage(),
      pageSize: this._pageSize(),
      query: this._query(),
    };
    return this._fetchFn(params).pipe(
      catchError(() => of({ items: [], hasMore: false, totalItems: 0 })),
      tap((result) => {
        const nextHasMore = result.hasMore ?? false;
        const nextTotal = result.totalItems ?? 0;

        let newItems: T[];
        if (this._concatData()) {
          newItems = [...this._items(), ...result.items];
        } else {
          newItems = result.items;
        }
        this._items.set(newItems);
        this.itemsSubject.next(newItems);

        this._hasMore.set(nextHasMore);
        this._totalItems.set(nextTotal);
      }),
      take(1),
      finalize(() => this._loading.set(false))
    );
  }

  private resetPaginationState(): void {
    this._items.set([]);
    this.itemsSubject.next([]);
    this._currentPage.set(0);
    this._hasMore.set(true);
    this._totalItems.set(0);
  }
}
