import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, MinLength } from 'class-validator';

export class CreateTrainDto {
  @ApiProperty({ example: 'IC 741' })
  @IsString()
  @MinLength(1)
  trainNumber: string;

  @ApiProperty({ example: 'Київ → Львів' })
  @IsString()
  @MinLength(1)
  direction: string;

  @ApiProperty({ example: '2024-06-21T08:00:00.000Z' })
  @IsDateString()
  departureTime: string;

  @ApiProperty({ example: '2024-06-21T13:30:00.000Z' })
  @IsDateString()
  arrivalTime: string;

  @ApiProperty({ example: 'Київ-Пасажирський' })
  @IsString()
  @MinLength(1)
  station: string;
}
