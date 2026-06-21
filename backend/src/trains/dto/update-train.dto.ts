import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTrainDto {
  @ApiPropertyOptional({ example: 'IC 741' })
  trainNumber?: string;

  @ApiPropertyOptional({ example: 'Kyiv → Lviv' })
  direction?: string;

  @ApiPropertyOptional({ example: '2024-06-21T08:00:00.000Z' })
  departureTime?: Date;

  @ApiPropertyOptional({ example: '2024-06-21T13:30:00.000Z' })
  arrivalTime?: Date;

  @ApiPropertyOptional({ example: 'Kyiv-Pasazhyrskyi' })
  station?: string;
}
