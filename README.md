# NGX Paginated

A collection of Angular libraries and utilities for building efficient, paginated data experiences with infinite scroll, search capabilities, and Material Design integration.

## 📦 Packages

This monorepo contains the following packages:

### [@ngx-paginated/data-source](./libs/paginated-data-source)

Core data source implementation with built-in pagination, search, and loading states. Works with Angular CDK's `DataSource` interface.

```bash
npm install @ngx-paginated/data-source
```

### [@ngx-paginated/ui-paginated-dropdown](./libs/ui/paginated-dropdown)

Material Design dropdown component with virtual scrolling, infinite scroll, and search capabilities. Built on top of Angular Material.

```bash
npm install @ngx-paginated/ui-paginated-dropdown
```

## ✨ Features

- 🚀 **Infinite Scroll** - Load data progressively as users scroll
- 🔍 **Search Integration** - Built-in debounced search functionality
- ⚡ **Virtual Scrolling** - Efficient rendering of large lists using Angular CDK
- 🎨 **Material Design** - Seamless integration with Angular Material
- 📱 **Responsive** - Works great on mobile and desktop
- ♿ **Accessible** - ARIA attributes and keyboard navigation support
- 🔧 **Reactive Forms** - Full integration with Angular's reactive forms
- 💪 **Type Safe** - Written in TypeScript with full type definitions

## 🎯 Quick Start

### 1. Install Dependencies

```bash
npm install @ngx-paginated/data-source @ngx-paginated/ui-paginated-dropdown
npm install @angular/material @angular/cdk @angular/forms
```

### 2. Basic Usage

```typescript
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PaginatedDataSource } from '@ngx-paginated/data-source';
import { PaginatedDropdownComponent } from '@ngx-paginated/ui-paginated-dropdown';

interface Item {
  id: string;
  label: string;
}

@Component({
  selector: 'app-example',
  template: `
    <mat-form-field>
      <ngx-paginated-dropdown
        [formControl]="control"
        [items]="selectableItems()"
        [loading]="dataSource.loading()"
        [hasMore]="dataSource.hasMore()"
        (loadMore)="dataSource.loadNextPage()"
        (searched)="dataSource.setQuery($event)"
        placeholder="Select an item">
      </ngx-paginated-dropdown>
    </mat-form-field>
  `
})
export class ExampleComponent {
  control = new FormControl();
  
  dataSource = new PaginatedDataSource<Item>({
    fetchFn: (params) => this.fetchItems(params),
    pageSize: 10,
    concatData: true,
    triggerInitialFetch: true
  });
  
  selectableItems = computed(() => 
    this.dataSource.items().map(item => ({
      ...item,
      isSelected: false,
      disabled: false
    }))
  );
  
  fetchItems(params) {
    // Your API call here
    return this.http.get('/api/items', { params });
  }
}
```

## 🛠️ Development

This project uses [Nx](https://nx.dev) for monorepo management and [pnpm](https://pnpm.io) for package management.

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Install dependencies
pnpm install

# Build all libraries
npx nx run-many -t build

# Run demo app
npx nx serve demo-app

# Run tests
npx nx run-many -t test
```

### Project Structure

```
├── apps/
│   ├── demo-app/           # Demo application
│   └── demo-app-e2e/       # E2E tests
├── libs/
│   ├── paginated-data-source/  # Core data source library
│   └── ui/
│       └── paginated-dropdown/ # Dropdown component library
└── dist/                   # Build output
```

## 📚 Documentation

- [Data Source Documentation](./libs/paginated-data-source/README.md)
- [Dropdown Component Documentation](./libs/ui/paginated-dropdown/README.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Report Issues](https://github.com/yourusername/paginated-data-source/issues)
- [Demo](https://yourusername.github.io/paginated-data-source)
