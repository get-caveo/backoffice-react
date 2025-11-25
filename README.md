# Backoffice React

A modern React application boilerplate with TypeScript, Bootstrap, shadcn/ui, and a factory pattern for API requests.

## Tech Stack

- **React 19** - Latest version of React
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Bootstrap + React-Bootstrap** - UI framework
- **Tailwind CSS + shadcn/ui** - Utility-first CSS with accessible components
- **ESLint + Prettier** - Code linting and formatting
- **Vitest** - Unit testing with React Testing Library
- **Axios** - HTTP client for API requests

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage
```

### Linting & Formatting

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Project Structure

```
src/
├── api/               # API client and services
│   ├── client.ts      # Axios-based API client
│   ├── base.service.ts # Base service with CRUD operations
│   └── user.service.ts # Example user service
├── components/
│   └── ui/            # shadcn/ui components
│       └── button.tsx # Button component with variants
├── lib/
│   └── utils.ts       # Utility functions (cn for class merging)
├── models/            # Data models with factory pattern
│   ├── base.model.ts  # Base model class
│   ├── factory.ts     # Model factory for creating instances
│   └── user.model.ts  # Example user model
└── test/
    └── setup.ts       # Test configuration
```

## API Model Factory Pattern

The project includes a factory pattern for creating model instances from API responses:

### Using the factory functions

```typescript
import { createModel, createModels } from '@/models'
import { User, type UserData } from '@/models/user.model'

// Create a single model
const user = createModel(User, userData)

// Create multiple models
const users = createModels(User, usersDataArray)
```

### Using the ModelFactory registry

```typescript
import { ModelFactory } from '@/models'
import { User } from '@/models/user.model'

// Register a model
ModelFactory.register('user', User)

// Create models from registry
const user = ModelFactory.create('user', userData)
const users = ModelFactory.createMany('user', usersDataArray)
```

### Using API Services

```typescript
import { userService } from '@/api'

// Get all users
const users = await userService.getAll()

// Get user by ID
const user = await userService.getById('1')

// Create a new user
const newUser = await userService.create({
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  isActive: true,
})
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Adding shadcn/ui Components

The project is configured with the shadcn/ui setup. To add more components, you can copy them from the [shadcn/ui documentation](https://ui.shadcn.com/docs/components) into `src/components/ui/`.

## License

MIT
