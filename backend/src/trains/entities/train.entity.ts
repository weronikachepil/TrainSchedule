import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Train {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  trainNumber: string;

  @Column()
  direction: string;

  @Column()
  departureTime: Date;

  @Column()
  arrivalTime: Date;

  @Column()
  station: string;

  @CreateDateColumn()
  createdAt: Date;
}
