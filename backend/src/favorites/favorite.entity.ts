import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity()
@Unique(['userId', 'trainId'])
export class Favorite {
  @PrimaryGeneratedColumn() id: number;
  @Column() userId: number;
  @Column() trainId: number;
  @CreateDateColumn() createdAt: Date;
}
