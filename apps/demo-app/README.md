# Demo App - Paginated Data Source

This demo application showcases the usage of `@ngx-paginated/data-source` library.

## Features Demonstrated

- ✅ **Infinite Scroll Pagination**: Load more data as you scroll
- ✅ **Search/Filter**: Real-time search across paginated data
- ✅ **Loading States**: Visual feedback during data fetching
- ✅ **Data Source State**: Display current page, total items, and more
- ✅ **Reload Functionality**: Refresh data on demand

## Running the Demo

```bash
# Serve the demo app
nx serve demo-app

# Build the demo app
nx build demo-app
```

The demo will be available at http://localhost:4200

## Code Example

```typescript
import { PaginatedDataSource } from '@ngx-paginated/data-source';

// Create a paginated data source
userDataSource = new PaginatedDataSource<User>({
  fetchFn: (params) => {
    // Simulate API call
    return this.http.get<PaginationResult<User>>(`/api/users`, {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        query: params.query || ''
      }
    });
  },
  pageSize: 10,
  concatData: true,
  triggerInitialFetch: true,
});

// Access reactive state
users = this.userDataSource.items;
loading = this.userDataSource.loading;
hasMore = this.userDataSource.hasMore;
totalItems = this.userDataSource.totalItems;

// Load next page
loadNext() {
  this.userDataSource.loadNextPage();
}

// Search/filter
search(query: string) {
  this.userDataSource.setQuery(query);
}

// Reload data
reload() {
  this.userDataSource.refreshData();
}
```

## Mock Data

The demo uses 100 mock users to simulate a real API. The data is filtered and paginated on the client side to demonstrate the library's capabilities.

