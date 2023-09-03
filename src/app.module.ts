import { Module } from '@nestjs/common';
import { AppService } from '@sight/app/app.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
