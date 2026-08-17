import { Injectable, Logger } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { User } from './entities/user.entity'
import { AuthRepository } from '../auth/auth.repository'
import { UsersRepository } from './users.repository'
import { R2ImageService } from 'src/storage/r2-image.service'
import { EmailService } from 'src/email/email.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { CreateAdminDto } from './dto/create-admin.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'
import { FindUsersDto } from './dto/find-users.dto'
import { Role } from './entities/user.entity'
import { TokenType } from 'src/auth/entities/token.entity'
import { hash, compare } from 'src/common/utils/crypto.util'
import { parseAndValidateDto } from 'src/common/utils/parse-and-validate-dto'
import { AppError, ErrorCode } from 'src/common/exceptions/app-error'

type UpdateUserInput = Partial<User> & { password?: string }

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository,
    private readonly r2ImageService: R2ImageService,
    private readonly emailService: EmailService,
  ) {}

  // Create admin (super admin)
  async createAdmin({ password, ...data }: CreateAdminDto, superAdminId: number) {
    if (data.role === Role.User)
      throw new AppError(ErrorCode.INVALID_STATE, 'Creating user not allowed')
    const existing = await this.usersRepository.findUserByEmail(data.email)
    if (existing) throw new AppError(ErrorCode.INVALID_STATE, 'Email already exists')
    const passwordHash = await hash(password)
    const created = await this.usersRepository.createUser({
      ...data,
      passwordHash,
      createdById: superAdminId,
    })
    return { user: created }
  }

  // Find all admins (super admin)
  async findAllAdmins(query: FindUsersDto) {
    if (query.role && query.role === Role.User)
      throw new AppError(ErrorCode.INVALID_STATE, 'Role is not an admin')
    return await this.usersRepository.findAllAdmins(query)
  }

  // Find all users (super admin)
  async findAllUsers(query: FindUsersDto) {
    return await this.usersRepository.findAllUsers(query)
  }

  // Find one admin
  async findOneAdmin(userId: number) {
    const admin = await this.usersRepository.findUserById(userId)
    this.ensureIsAdmin(admin)
    return { user: admin }
  }

  // Find one user (both) Dojo: Simplified
  async findOneUser(userId: number) {
    const user = await this.usersRepository.findUserById(userId)
    if (!user) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    return { user }
  }

  // Find store user for state (user)
  async findStoreUserState(storeId: number, userId: number) {
    const storeUser = await this.usersRepository.findStoreUserState(storeId, userId)
    if (!storeUser) return { storeUserState: { isDeleted: false, isBanned: false } }
    return { storeUserState: { isDeleted: storeUser.is_deleted, isBanned: storeUser.is_banned } }
  }

  // Update admin (super admin)
  async updateAdminForSuperAdmin(userId: number, { password, ...data }: UpdateUserInput) {
    const admin = await this.usersRepository.findUserById(userId)
    this.ensureIsAdmin(admin)
    if (data.email) {
      const existing = await this.usersRepository.findUserByEmail(data.email)
      if (existing) throw new AppError(ErrorCode.INVALID_STATE, 'Email already exists')
    }
    const updatedData: Partial<User> = { ...data }
    if (password) updatedData.passwordHash = await hash(password)
    await this.usersRepository.updateUser(userId, updatedData)
    const updated = await this.usersRepository.findUserById(userId)
    return { user: updated }
  }

  // Update admin (admin)
  async updateAdmin(userId: number, { password, ...data }: UpdateUserInput) {
    if (password) throw new AppError(ErrorCode.INVALID_STATE, 'Use the change password endpoint')
    const admin = await this.usersRepository.findUserById(userId)
    this.ensureIsAdmin(admin)
    if (data.email) {
      const existing = await this.usersRepository.findUserByEmail(data.email)
      if (existing) throw new AppError(ErrorCode.INVALID_STATE, 'Email already exists')
    }
    await this.usersRepository.updateUser(userId, data)
    const updated = await this.usersRepository.findUserById(userId)
    return { user: updated }
  }

  // Update user (super admin)
  async updateUserForAdmin(userId: number, { password, ...data }: UpdateUserInput) {
    const user = await this.usersRepository.findUserById(userId)
    this.ensureIsUser(user)
    if (data.email) {
      const existing = await this.usersRepository.findUserByEmail(data.email)
      if (existing) throw new AppError(ErrorCode.INVALID_STATE, 'Email already exists')
    }
    const updatedData: Partial<User> = { ...data }
    if (password) updatedData.passwordHash = await hash(password)
    await this.usersRepository.updateUser(userId, updatedData)
    const updated = await this.usersRepository.findUserById(userId)
    return { user: updated }
  }

  // Update user (user)
  @Transactional()
  async updateUserProfile(userId: number, files: { avatar?: Express.Multer.File[] }, body: any) {
    const userUpdateData = await parseAndValidateDto(UpdateUserDto, body.userUpdateData)
    const avatarFile = files?.avatar?.[0]
    const removeAvatar = body.removeAvatar === 'true'
    const user = await this.usersRepository.findUserById(userId)
    if (!user) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    let uploadedAvatarKey: string | null = null
    try {
      if (removeAvatar) {
        if (user.avatarKey) {
          await this.r2ImageService.delete(user.avatarKey)
          await this.usersRepository.updateUser(userId, {
            avatarUrl: null,
            avatarKey: null,
          })
        }
      }
      if (avatarFile) {
        const user = await this.usersRepository.findUserById(userId)
        if (!user) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
        if (user.avatarUrl !== null || user.avatarKey !== null) {
          throw new AppError(
            ErrorCode.INVALID_STATE,
            'Cannot create new avatar without deleting existing avatar',
          )
        }
        const uploaded = await this.r2ImageService.upload(avatarFile, `users/${userId}`)
        uploadedAvatarKey = uploaded.key
        await this.usersRepository.updateUser(userId, {
          avatarUrl: uploaded.url,
          avatarKey: uploaded.key,
        })
      }
      if (Object.keys(userUpdateData).length) {
        await this.usersRepository.updateUser(userId, userUpdateData)
      }
      const updated = await this.usersRepository.findUserById(userId)
      return { user: updated }
    } catch (e: any) {
      if (uploadedAvatarKey) {
        await this.r2ImageService.delete(uploadedAvatarKey)
      }
      throw e
    }
  }

  // Soft-Delete user account
  async softDeleteUser(userId: number) {
    const user = await this.usersRepository.findUserById(userId)
    if (!user) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    await this.usersRepository.updateUser(userId, {
      isDeleted: true,
      deletedById: userId,
      deletedAt: new Date(),
    })
    const updated = await this.usersRepository.findUserById(userId)
    return { user: updated }
  }

  // Update password
  async updatePassword(userId: number, { oldPassword, newPassword }: UpdatePasswordDto) {
    if (newPassword === oldPassword)
      throw new AppError(ErrorCode.INVALID_STATE, 'Cannot update to same password')
    const user = await this.usersRepository.findUserById(userId)
    if (!user) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    const isValid = await compare(oldPassword, user.passwordHash)
    if (!isValid) throw new AppError(ErrorCode.INVALID_CREDENTIALS, 'Old password is incorrect')
    const passwordHash = await hash(newPassword)
    await this.usersRepository.updateUser(userId, {
      passwordHash,
      updatedAt: new Date(),
    })
    this.emailService.sendPasswordChangeSecurityAlertEmail(user.email).catch((err) => {
      this.logger.error(err)
    })
  }

  // Revoke all admin sessions (super admin)
  async revokeAllAdminSessions(userId: number, superAdminId: number) {
    const admin = await this.usersRepository.findUserById(userId)
    this.ensureIsAdmin(admin)
    await this.authRepository.revokeAllTokensForUser(userId, TokenType.Refresh, {
      revoked: true,
      revokedById: superAdminId,
      revokedAt: new Date(),
    })
  }

  // Revoke all user sessions (super admin)
  async revokeAllUserSessions(userId: number, adminId: number) {
    const user = await this.usersRepository.findUserById(userId)
    this.ensureIsUser(user)
    await this.authRepository.revokeAllTokensForUser(userId, TokenType.Refresh, {
      revoked: true,
      revokedById: adminId,
      revokedAt: new Date(),
    })
  }

  private ensureIsAdmin(admin: User | null) {
    if (!admin) throw new AppError(ErrorCode.NOT_FOUND, 'Admin not found')
    if (admin.role === Role.User) throw new AppError(ErrorCode.INVALID_STATE, 'Not an admin')
  }

  private ensureIsUser(user: User | null) {
    if (!user) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    if (user.role !== Role.User) throw new AppError(ErrorCode.INVALID_STATE, 'Not a user')
  }
}
