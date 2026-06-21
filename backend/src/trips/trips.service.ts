import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './trip.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
  ) {}

  getByUser(userId: number): Promise<Trip[]> {
    return this.tripsRepository.find({
      where: { userId },
      order: { tripDate: 'ASC' },
    });
  }

  async create(userId: number, trainId: number, tripDate: string): Promise<Trip> {
    const trip = this.tripsRepository.create({ userId, trainId, tripDate });
    return this.tripsRepository.save(trip);
  }

  async remove(id: number, userId: number): Promise<void> {
    const trip = await this.tripsRepository.findOne({ where: { id } });
    if (!trip) throw new NotFoundException(`Trip #${id} not found`);
    if (trip.userId !== userId) throw new ForbiddenException('You can only delete your own trips');
    await this.tripsRepository.remove(trip);
  }
}
