import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { WebhookModule } from './webhooks/webhook.module';
import { HealthModule } from './health/health.module';
import { MqttModule } from './mqtt/mqtt.module';
import { HealthDataPoint } from './health/entities/health-data-point.entity';
import { getDatabaseConfig } from './config/database.config';
import { validateConfig } from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config) => {
        try {
          return validateConfig(config);
        } catch (error: unknown) {
          throw new Error(
            `Configuration validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    AuthModule,
    WebhookModule,
    MqttModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
