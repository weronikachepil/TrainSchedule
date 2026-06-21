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

  @Column({ nullable: true, type: 'int' })
  createdById: number | null;

  @CreateDateColumn()
  createdAt: Date;
}
