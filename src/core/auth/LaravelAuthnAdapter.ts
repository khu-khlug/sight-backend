import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import fs from 'fs/promises';
import { unserialize } from 'php-serialize';

import { LaravelSessionConfig } from '@khlug/core/config/LaravelSessionConfig';

type LoginKey = `login_${string}`;

type EncryptedSession = {
  iv: string;
  value: string;
  mac: string;
};

type SessionData = {
  _token: string;
  _previous: {
    url: string;
  };
  _flash: {
    old: any;
    new: any;
  };
  [key: LoginKey]: number | undefined;
};

@Injectable()
export class LaravelAuthnAdapter {
  private readonly config: LaravelSessionConfig;

  constructor(configService: ConfigService) {
    this.config = configService.getOrThrow<LaravelSessionConfig>('session');
  }

  async authenticate(rawSession: string): Promise<number | null> {
    const session = this.normalize(rawSession);
    const decrypted = this.decrypt(session);

    const sessionId = this.getSessionId(decrypted);
    const serializedSessionData = await this.getSessionData(sessionId);

    const sessionData: SessionData = unserialize(serializedSessionData);
    const userId = this.getUserId(sessionData);

    return userId;
  }

  private normalize(session: string): EncryptedSession {
    const urlDecoded = decodeURIComponent(session);
    const base64Decoded = Buffer.from(urlDecoded, 'base64').toString('utf-8');
    return JSON.parse(base64Decoded);
  }

  private decrypt(session: EncryptedSession): string {
    const key = this.config.secret;

    const iv = Buffer.from(session.iv, 'base64');
    const value = Buffer.from(session.value, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(value), decipher.final()]);

    const hash = crypto
      .createHmac('sha256', key)
      .update(session.iv + session.value)
      .digest()
      .toString('hex');

    if (session.mac !== hash) {
      throw new Error('Invalid MAC');
    }

    return decrypted.toString();
  }

  private getSessionId(decrypted: string): string {
    const splitted = decrypted.split('|');

    if (splitted.length < 2) {
      throw new Error('Invalid session format');
    }

    return splitted[1];
  }

  private async getSessionData(sessionId: string): Promise<string> {
    const path = `${this.config.storagePath}/${sessionId}`;
    return await fs.readFile(path, { encoding: 'utf8' });
  }

  private getUserId(sessionData: SessionData): number | null {
    const loginKey: LoginKey | undefined = Object.keys(sessionData).find(
      (key): key is LoginKey => key.startsWith('login_'),
    );
    return loginKey ? (sessionData[loginKey] ?? null) : null;
  }
}
