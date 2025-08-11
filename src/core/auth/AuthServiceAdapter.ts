import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

import { AuthServiceConfig } from '@khlug/core/config/AuthConfig';

type AuthResponse = { login: false } | { login: true; userId: number };

@Injectable()
export class AuthServiceAdapter {
  private readonly client: AxiosInstance;

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<AuthServiceConfig>('auth');
    this.client = axios.create({
      baseURL: config.endpoint,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
      },
    });
  }

  async authenticate(cookies: string): Promise<number | null> {
    const { data } = await this.client.post<AuthResponse>('/internal/auth', {
      headers: { Cookie: cookies },
    });

    return data.login ? data.userId : null;
  }
}
