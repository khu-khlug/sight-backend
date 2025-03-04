import { Typeof } from '@khlug/util/types';

export class CreateDiscordIntegrationCommand {
  userId: number;
  code: string;
  state: string;

  constructor(params: Typeof<CreateDiscordIntegrationCommand>) {
    this.userId = params.userId;
    this.code = params.code;
    this.state = params.state;
  }
}
