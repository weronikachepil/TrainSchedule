import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './trip.entity';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Trip])],
  providers: [TripsService],
  controllers: [TripsController],
})
export class TripsModule {}
