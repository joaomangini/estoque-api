import { Module } from '@nestjs/common';
import { KeysController } from './keys.controller';
import { KeysService } from './keys.service';

@Module({
  controllers: [KeysController],
  providers: [KeysService],
  exports: [KeysService], // usado pelo JwtAuthGuard para autenticar via x-api-key
})
export class KeysModule {}
