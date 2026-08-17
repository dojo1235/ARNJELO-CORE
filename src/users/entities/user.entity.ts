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
import { Store } from 'src/stores/entities/store.entity'

export enum Role {
  SuperAdmin = 'superAdmin',
  StoreOwner = 'storeOwner',
  GeneralAdmin = 'generalAdmin',
  UserManager = 'userManager',
  ProductManager = 'productManager',
  OrderManager = 'orderManager',
  ViewOnlyAdmin = 'viewOnlyAdmin',
  User = 'user',
}

@Entity()
export class User {
  @ApiProperty({ description: 'Unique identifier for the user' })
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({ description: 'Full name of the user' })
  @Column({ type: 'varchar', length: 50 })
  name: string

  @ApiProperty({ description: 'Email address of the user' })
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  passwordHash: string

  @ApiProperty({ description: 'Store ID that owns this product', type: Number, nullable: true })
  @Column({ type: 'int', nullable: true })
  storeId: number | null

  @Exclude()
  @ManyToOne(() => Store, { onDelete: 'SET NULL' })
  @JoinColumn()
  store: Store | null

  @ApiProperty({ description: 'Role of the user', enum: Role })
  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role

  @ApiProperty({
    description: 'URL to the user avatar or profile image',
    type: String,
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl: string | null

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarKey: string | null

  @ApiProperty({ description: 'Indicates if the user has been verified' })
  @Column({ type: 'tinyint', default: 0 })
  isVerified: boolean

  @ApiProperty({ description: 'Indicates if the user is banned' })
  @Column({ type: 'tinyint', default: 0 })
  isBanned: boolean

  @ApiProperty({ description: 'Indicates if the user is soft-deleted' })
  @Column({ type: 'tinyint', default: 0 })
  isDeleted: boolean

  @ApiProperty({ description: 'Timestamp of last login', type: Date, nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date | null

  @ApiProperty({
    description: 'ID of the user who created this user',
    type: Number,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  createdById: number | null

  @Exclude()
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  createdBy: User | null

  @ApiProperty({ description: 'Timestamp when the user was created' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @ApiProperty({
    description: 'ID of the user who last updated this user',
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
    description: 'Timestamp when the user was last updated',
    type: Date,
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  updatedAt: Date | null

  @ApiProperty({ description: 'ID of the user who banned this user', type: Number, nullable: true })
  @Column({ type: 'int', nullable: true })
  bannedById: number | null

  @Exclude()
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  bannedBy: User | null

  @ApiProperty({ description: 'Timestamp when the user was banned', type: Date, nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  bannedAt: Date | null

  @ApiProperty({
    description: 'ID of the user who deleted this user',
    type: Number,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  deletedById: number | null

  @Exclude()
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  deletedBy: User | null

  @ApiProperty({ description: 'Timestamp when the user was deleted', type: Date, nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null

  @ApiProperty({
    description: 'ID of the user who restored this user',
    type: Number,
    nullable: true,
  })
  @Column({ type: 'int', nullable: true })
  restoredById: number | null

  @Exclude()
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  restoredBy: User | null

  @ApiProperty({ description: 'Timestamp when the user was restored', type: Date, nullable: true })
  @Column({ type: 'timestamp', nullable: true })
  restoredAt: Date | null
}
