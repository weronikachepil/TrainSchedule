import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: number; email: string; role: string };
}

@UseGuards(JwtAuthGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  getAll(@Req() req: AuthRequest) {
    return this.tripsService.getByUser(req.user.id);
  }

  @Post()
  create(
    @Body() body: { trainId: number; tripDate: string; note?: string },
    @Req() req: AuthRequest,
  ) {
    return this.tripsService.create(req.user.id, body.trainId, body.tripDate, body.note);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.tripsService.remove(id, req.user.id);
  }
}
