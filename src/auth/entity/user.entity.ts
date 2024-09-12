import { UUID } from 'crypto';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({
    type: String,
    unique: true,
  })
  email: string;

  @Column({
    type: String,
  }) password: string;
}