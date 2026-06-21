import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Train } from './entities/train.entity';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateTrainDto } from './dto/update-train.dto';

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

  create(dto: CreateTrainDto): Promise<Train> {
    const train = this.trainsRepository.create(dto);
    return this.trainsRepository.save(train);
  }

  async update(id: number, dto: UpdateTrainDto): Promise<Train> {
    const train = await this.findOne(id);
    Object.assign(train, dto);
    return this.trainsRepository.save(train);
  }

  async remove(id: number): Promise<void> {
    const train = await this.findOne(id);
    await this.trainsRepository.remove(train);
  }
}
