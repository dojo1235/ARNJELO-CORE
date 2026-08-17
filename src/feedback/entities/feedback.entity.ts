import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm'
import { Exclude } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { User } from 'src/users/entities/user.entity'

@Entity('feedbacks')
export class Feedback {
  @ApiProperty({ description: 'Unique identifier for the feedback' })
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({ description: 'ID of the user who owns this feedback' })
  @Column()
  userId: number

  @Exclude()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User

  @ApiProperty({ description: 'Feedback message from user' })
  @Column({ type: 'text' })
  message: string

  @ApiProperty({ description: 'Date and time the feedback was created' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date
}
