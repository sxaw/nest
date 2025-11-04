import {
  Controller,
  Post,
  Get,
  Request,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ApiKeyGuard, ApiKeyRequest } from '../auth/guards/api-key.guard';
import { Public } from '../auth/guards/public.decorator';

type BatchWebhookData = Array<any>;

@Controller('webhooks')
@UseGuards(ApiKeyGuard)
export class WebhookController {
  @Get('status')
  @Public()
  getStatus() {
    return {
      status: 'healthy',
      service: 'webhook-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('batch-data')
  @HttpCode(HttpStatus.OK)
  handleBatchData(
    @Request() req: ApiKeyRequest,
    @Body() batchData: BatchWebhookData,
  ) {
    const apiKey = req.apiKey;
    console.log(
      `Batch webhook call from API key: ${apiKey.name}, items: ${batchData.length}`,
    );

    // TODO: Process batch data (placeholder logic)
    return {
      status: 'success',
      message: `Processed ${batchData.length} items`,
      timestamp: new Date().toISOString(),
      processedCount: batchData.length,
      // TODO: Add actual business logic here
    };
  }
}
