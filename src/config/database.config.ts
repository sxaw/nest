import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbConfig = {
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    nodeEnv: configService.get<string>('NODE_ENV'),
  };

  return {
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    entities: ['**/*.entity.js'],
    synchronize: false, // Only for development
    logging: dbConfig.nodeEnv !== 'production',
    // // Migration configuration
    migrations: ['src/migrations/*.js'],
    migrationsTableName: 'migrations',
    migrationsRun: false, // Don't auto-run migrations on start
  };
};
