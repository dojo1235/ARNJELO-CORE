import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Store } from 'src/stores/entities/store.entity'
import { ToNumber } from 'src/common/decorators/to-number.decorator'

@Entity()
@Unique(['referredStoreId'])
export class StoreReferral {
  @ApiProperty({ description: 'Unique identifier for store referral' })
  @PrimaryGeneratedColumn()
  id: number

  @ApiProperty({ description: 'ID of the store that refers other stores' })
  @Column({ type: 'int' })
  referrerStoreId: number

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn()
  referrerStore: Store

  @ApiProperty({ description: 'Store that was referred', type: Store })
  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn()
  referredStore: Store

  @ApiProperty({ description: 'ID of the store that was referred' })
  @Column({ type: 'int' })
  referredStoreId: number

  @ApiProperty({ description: 'Total earnings in USD generated from this referred store' })
  @ToNumber()
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalEarned: number

  @ApiProperty({ description: 'When the referrered store joined' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date
}
