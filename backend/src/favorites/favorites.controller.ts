import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthRequest extends Request {
  user: { id: number; email: string; role: string };
}

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getAll(@Req() req: AuthRequest) {
    return this.favoritesService.getByUser(req.user.id);
  }

  @Post(':trainId')
  toggle(
    @Param('trainId', ParseIntPipe) trainId: number,
    @Req() req: AuthRequest,
  ) {
    return this.favoritesService.toggle(req.user.id, trainId);
  }
}
