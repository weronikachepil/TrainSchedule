import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
  ) {}

  getByUser(userId: number): Promise<Favorite[]> {
    return this.favoritesRepository.find({ where: { userId } });
  }

  async toggle(userId: number, trainId: number): Promise<{ saved: boolean }> {
    const existing = await this.favoritesRepository.findOne({
      where: { userId, trainId },
    });
    if (existing) {
      await this.favoritesRepository.remove(existing);
      return { saved: false };
    }
    const favorite = this.favoritesRepository.create({ userId, trainId });
    await this.favoritesRepository.save(favorite);
    return { saved: true };
  }
}
