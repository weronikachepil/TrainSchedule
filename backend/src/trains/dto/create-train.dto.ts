import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainDto {
  @ApiProperty({ example: 'IC 741' })
  trainNumber: string;

  @ApiProperty({ example: 'Kyiv → Lviv' })
  direction: string;

  @ApiProperty({ example: '2024-06-21T08:00:00.000Z' })
  departureTime: Date;

  @ApiProperty({ example: '2024-06-21T13:30:00.000Z' })
  arrivalTime: Date;

  @ApiProperty({ example: 'Kyiv-Pasazhyrskyi' })
  station: string;
}
