import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm'
import { Exclude } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { User } from 'src/users/entities/user.entity'
import { Store } from 'src/stores/entities/store.entity'
import { ToNumber } from 'src/common/decorators/to-number.decorator'

@Entity()
@Unique(['userId', 'storeId'])
export class StoreUser {
  @ApiProperty({ description: 'Unique identifier for the store user' })
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({ description: 'User ID' })
  @Column({ type: 'int' })
  userId: number

  @ApiProperty({ description: 'User details', type: User })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User

  @ApiProperty({ description: 'Store ID' })
  @Column({ type: 'int' })
  storeId: number

  @Exclude()
  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn()
  store: Store

  @ApiProperty({ description: 'Indicates if the user is an admin of this store' })
  @Column({ type: 'boolean', default: false })
  isAdmin: boolean

  @ApiProperty({ description: 'Total amount spent by user in this store' })
  @ToNumber()
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalSpent: number

  @ApiProperty({ description: 'Indicates if the user is banned in this store' })
  @Column({ type: 'boolean', default: false })
  isBanned: boolean

  @ApiProperty({ description: 'Indicates if the user is soft-deleted in this store' })
  @Column({ type: 'boolean', default: false })
  isDeleted: boolean

  @ApiProperty({
    description: 'ID of the user who created this record',
    type: Number,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  createdById: number | null

  @Exclude()
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  createdBy: User | null

  @ApiProperty({ description: 'Timestamp when the record was created' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @ApiProperty({
    description: 'ID of the user who last updated this record',
    type: Number,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  updatedById: number | null

  @Exclude()
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  updatedBy: User | null

  @ApiProperty({
    description: 'Timestamp when the record was last updated',
    type: Date,
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date | null

  @ApiProperty({
    description: 'ID of the user who banned this store user',
    type: Number,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  bannedById: number | null

  @Exclude()
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  bannedBy: User | null

  @ApiProperty({
    description: 'Timestamp when the user was banned in this store',
    type: Date,
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  bannedAt: Date | null

  @ApiProperty({
    description: 'ID of the user who deleted this record',
    type: Number,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  deletedById: number | null

  @Exclude()
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  deletedBy: User | null

  @ApiProperty({ description: 'Timestamp when the record was deleted', type: Date, nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null

  @ApiProperty({
    description: 'ID of the user who restored this record',
    type: Number,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  restoredById: number | null

  @Exclude()
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  restoredBy: User | null

  @ApiProperty({
    description: 'Timestamp when the record was restored',
    type: Date,
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  restoredAt: Date | null
}
