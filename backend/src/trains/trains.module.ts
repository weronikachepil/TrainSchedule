import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Train } from './entities/train.entity';
import { TrainsService } from './trains.service';
import { TrainsController } from './trains.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Train])],
  providers: [TrainsService],
  controllers: [TrainsController],
})
export class TrainsModule {}
