# @ngx-paginated/data-source

A powerful, reactive data source for Angular applications with built-in pagination, search, and loading state management. Compatible with Angular CDK's `DataSource` interface.

## Features

- 🔄 **Reactive** - Built with Angular signals for optimal change detection
- 📊 **Pagination** - Automatic page management with configurable page sizes
- 🔍 **Search** - Built-in search with query management
- ⏳ **Loading States** - Track loading, hasMore, and total items
- 🔗 **CDK Compatible** - Works with Angular CDK virtual scrolling
- 📦 **Data Modes** - Support for concat (infinite scroll) or replace (page-based) data loading
- 💪 **Type Safe** - Full TypeScript support with generic types

## Installation

```bash
npm install @ngx-paginated/data-source
```

### Peer Dependencies

```bash
npm install @angular/core@^18 @angular/cdk@^18 rxjs@^7.8.0
```

## Usage

### Basic Setup

```typescript
import { Component } from '@angular/core';
import { PaginatedDataSource, PaginationParams } from '@ngx-paginated/data-source';
import { Observable, of } from 'rxjs';

interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-users',
  template: `
    <div *ngFor="let user of users()">
      {{ user.name }}
    </div>
    
    <button 
      *ngIf="hasMore() && !loading()" 
      (click)="loadMore()">
      Load More
    </button>
    
    <div *ngIf="loading()">Loading...</div>
  `
})
export class UsersComponent {
  dataSource = new PaginatedDataSource<User>({
    fetchFn: (params) => this.fetchUsers(params),
    pageSize: 20,
    concatData: true,
    triggerInitialFetch: true
  });

  users = this.dataSource.items;
  loading = this.dataSource.loading;
  hasMore = this.dataSource.hasMore;

  fetchUsers(params: PaginationParams): Observable<PaginationResult<User>> {
    return this.http.get<PaginationResult<User>>('/api/users', {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        query: params.query || ''
      }
    });
  }

  loadMore() {
    this.dataSource.loadNextPage();
  }
}
```

### With Search

```typescript
export class SearchableUsersComponent {
  dataSource = new PaginatedDataSource<User>({
    fetchFn: (params) => this.fetchUsers(params),
    pageSize: 10
  });

  onSearch(query: string) {
    this.dataSource.setQuery(query);
  }
}
```

### With Virtual Scrolling

```typescript
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" style="height: 400px;">
      <div 
        *cdkVirtualFor="let item of dataSource.connect() | async"
        style="height: 50px;">
        {{ item.name }}
      </div>
    </cdk-virtual-scroll-viewport>
  `
})
export class VirtualScrollComponent {
  dataSource = new PaginatedDataSource<User>({
    fetchFn: (params) => this.fetchUsers(params),
    pageSize: 50
  });
}
```

## API Reference

### PaginatedDataSource

#### Constructor Options

```typescript
interface PaginatedDataSourceConfig<T> {
  fetchFn: FetchFn<T>;           // Function to fetch data
  pageSize?: number;              // Items per page (default: 10)
  concatData?: boolean;           // Concat vs replace mode (default: true)
  triggerInitialFetch?: boolean;  // Auto-fetch on init (default: true)
}
```

#### Properties (Signals)

- `items()` - Current array of items
- `loading()` - Whether a fetch is in progress
- `hasMore()` - Whether more pages are available
- `totalItems()` - Total count from server (if provided)

#### Methods

```typescript
// Load the next page
loadNextPage(): void

// Load a specific page
loadPage(page: number): void

// Set search query and reload
setQuery(query: string): void

// Refresh data from scratch
refreshData(): void

// Reload current page
reloadPage(): void

// CDK DataSource interface
connect(): Observable<T[]>
disconnect(): void
```

### Types

#### PaginationParams

```typescript
interface PaginationParams {
  page: number;
  pageSize: number;
  query?: string;
  sorting?: {
    column: string;
    sortingType: 'ascending' | 'descending';
  };
  filtering?: Record<string, any>;
}
```

#### PaginationResult

```typescript
interface PaginationResult<T> {
  items: T[];
  hasMore?: boolean;
  totalItems?: number;
}
```

#### FetchFn

```typescript
type FetchFn<T> = (
  params: PaginationParams
) => Observable<PaginationResult<T>>;
```

## Examples

### With HTTP Client

```typescript
fetchUsers(params: PaginationParams): Observable<PaginationResult<User>> {
  return this.http.get<{data: User[], total: number}>('/api/users', {
    params: {
      page: params.page,
      limit: params.pageSize,
      search: params.query || ''
    }
  }).pipe(
    map(response => ({
      items: response.data,
      totalItems: response.total,
      hasMore: params.page * params.pageSize < response.total
    }))
  );
}
```

### With Local Data (Mock)

```typescript
private mockData: User[] = [...]; // Your mock data

fetchUsers(params: PaginationParams): Observable<PaginationResult<User>> {
  const filtered = params.query
    ? this.mockData.filter(u => u.name.includes(params.query!))
    : this.mockData;
  
  const start = (params.page - 1) * params.pageSize;
  const end = start + params.pageSize;
  const items = filtered.slice(start, end);
  
  return of({
    items,
    hasMore: end < filtered.length,
    totalItems: filtered.length
  }).pipe(delay(300)); // Simulate network delay
}
```

### With Error Handling

```typescript
fetchUsers(params: PaginationParams): Observable<PaginationResult<User>> {
  return this.http.get<PaginationResult<User>>('/api/users', { params }).pipe(
    catchError(error => {
      console.error('Failed to fetch users:', error);
      return of({
        items: [],
        hasMore: false,
        totalItems: 0
      });
    })
  );
}
```

## Best Practices

1. **Always handle errors** - Return an empty result rather than letting errors propagate
2. **Use concatData: true** for infinite scroll scenarios
3. **Use concatData: false** for traditional pagination with page numbers
4. **Provide totalItems** when available for better UX
5. **Debounce search** in your component if needed (data source doesn't do this automatically)

## License

MIT

