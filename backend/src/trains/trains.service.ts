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

@Injectable()
export class TrainsService {
  constructor(
    @InjectRepository(Train)
    private trainsRepository: Repository<Train>,
  ) {}

  findAll(): Promise<Train[]> {
    return this.trainsRepository.find({ order: { departureTime: 'ASC' } });
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
