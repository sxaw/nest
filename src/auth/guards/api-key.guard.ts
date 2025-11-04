import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKey } from '../entities/api-key.entity';
import { ApiKeyService } from '../services/api-key.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { Request } from 'express';

export interface ApiKeyRequest extends Request {
  apiKey: ApiKey;
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<ApiKeyRequest>();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    const keyEntity = await this.apiKeyService.validateApiKey(apiKey);
    if (!keyEntity) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (keyEntity.expiresAt && keyEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('API key expired');
    }

    if (!keyEntity.isActive) {
      throw new UnauthorizedException('API key deactivated');
    }

    await this.apiKeyService.updateUsage(keyEntity.id);

    request.apiKey = keyEntity;

    return true;
  }

  private extractApiKey(request: Request): string | null {
    const headerKey = request.headers['x-api-key'] as string;
    if (headerKey) {
      return headerKey;
    }

    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const queryKey = request.query.api_key as string;
    if (queryKey) {
      return queryKey;
    }

    return null;
  }
}
