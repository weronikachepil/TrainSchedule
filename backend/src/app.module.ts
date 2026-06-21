import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TrainsModule } from './trains/trains.module';
import { FavoritesModule } from './favorites/favorites.module';
import { TripsModule } from './trips/trips.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    TrainsModule,
    FavoritesModule,
    TripsModule,
  ],
})
export class AppModule {}
