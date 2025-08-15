import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('/ping')
  healthCheck() {
    return 'pong!';
  }
}
