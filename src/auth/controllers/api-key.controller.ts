import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiKeyService } from '../services/api-key.service';
import { CreateApiKeyDto } from '../dto/create-api-key.dto';
import {
  ApiKeyResponseDto,
  CreateApiKeyResponseDto,
} from '../dto/api-key-response.dto';

@Controller('api-keys')
@UsePipes(new ValidationPipe({ transform: true }))
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApiKey(
    @Body() createApiKeyDto: CreateApiKeyDto,
  ): Promise<CreateApiKeyResponseDto> {
    return this.apiKeyService.generateApiKey(createApiKeyDto);
  }

  @Get()
  async listApiKeys(): Promise<ApiKeyResponseDto[]> {
    return this.apiKeyService.listApiKeys();
  }

  @Get(':id')
  async getApiKey(@Param('id') id: string): Promise<ApiKeyResponseDto> {
    const apiKey = await this.apiKeyService.getApiKeyById(id);
    if (!apiKey) {
      throw new Error('API key not found');
    }
    return apiKey;
  }

  @Put(':id')
  async updateApiKey(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateApiKeyDto>,
  ): Promise<ApiKeyResponseDto> {
    const updatedKey = await this.apiKeyService.updateApiKey(id, updateData);
    if (!updatedKey) {
      throw new Error('API key not found');
    }
    return updatedKey;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeApiKey(@Param('id') id: string): Promise<void> {
    await this.apiKeyService.revokeApiKey(id);
  }
}
