import { UUID } from 'crypto';
import { User } from 'src/auth/entity/user.entity';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'tasks',
})
export default class Task {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({
    type: String,
  })
  @Index()
  title: string;
  
  @Column({
    type: String,
    nullable: true,
  })
  description: string;
  
  @Column({
    type: Boolean,
    default: false,
  })
  completed?: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User,)
  user: User;

  @RelationId((task: Task) => task.user)
  userId: UUID;
}

