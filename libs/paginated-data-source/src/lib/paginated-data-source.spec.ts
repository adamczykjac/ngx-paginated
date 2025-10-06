import { firstValueFrom, of } from 'rxjs';
import { PaginatedDataSource } from './paginated-data-source';
import { FetchFn, PaginationResult } from './model';

function makeFetch<T>(pages: Record<number, PaginationResult<T>>): FetchFn<T> {
  return (params) =>
    of(pages[params.page] ?? { items: [], hasMore: false, totalItems: 0 });
}

describe('PaginatedDataSource', () => {
  it('loads initial page on construction (default triggerInitialFetch)', async () => {
    const fetch = makeFetch<number>({
      1: { items: [1, 2, 3], hasMore: true, totalItems: 10 },
    });
    const ds = new PaginatedDataSource<number>({ fetchFn: fetch });

    const items = await firstValueFrom(ds.connect());
    expect(items).toEqual([1, 2, 3]);
    expect(ds.hasMore()).toBe(true);
    expect(ds.totalItems()).toBe(10);
  });

  it('concatenates items when concatData=true (default) on next page', async () => {
    const fetch = makeFetch<number>({
      1: { items: [1, 2], hasMore: true, totalItems: 4 },
      2: { items: [3, 4], hasMore: false, totalItems: 4 },
    });
    const ds = new PaginatedDataSource<number>({ fetchFn: fetch });

    await firstValueFrom(ds.connect());
    ds.loadNextPage();
    const items2 = await firstValueFrom(ds.connect());
    expect(items2).toEqual([1, 2, 3, 4]);
    expect(ds.hasMore()).toBe(false);
    expect(ds.totalItems()).toBe(4);
  });

  it('replaces items when concatData=false', async () => {
    const fetch = makeFetch<number>({
      1: { items: [1, 2], hasMore: true, totalItems: 4 },
      2: { items: [3, 4], hasMore: false, totalItems: 4 },
    });
    const ds = new PaginatedDataSource<number>({
      fetchFn: fetch,
      concatData: false,
    });

    const items1 = await firstValueFrom(ds.connect());
    expect(items1).toEqual([1, 2]);
    ds.loadNextPage();
    const items2 = await firstValueFrom(ds.connect());
    expect(items2).toEqual([3, 4]);
    expect(ds.hasMore()).toBe(false);
    expect(ds.totalItems()).toBe(4);
  });

  it('resets pagination and loads first page on setQuery', async () => {
    const fetch = makeFetch<number>({
      1: { items: [1, 2], hasMore: true, totalItems: 4 },
      2: { items: [3, 4], hasMore: false, totalItems: 4 },
    });
    const ds = new PaginatedDataSource<number>({ fetchFn: fetch });

    await firstValueFrom(ds.connect());
    ds.loadNextPage();
    await firstValueFrom(ds.connect());

    ds.setQuery('abc');
    const itemsAfterQuery = await firstValueFrom(ds.connect());
    expect(itemsAfterQuery).toEqual([1, 2]);
    expect(ds.hasMore()).toBe(true);
    expect(ds.totalItems()).toBe(4);
  });
});
