import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WebhookController],
})
export class WebhookModule {}
