import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { TrainsService } from './trains.service';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateTrainDto } from './dto/update-train.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: number; email: string; role: string };
}

@ApiTags('trains')
@Controller('trains')
export class TrainsController {
  constructor(private readonly trainsService: TrainsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('departureDate') departureDate?: string,
    @Query('arrivalDate') arrivalDate?: string,
  ) {
    return this.trainsService.findAll({ search, departureDate, arrivalDate });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateTrainDto, @Req() req: AuthRequest) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admins only');
    return this.trainsService.create(dto, req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTrainDto,
    @Req() req: AuthRequest,
  ) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admins only');
    return this.trainsService.update(id, dto, req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: AuthRequest) {
    if (req.user.role !== 'admin') throw new ForbiddenException('Admins only');
    return this.trainsService.remove(id, req.user);
  }
}
