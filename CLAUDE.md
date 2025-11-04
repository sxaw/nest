# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server with hot reload
pnpm run start:dev

# Build for production
pnpm run build

# Start production build
pnpm run start:prod

# Linting and formatting
pnpm run lint
pnpm run format

# Testing
pnpm run test              # Run all unit tests
pnpm run test:watch        # Run tests in watch mode
pnpm run test:cov          # Run tests with coverage
pnpm run test:e2e          # Run end-to-end tests
pnpm run test:debug        # Debug tests
```

## Architecture Overview

This is a standard NestJS TypeScript application following the framework's modular architecture:

- **Entry Point**: `src/main.ts` - Bootstraps the NestJS application on port 3000 (or PORT env var)
- **Root Module**: `src/app.module.ts` - Core application module that imports other modules
- **Controllers**: Handle HTTP requests and responses (e.g., `src/app.controller.ts`)
- **Services**: Business logic and data operations (e.g., `src/app.service.ts`)
- **Testing**: Jest-based testing with `.spec.ts` files alongside source files

### Project Structure and Modularization

#### Feature-Based Module Organization

NestJS applications should be organized around business capabilities rather than technical layers. Each feature should have its own module containing:

```
src/
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── interfaces/
│   │   └── user.interface.ts
│   └── __tests__/
│       ├── users.controller.spec.ts
│       └── users.service.spec.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── strategies/
│       └── jwt.strategy.ts
└── common/
    ├── filters/
    ├── interceptors/
    ├── pipes/
    └── decorators/
```

#### Module Types and Responsibilities

**Feature Modules** (e.g., `users`, `auth`, `products`):

- Represent a specific business domain or feature
- Contain controllers, services, entities, and DTOs specific to that domain
- Export only the public API (services and entities that other modules might need)
- Import dependencies they need from other modules

**Shared Modules** (e.g., `common`, `database`, `config`):

- Provide reusable functionality across multiple feature modules
- Export providers, guards, interceptors, or utilities
- Should not have business logic specific to a single feature

**Core Module**:

- Contains application-wide providers (configuration, database connections, etc.)
- Usually imported only by the root module
- Marked with `@Global()` decorator if providers need to be available everywhere

#### Module Structure Guidelines

Each feature module should typically include:

- **Module file** (`*.module.ts`): Declares controllers, providers, imports, and exports
- **Controller** (`*.controller.ts`): Handles HTTP requests and responses
- **Service** (`*.service.ts`): Contains business logic and data operations
- **DTOs** (`dto/`): Data transfer objects for validation and type safety
- **Entities** (`entities/`): Database models and entity definitions
- **Interfaces** (`interfaces/`): TypeScript interfaces for the domain
- **Tests** (`__tests__/` or alongside files): Unit and integration tests

### Dependency Injection Best Practices

- **Constructor Injection**: Always inject dependencies through constructor parameters
- **Interface Segregation**: Use interfaces to define contracts between modules
- **Provider Registration**: Register providers at the module level, not globally unless necessary

### Testing Strategy

- **Unit Tests**: Focus on business logic in services
- **Integration Tests**: Test controller endpoints with their actual dependencies
- **E2E Tests**: Test complete application flows
- **Mock External Dependencies**: Use Jest mocks for database, external APIs, etc.

### Code Quality Guidelines

- **Single Responsibility**: Each class should have one clear purpose
- **Separation of Concerns**: Keep HTTP handling in controllers, business logic in services
- **Validation**: Use class-validator and DTOs for input validation
- **Error Handling**: Implement proper error handling with custom exceptions and filters

### Configuration Management

- **Environment Variables**: Use for all configuration values
- **ConfigModule**: Consider using for typed configuration access
- **Security**: Never commit sensitive information to version control

### Key Conventions

- Uses decorators (`@Controller`, `@Injectable`, `@Module`, `@Get`) for NestJS patterns
- Dependency injection through constructors
- Modular structure where each feature has its own controller/service/module
- Test files follow the `*.spec.ts` naming convention in the same directory as source files

### Configuration

- **TypeScript**: Strict mode disabled for `noImplicitAny`, `strictBindCallApply`, and `noFallthroughCasesInSwitch`
- **Build**: Outputs to `dist/` directory with source maps
- **Testing**: Jest configuration in `package.json` with coverage reports in `coverage/`
- **Linting**: ESLint with Prettier integration

## Common Development Workflows

### Standard Development Flow

1. **Start Development**: `pnpm run start:dev` - Starts the server with hot reload
2. **Write Tests First**: Create `.spec.ts` files alongside your implementation files
3. **Run Tests**: `pnpm run test` or `pnpm run test:watch` for continuous testing
4. **Lint & Format**: `pnpm run lint` and `pnpm run format` before committing
5. **Build**: `pnpm run build` to compile and verify the production build

### Test-Driven Development (TDD) Workflow

1. **Red**: Write a failing test case in the `.spec.ts` file
2. **Green**: Implement minimum code to make the test pass
3. **Refactor**: Improve code quality while keeping tests green
4. **Repeat**: Continue with the next test case

### Feature Development Workflow

1. Create service with business logic in `src/` directory
2. Create controller with HTTP endpoints
3. Create/update module to register controllers and providers
4. Write unit tests for service logic
5. Write integration tests for controller endpoints
6. Write e2e tests for complete flow

## NestJS Best Practices

### Architecture Patterns

- **Single Responsibility**: Each service and controller should have a single, focused responsibility
- **Dependency Injection**: Use constructor injection for dependencies rather than direct instantiation
- **Module Organization**: Group related features into feature modules
- **DTOs**: Use Data Transfer Objects for API input/output validation

### Testing Guidelines

- **Unit Tests**: Test services and business logic in isolation using `@nestjs/testing`
- **Integration Tests**: Test controller endpoints with their dependencies
- **E2E Tests**: Test complete application flows using `supertest`
- **Mocking**: Use Jest mocks for external dependencies
- **Test Coverage**: Aim for high coverage of business logic (services), not just controllers

### Code Organization

- Keep files small and focused (single class per file)
- Use descriptive names for controllers, services, and modules
- Group related files in feature-based directories
- Follow naming conventions: `*.controller.ts`, `*.service.ts`, `*.module.ts`

### Configuration

- Use environment variables for configuration (PORT, database URLs, etc.)
- Consider using ConfigModule for typed configuration
- Keep sensitive information out of version control
