import { Injectable, Logger } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { add } from 'date-fns'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UsersRepository } from 'src/users/users.repository'
import { AuthRepository } from './auth.repository'
import { StoresRepository } from 'src/stores/stores.repository'
import { EmailService } from 'src/email/email.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { ChangeEmailDto } from './dto/change-email.dto'
import { Role } from 'src/users/entities/user.entity'
import { User } from 'src/users/entities/user.entity'
import { TokenType } from './entities/token.entity'
import { hash, compare } from 'src/common/utils/crypto.util'
import { AppError, ErrorCode } from 'src/common/exceptions/app-error'

interface JwtRefreshPayload {
  sub: number
  storeId: number | null
  isStoreActive: boolean
  isBannedFromStore: boolean
  role: string
}
interface JwtEmailChangePayload {
  sub: number
  newEmail: string
}

interface JwtActionPayload {
  sub: number
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
    private readonly storesRepository: StoresRepository,
    private readonly emailService: EmailService,
  ) {}

  async register({ password, ...data }: RegisterDto) {
    const existing = await this.usersRepository.findUserByEmail(data.email)
    if (existing) throw new AppError(ErrorCode.INVALID_STATE, 'Email already exists')
    const passwordHash = await hash(password)
    const created = await this.usersRepository.createUser({
      ...data,
      passwordHash,
      lastLogin: new Date(),
    })
    this.emailService.sendWelcomeEmail(created.email, created.name).catch((err) => {
      this.logger.error(err)
    })
    const tokens = await this.generateAuthTokens({
      userId: created.id,
      storeId: created.storeId,
      isStoreActive: false,
      isBannedFromStore: false,
      role: created.role,
    })
    return { user: created, tokens }
  }

  async login(data: LoginDto) {
    const user = await this.usersRepository.findUserByEmail(data.email)
    if (!user || user.isDeleted)
      throw new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials')
    if (user.isBanned) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Account banned')
    const isValid = await compare(data.password, user.passwordHash)
    if (!isValid) throw new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials')
    await this.usersRepository.updateUser(user.id, { lastLogin: new Date() })
    const updated = await this.usersRepository.findUserByEmail(data.email)
    const storeContext = await this.getStoreContext(user)
    const tokens = await this.generateAuthTokens({
      userId: user.id,
      storeId: user.storeId,
      isStoreActive: storeContext.isStoreActive,
      isBannedFromStore: storeContext.isBannedFromStore,
      role: user.role,
    })
    return { user: updated, tokens }
  }

  async refreshToken(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken)
    if (!payload) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Invalid refresh token')
    const record = await this.findValidTokenRecord(payload.sub, refreshToken, TokenType.Refresh)
    if (!record) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Session terminated')
    await this.authRepository.revokeToken(record.id, { revoked: true, revokedAt: new Date() })
    const user = await this.usersRepository.findUserById(payload.sub)
    if (!user || user.isDeleted) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    if (user.isBanned) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Account banned')
    const storeContext = await this.getStoreContext(user)
    const tokens = await this.generateAuthTokens({
      userId: user.id,
      storeId: user.storeId,
      isStoreActive: storeContext.isStoreActive,
      isBannedFromStore: storeContext.isBannedFromStore,
      role: user.role,
    })
    return { tokens }
  }

  async logout(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken)
    if (!payload) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Invalid refresh token')
    const record = await this.findValidTokenRecord(payload.sub, refreshToken, TokenType.Refresh)
    if (!record)
      throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Already logged out or invalid session')
    await this.authRepository.revokeToken(record.id, { revoked: true, revokedAt: new Date() })
  }

  async logoutAll(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken)
    if (!payload) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Invalid refresh token')
    const record = await this.findValidTokenRecord(payload.sub, refreshToken, TokenType.Refresh)
    if (!record) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Invalid session')
    await this.authRepository.revokeAllTokensForUser(payload.sub, TokenType.Refresh, {
      revoked: true,
      revokedAt: new Date(),
    })
  }

  async sendEmailVerification(email: string) {
    const user = await this.usersRepository.findUserByEmail(email)
    if (!user || user.isDeleted || user.isBanned || user.isVerified) return
    await this.authRepository.revokeAllTokensForUser(user.id, TokenType.EmailVerification, {
      revoked: true,
      revokedAt: new Date(),
    })
    const emailVerificationToken = await this.generateActionToken(
      user.id,
      TokenType.EmailVerification,
    )
    const link = `${this.configService.get('urls.clientUrl')}/auth/verify-email?token=${emailVerificationToken}`
    this.emailService.sendEmailVerification(user.email, link).catch((err) => {
      this.logger.error(err)
    })
  }

  async verifyEmail(emailVerificationToken: string) {
    const payload = await this.verifyActionToken(emailVerificationToken)
    if (!payload)
      throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Invalid email verification token')
    const record = await this.findValidTokenRecord(
      payload.sub,
      emailVerificationToken,
      TokenType.EmailVerification,
    )
    if (!record) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Session terminated')
    await this.authRepository.revokeAllTokensForUser(payload.sub, TokenType.EmailVerification, {
      revoked: true,
      revokedAt: new Date(),
    })
    const user = await this.usersRepository.findUserById(record.userId)
    if (!user || user.isDeleted) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    if (user.isBanned) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Account banned')
    await this.usersRepository.updateUser(user.id, { isVerified: true })
    this.emailService.sendEmailVerificationSuccessEmail(user.email).catch((err) => {
      this.logger.error(err)
    })
  }

  async requestEmailChange(userId: number, data: ChangeEmailDto) {
    const user = await this.usersRepository.findUserById(userId)
    if (!user || user.isDeleted) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    if (user.isBanned) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Account banned')
    const isValid = await compare(data.password, user.passwordHash)
    if (!isValid) throw new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid password')
    const existing = await this.usersRepository.findUserByEmail(data.newEmail)
    if (existing) throw new AppError(ErrorCode.INVALID_STATE, 'Email already exists')
    await this.authRepository.revokeAllTokensForUser(userId, TokenType.EmailChange, {
      revoked: true,
      revokedAt: new Date(),
    })
    const emailChangeToken = await this.generateEmailChangeToken(userId, data.newEmail)
    const link = `${this.configService.get('urls.clientUrl')}/auth/email-change/verify?token=${emailChangeToken}`
    this.emailService.sendEmailChange(data.newEmail, link).catch((err) => {
      this.logger.error(err)
    })
  }

  @Transactional()
  async verifyAndChangeEmail(emailChangeToken: string) {
    const payload = await this.verifyEmailChangeToken(emailChangeToken)
    if (!payload)
      throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Invalid email verification token')
    const record = await this.findValidTokenRecord(
      payload.sub,
      emailChangeToken,
      TokenType.EmailChange,
    )
    if (!record) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Session terminated')
    await this.authRepository.revokeAllTokensForUser(payload.sub, TokenType.EmailChange, {
      revoked: true,
      revokedAt: new Date(),
    })
    await this.authRepository.revokeAllTokensForUser(payload.sub, TokenType.Refresh, {
      revoked: true,
      revokedAt: new Date(),
    })
    const user = await this.usersRepository.findUserById(payload.sub)
    if (!user || user.isDeleted) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    if (user.isBanned) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Account banned')
    const existing = await this.usersRepository.findUserByEmail(payload.newEmail)
    if (existing) throw new AppError(ErrorCode.INVALID_STATE, 'Email already taken')
    await this.usersRepository.updateUser(payload.sub, { email: payload.newEmail })
    this.emailService.sendEmailChangeSuccessEmail(payload.newEmail, user.name).catch((err) => {
      this.logger.error(err)
    })
    this.emailService
      .sendEmailChangeSecurityAlertEmail(user.email, payload.newEmail, user.name)
      .catch((err) => {
        this.logger.error(err)
      })
  }

  async sendMagicLoginEmail(email: string) {
    const user = await this.usersRepository.findUserByEmail(email)
    if (!user || user.isDeleted || user.isBanned) return
    await this.authRepository.revokeAllTokensForUser(user.id, TokenType.MagicLogin, {
      revoked: true,
      revokedAt: new Date(),
    })
    const magicLoginToken = await this.generateActionToken(user.id, TokenType.MagicLogin)
    const link = `${this.configService.get('urls.clientUrl')}/auth/magic-login?token=${magicLoginToken}`
    this.emailService.sendMagicLoginEmail(user.email, link).catch((err) => {
      this.logger.error(err)
    })
  }

  async magicLogin(magicLoginToken: string) {
    const payload = await this.verifyActionToken(magicLoginToken)
    if (!payload) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Invalid Magic login token')
    const record = await this.findValidTokenRecord(
      payload.sub,
      magicLoginToken,
      TokenType.MagicLogin,
    )
    if (!record) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Session terminated')
    await this.authRepository.revokeAllTokensForUser(record.userId, TokenType.MagicLogin, {
      revoked: true,
      revokedAt: new Date(),
    })
    const user = await this.usersRepository.findUserById(record.userId)
    if (!user || user.isDeleted) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    if (user.isBanned) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Account banned')
    await this.usersRepository.updateUser(record.userId, { lastLogin: new Date() })
    const updated = await this.usersRepository.findUserById(record.userId)
    const storeContext = await this.getStoreContext(user)
    const tokens = await this.generateAuthTokens({
      userId: user.id,
      storeId: user.storeId,
      isStoreActive: storeContext.isStoreActive,
      isBannedFromStore: storeContext.isBannedFromStore,
      role: user.role,
    })
    this.emailService.sendMagicLoginSuccessEmail(user.email).catch((err) => {
      this.logger.error(err)
    })
    return { user: updated, tokens }
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.usersRepository.findUserByEmail(email)
    if (!user || user.isDeleted || user.isBanned) return
    await this.authRepository.revokeAllTokensForUser(user.id, TokenType.PasswordReset, {
      revoked: true,
      revokedAt: new Date(),
    })
    const passwordResetToken = await this.generateActionToken(user.id, TokenType.PasswordReset)
    const link = `${this.configService.get('urls.clientUrl')}/auth/reset-password?token=${passwordResetToken}`
    this.emailService.sendPasswordResetEmail(user.email, link).catch((err) => {
      this.logger.error(err)
    })
  }

  async resetPassword(passwordResetToken: string, password: string) {
    const payload = await this.verifyActionToken(passwordResetToken)
    if (!payload)
      throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Invalid password reset token')
    const record = await this.findValidTokenRecord(
      payload.sub,
      passwordResetToken,
      TokenType.PasswordReset,
    )
    if (!record) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Session terminated')
    await this.authRepository.revokeAllTokensForUser(record.userId, TokenType.PasswordReset, {
      revoked: true,
      revokedAt: new Date(),
    })
    const user = await this.usersRepository.findUserById(record.userId)
    if (!user || user.isDeleted) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    if (user.isBanned) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Account banned')
    const passwordHash = await hash(password)
    await this.usersRepository.updateUser(user.id, { passwordHash })
    this.emailService.sendPasswordChangeSecurityAlertEmail(user.email).catch((err) => {
      this.logger.error(err)
    })
  }

  private async generateAuthTokens({
    userId,
    storeId,
    isStoreActive,
    isBannedFromStore,
    role,
  }: {
    userId: number
    storeId: number | null
    isStoreActive: boolean
    isBannedFromStore: boolean
    role: string
  }) {
    const payload: JwtRefreshPayload = {
      sub: userId,
      storeId,
      isStoreActive,
      isBannedFromStore,
      role,
    }
    const { accessSecret, refreshSecret, accessExpiresIn, refreshExpiresIn } =
      this.configService.get('jwt')
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn,
    })
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    })
    const tokenHash = await hash(refreshToken)
    const expiresAt = add(new Date(), { days: parseInt(refreshExpiresIn, 10) })
    await this.authRepository.createToken({
      userId: payload.sub,
      tokenHash,
      type: TokenType.Refresh,
      expiresAt,
    })
    return { accessToken, refreshToken }
  }

  private async generateEmailChangeToken(userId: number, newEmail: string) {
    const payload: JwtEmailChangePayload = { sub: userId, newEmail }
    const { actionSecret, actionExpiresIn } = this.configService.get('jwt')
    const actionToken = await this.jwtService.signAsync(payload, {
      secret: actionSecret,
      expiresIn: actionExpiresIn,
    })
    const tokenHash = await hash(actionToken)
    const expiresAt = add(new Date(), { minutes: parseInt(actionExpiresIn, 10) })
    await this.authRepository.createToken({
      userId,
      tokenHash,
      type: TokenType.EmailChange,
      expiresAt,
    })
    return actionToken
  }

  private async generateActionToken(userId: number, type: TokenType) {
    const payload: JwtActionPayload = { sub: userId }
    const { actionSecret, actionExpiresIn } = this.configService.get('jwt')
    const actionToken = await this.jwtService.signAsync(payload, {
      secret: actionSecret,
      expiresIn: actionExpiresIn,
    })
    const tokenHash = await hash(actionToken)
    const expiresAt = add(new Date(), { minutes: parseInt(actionExpiresIn, 10) })
    await this.authRepository.createToken({
      userId,
      tokenHash,
      type,
      expiresAt,
    })
    return actionToken
  }

  private async getStoreContext(user: Partial<User>) {
    let isStoreActive = false
    let isBannedFromStore = false
    if (user.storeId != null) {
      const store = await this.storesRepository.findStoreById(user.storeId)
      if (!store) throw new AppError(ErrorCode.NOT_FOUND, 'Store not found')
      isStoreActive = store.isActive
      if (user.role !== Role.StoreOwner) {
        const storeAdmin = await this.storesRepository.findStoreAdminById(user.storeId, user.id!)
        if (!storeAdmin) throw new AppError(ErrorCode.NOT_FOUND, 'Store admin not found')
        isBannedFromStore = storeAdmin.isBanned
      }
    }
    return { isStoreActive, isBannedFromStore }
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtRefreshPayload | null> {
    try {
      const { refreshSecret } = this.configService.get('jwt')
      return await this.jwtService.verifyAsync<JwtRefreshPayload>(refreshToken, {
        secret: refreshSecret,
      })
    } catch {
      return null
    }
  }

  private async verifyEmailChangeToken(
    emailChangeToken: string,
  ): Promise<JwtEmailChangePayload | null> {
    try {
      const { actionSecret } = this.configService.get('jwt')
      return await this.jwtService.verifyAsync<JwtEmailChangePayload>(emailChangeToken, {
        secret: actionSecret,
      })
    } catch {
      return null
    }
  }

  private async verifyActionToken(actionToken: string): Promise<JwtActionPayload | null> {
    try {
      const { actionSecret } = this.configService.get('jwt')
      return await this.jwtService.verifyAsync<JwtActionPayload>(actionToken, {
        secret: actionSecret,
      })
    } catch {
      return null
    }
  }

  private async findValidTokenRecord(userId: number, token: string, type: TokenType) {
    const tokenRecords = await this.authRepository.findActiveUserTokens(userId, type)
    for (const record of tokenRecords) {
      if (await compare(token, record.tokenHash)) return record
    }
    return null
  }
}
