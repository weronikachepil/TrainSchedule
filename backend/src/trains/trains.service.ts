import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Train } from './entities/train.entity';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateTrainDto } from './dto/update-train.dto';

interface RequestUser {
  id: number;
  role: string;
}

interface FindAllParams {
  search?: string;
  departureDate?: string;
  arrivalDate?: string;
}

@Injectable()
export class TrainsService {
  constructor(
    @InjectRepository(Train)
    private trainsRepository: Repository<Train>,
  ) {}

  findAll({ search, departureDate, arrivalDate }: FindAllParams = {}): Promise<Train[]> {
    const qb = this.trainsRepository.createQueryBuilder('train');

    if (search?.trim()) {
      const q = `%${search.trim()}%`;
      qb.andWhere(
        '(train.trainNumber ILIKE :q OR train.direction ILIKE :q OR train.station ILIKE :q)',
        { q },
      );
    }

    if (departureDate) {
      const start = new Date(departureDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(departureDate);
      end.setHours(23, 59, 59, 999);
      qb.andWhere('train.departureTime BETWEEN :depStart AND :depEnd', {
        depStart: start,
        depEnd: end,
      });
    }

    if (arrivalDate) {
      const start = new Date(arrivalDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(arrivalDate);
      end.setHours(23, 59, 59, 999);
      qb.andWhere('train.arrivalTime BETWEEN :arrStart AND :arrEnd', {
        arrStart: start,
        arrEnd: end,
      });
    }

    qb.orderBy('train.departureTime', 'ASC');
    return qb.getMany();
  }

  async findOne(id: number): Promise<Train> {
    const train = await this.trainsRepository.findOne({ where: { id } });
    if (!train) throw new NotFoundException(`Train #${id} not found`);
    return train;
  }

  create(dto: CreateTrainDto, user: RequestUser): Promise<Train> {
    const train = this.trainsRepository.create({ ...dto, createdById: user.id });
    return this.trainsRepository.save(train);
  }

  async update(id: number, dto: UpdateTrainDto, user: RequestUser): Promise<Train> {
    const train = await this.findOne(id);
    if (user.role !== 'admin' && train.createdById !== user.id) {
      throw new ForbiddenException('You can only edit your own trains');
    }
    Object.assign(train, dto);
    return this.trainsRepository.save(train);
  }

  async remove(id: number, user: RequestUser): Promise<void> {
    const train = await this.findOne(id);
    if (user.role !== 'admin' && train.createdById !== user.id) {
      throw new ForbiddenException('You can only delete your own trains');
    }
    await this.trainsRepository.remove(train);
  }
}
