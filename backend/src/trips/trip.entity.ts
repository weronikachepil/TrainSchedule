import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Train } from '../trains/entities/train.entity';

@Entity()
export class Trip {
  @PrimaryGeneratedColumn() id: number;
  @Column() userId: number;
  @Column() trainId: number;
  @ManyToOne(() => Train, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainId' })
  train: Train;
  @Column({ type: 'date' }) tripDate: string;
  @CreateDateColumn() createdAt: Date;
}
