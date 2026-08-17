import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm'
import { User } from 'src/users/entities/user.entity'

export enum TokenType {
  Refresh = 'refresh',
  MagicLogin = 'magicLogin',
  PasswordReset = 'passwordReset',
  EmailVerification = 'emailVerification',
  EmailChange = 'emailChange',
}

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int' })
  userId: number

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User

  @Column({ type: 'varchar', length: 255 })
  tokenHash: string

  @Column({ type: 'enum', enum: TokenType })
  type: TokenType

  @Column({ type: 'tinyint', default: false })
  revoked: boolean

  @Column({ type: 'timestamp' })
  expiresAt: Date

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @Column({ type: 'int', nullable: true })
  revokedById: number | null

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn()
  revokedBy: User | null

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date | null
}
