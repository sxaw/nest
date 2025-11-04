# TypeORM Migration Guide

This guide covers how to use TypeORM migrations in your NestJS application.

## 🚀 Quick Start

### 1. Environment Setup

Make sure your `.env` file is configured:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=nest_webhook
NODE_ENV=development
```

### 2. Available Migration Scripts

Your `package.json` now includes these migration commands:

```bash
# Create a named migration file with custom format
npm run migration:create-named --name initial-setup

# Generate a new migration based on entity changes
npm run migration:generate -- src/migrations/YourMigrationName

# Create a blank migration file
npm run migration:create -- src/migrations/CustomMigrationName

# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Generate specific API keys table migration
npm run migration:generate:api-keys

# Generate initial schema migration
npm run migration:generate:initial
```

## 📋 Migration Workflow

### Development Workflow

1. **Make Entity Changes**
   ```typescript
   // Modify your entity files in src/auth/entities/
   // or src/**/entities/
   ```

2. **Generate Migration**
   ```bash
   # Create a named migration with custom timestamp format
   npm run migration:create-named --name initial-setup
   # Creates: src/migrations/1730741234567-initial-setup-migration.ts

   # Generate migration for all entity changes
   npm run migration:generate -- src/migrations/YourMigrationName

   # Or use the specific script
   npm run migration:generate:api-keys
   ```

3. **Review Generated Migration**
   - Check the `src/migrations/` directory
   - Review the generated SQL in `up()` and `down()` methods

4. **Run Migration**
   ```bash
   npm run migration:run
   ```

### Production Workflow

1. **Never use synchronization in production**
2. **Always use migrations**
3. **Test migrations in staging first**
4. **Backup database before major migrations**

## 🛠️ Migration Commands Explained

### Generate Migration
```bash
npm run migration:generate -- src/migrations/MigrationName
```
- Analyzes entity changes
- Creates migration file with SQL statements
- Uses pattern matching to find all entities

### Create Blank Migration
```bash
npm run migration:create -- src/migrations/CustomMigrationName
```
- Creates empty migration file
- For custom SQL operations

### Run Migrations
```bash
npm run migration:run
```
- Executes all pending migrations
- Creates `migrations` table to track status

### Revert Migration
```bash
npm run migration:revert
```
- Reverts the last executed migration
- Useful for rollback scenarios

### Show Migration Status
```bash
npm run migration:show
```
- Shows all migrations and their status
- `[X]` = executed, `[ ]` = pending

## 📁 File Structure

```
src/
├── migrations/
│   ├── 001-CreateApiKeysTable.ts
│   ├── 002-AddUserTable.ts
│   └── ...
├── config/
│   └── database.config.ts
├── data-source.ts
└── auth/
    └── entities/
        └── api-key.entity.ts
```

## 🔧 Configuration Details

### Database Config (`src/config/database.config.ts`)
- **Entities**: Uses pattern matching `['src/**/*.entity.ts']`
- **Migrations**: Points to `['src/migrations/*.ts']`
- **Synchronization**: Disabled for production safety
- **Migration Table**: Named `migrations`

### Data Source (`src/data-source.ts`)
- Standalone TypeORM configuration
- Used by CLI commands
- Same configuration as NestJS app

## 📝 Migration File Example

```typescript
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateApiKeysTable001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'api_keys',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          // ... more columns
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('api_keys');
  }
}
```

## 🎯 Best Practices

### ✅ Do's
- **Use descriptive migration names**: `CreateUsersTable`, `AddEmailIndexToUsers`
- **Review generated migrations** before running
- **Test migrations** in development first
- **Use transactions** for complex migrations
- **Add indexes** for performance
- **Document breaking changes**

### ❌ Don'ts
- **Don't modify existing migrations** after deployment
- **Don't use synchronization** in production
- **Don't ignore migration errors**
- **Don't forget revert logic** in `down()` method
- **Don't use migrations for data seeding** (use seeders instead)

## 🚨 Troubleshooting

### Migration Already Exists
```bash
Error: Migration "Name" already exists
```
Solution: Use a different name or revert the existing migration.

### Database Connection Issues
```bash
Error: connect ECONNREFUSED
```
Solution: Ensure PostgreSQL is running and environment variables are correct.

### Entity Not Found
```bash
Error: No entity found for path
```
Solution: Check file paths and ensure entities use `.entity.ts` suffix.

## 🔍 Advanced Usage

### Custom SQL Migrations
```typescript
export class CustomSqlMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO api_keys (name, keyHash)
      VALUES ('default-key', 'hashed-value')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM api_keys WHERE name = 'default-key'
    `);
  }
}
```

### Data Seeding
Create a separate seeder or use `migration:run --fake` for initial data.

### Transaction Control
```typescript
export class ComplexMigration implements MigrationInterface {
  transaction = false; // Disable transaction for specific operations

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Complex operations that can't be in a transaction
    await queryRunner.query(`CREATE INDEX CONCURRENTLY ...`);
  }
}
```

## 📚 Additional Resources

- [TypeORM Migration Documentation](https://typeorm.io/migrations)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)
- [PostgreSQL UUID Extension](https://www.postgresql.org/docs/current/uuid-ossp.html)

## 🔄 Migration Checklist

Before running migrations in production:

- [ ] Backup database
- [ ] Test in staging environment
- [ ] Review migration SQL
- [ ] Verify revert logic
- [ ] Check for breaking changes
- [ ] Monitor application after migration

---

**Remember**: Migrations are a critical part of your application's data management. Always be careful and test thoroughly! 🚀