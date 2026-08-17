import { Injectable } from '@nestjs/common'
import { Transactional } from 'typeorm-transactional'
import { StoresRepository } from './stores.repository'
import { UsersRepository } from 'src/users/users.repository'
import { R2ImageService } from 'src/storage/r2-image.service'
import { CreateStoreDto } from './dto/create-store.dto'
import { UpdateStoreDto } from './dto/update-store.dto'
import { CreateStoreAdminDto } from './dto/create-store-admin.dto'
import { FindStoreReferralsDto } from './dto/find-store-referrals.dto'
import { FindStoreUsersDto } from './dto/find-store-users.dto'
import { StoreUser } from './entities/store-user.entity'
import { StoreTiers, StoreTier } from './entities/store.entity'
import { Role } from 'src/users/entities/user.entity'
import { type CurrentStoreAdminPayload } from 'src/common/decorators/current-user.decorator'
import { StoreReferralsSortBy } from 'src/common/enums/store-referrals-sort-by.enum'
import { parseAndValidateDto } from 'src/common/utils/parse-and-validate-dto'
import { AppError, ErrorCode } from 'src/common/exceptions/app-error'

@Injectable()
export class StoresService {
  constructor(
    private readonly storesRepository: StoresRepository,
    private readonly usersRepository: UsersRepository,
    private readonly r2ImageService: R2ImageService,
  ) {}

  // Create store - start free trial (user)
  @Transactional()
  async createStore(userId: number, data: CreateStoreDto) {
    const user = await this.usersRepository.findUserById(userId)
    if (!user || user.isDeleted) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    if (user.isBanned) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Account banned')
    if (!user.isVerified)
      throw new AppError(
        ErrorCode.NOT_ENOUGH_PERMISSIONS,
        'Verify your email before creating your store',
      )
    if (user.role === Role.StoreOwner)
      throw new AppError(ErrorCode.INVALID_STATE, 'You are already a store owner')
    if (user.role !== Role.User)
      throw new AppError(ErrorCode.INVALID_STATE, 'You are already an admin of another store')
    const existing = await this.storesRepository.findStoreByUserId(userId)
    if (existing) throw new AppError(ErrorCode.INVALID_STATE, 'User already has a store')
    const now = new Date()
    const TRIAL_DAYS = 10
    const expiresAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    let referredByStoreId: number | null = null
    if (data.referralCode) {
      const referrerStore = await this.storesRepository.findStoreByReferralCode(data.referralCode)
      if (!referrerStore || referrerStore.isDeleted)
        throw new AppError(ErrorCode.NOT_FOUND, 'Invalid referral code')
      referredByStoreId = referrerStore.id
    }
    const created = await this.storesRepository.createStore({
      userId,
      ...data,
      tier: StoreTier.Starter,
      referredByStoreId,
      expiresAt,
      createdById: userId,
    })
    if (referredByStoreId !== null) {
      await this.storesRepository.createStoreReferral({
        referrerStoreId: referredByStoreId,
        referredStoreId: created.id,
      })
    }
    await this.storesRepository.updateStore(created.id, {
      referralCode: `ARJ-${created.id}`,
    })
    await this.usersRepository.updateUser(userId, { storeId: created.id, role: Role.StoreOwner })
    const updated = await this.storesRepository.findStoreById(created.id)
    return { store: updated }
  }

  // Find store analytics data (admins)
  async findStoreAnalytics({ storeId }: CurrentStoreAdminPayload) {
    return await this.storesRepository.findStoreAnalytics(storeId)
  }

  // Fine user store (both)
  async findUserStore(user: { storeId: number | null }) {
    if (user.storeId === null) return { store: null }
    const store = await this.storesRepository.findStoreById(user.storeId)
    if (!store || store.isDeleted) return { store: null }
    return { store }
  }

  // Update store (admin)
  @Transactional()
  async updateStore(
    { storeId, isStoreActive }: CurrentStoreAdminPayload,
    files: { logo?: Express.Multer.File[] },
    body: any,
  ) {
    if (!isStoreActive) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Store is inactive')
    const storeUpdateData = await parseAndValidateDto(UpdateStoreDto, body.storeUpdateData)
    const logoFile = files?.logo?.[0]
    const removeLogo = body.removeLogo === 'true'
    const storeHasOrders =
      (await this.storesRepository.findStoreOrdersForExistenceCheck(storeId)).length > 0
    if (storeUpdateData.currencySymbol && storeHasOrders) {
      throw new AppError(
        ErrorCode.INVALID_STATE,
        'Cannot change currency after store has orders. To use a different currency, create a new store.',
      )
    }
    const existing = await this.storesRepository.findStoreById(storeId)
    if (!existing) throw new AppError(ErrorCode.NOT_FOUND, 'Store not found')
    let uploadedLogoKey: string | null = null
    try {
      if (removeLogo) {
        if (existing.logoKey) {
          await this.r2ImageService.delete(existing.logoKey)
          await this.storesRepository.updateStore(storeId, {
            logoUrl: null,
            logoKey: null,
          })
        }
      }
      if (logoFile) {
        const store = await this.storesRepository.findStoreById(storeId)
        if (!store) throw new AppError(ErrorCode.NOT_FOUND, 'Store not found')
        if (store.logoUrl !== null || store.logoKey !== null)
          throw new AppError(
            ErrorCode.INVALID_STATE,
            'Cannot create new logo without deleting existing logo',
          )
        const uploaded = await this.r2ImageService.upload(logoFile, `stores/${storeId}`)
        uploadedLogoKey = uploaded.key
        await this.storesRepository.updateStore(storeId, {
          logoUrl: uploaded.url,
          logoKey: uploaded.key,
        })
      }
      if (Object.keys(storeUpdateData).length) {
        await this.storesRepository.updateStore(storeId, storeUpdateData)
      }
      const updated = await this.storesRepository.findStoreById(storeId)
      return { store: updated }
    } catch (e: any) {
      if (uploadedLogoKey) {
        await this.r2ImageService.delete(uploadedLogoKey)
      }
      throw e
    }
  }

  // Activate a store and its related records (on payment)
  @Transactional()
  async activateStoreAndRelatedData(storeId: number) {
    const store = await this.storesRepository.findStoreById(storeId)
    if (!store || store.isDeleted) throw new AppError(ErrorCode.NOT_FOUND, 'Store not found')
    await this.storesRepository.activateStoreAndRelatedData(storeId)
  }

  // Deactivate all expired stores and related records (cron)
  @Transactional()
  async deactivateAllExpiredStoresAndRelatedData() {
    const expiredStoreIds = await this.storesRepository.findExpiredStoreIds()
    if (!expiredStoreIds.length) return { deactivatedStoresCount: 0 }
    await this.storesRepository.deactivateAllExpiredStoresAndRelatedData(expiredStoreIds)
    return { deactivatedStoresCount: expiredStoreIds.length }
  }

  // Find all store referals (admin)
  async findStoreReferrals({ storeId }: CurrentStoreAdminPayload, query: FindStoreReferralsDto) {
    if (!query.sortBy) query.sortBy = StoreReferralsSortBy.TotalEarned
    return await this.storesRepository.findStoreReferrals(storeId, query)
  }

  // Find one store referral (admin)
  async findOneStoreReferral({ storeId }: CurrentStoreAdminPayload, referredStoreId: number) {
    const storeReferral = await this.storesRepository.findStoreReferral(storeId, referredStoreId)
    if (!storeReferral) throw new AppError(ErrorCode.NOT_FOUND, 'Referral not found')
    return { storeReferral }
  }

  // Create store admin (admin)
  @Transactional()
  async createStoreAdmin(
    { storeId, id: adminId }: CurrentStoreAdminPayload,
    { email }: CreateStoreAdminDto,
  ) {
    const store = await this.storesRepository.findStoreById(storeId)
    if (!store) throw new AppError(ErrorCode.NOT_FOUND, 'Store not found')
    if (!store.isActive) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Store is inactive')
    const user = await this.usersRepository.findUserByEmail(email)
    if (!user || user.isDeleted) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    if (user.isBanned) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'User is banned')
    if (!user.isVerified)
      throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'User email is not verified')
    if (user.storeId !== null || user.role !== Role.User)
      throw new AppError(ErrorCode.INVALID_STATE, 'User is already an admin of a store')
    const activeStoreAdminsCount = await this.storesRepository.countAllActiveStoreAdmins(storeId)
    if (activeStoreAdminsCount >= StoreTiers[store.tier].adminsLimit) {
      throw new AppError(
        ErrorCode.INVALID_STATE,
        `Cannot add more admins. ${store.tier} tier allows only ${StoreTiers[store.tier].adminsLimit} admins`,
      )
    }
    const existing = await this.storesRepository.findStoreUser(storeId, user.id)
    if (existing) {
      if (existing.isAdmin) throw new AppError(ErrorCode.INVALID_STATE, 'User is already an admin')
      await this.storesRepository.updateStoreUser(storeId, existing.id, {
        isAdmin: true,
        createdById: adminId,
        createdAt: new Date(),
      })
      await this.usersRepository.updateUser(user.id, { storeId, role: Role.ViewOnlyAdmin })
      const storeUser = await this.storesRepository.findStoreUserById(storeId, user.id)
      return { storeUser }
    }
    await this.storesRepository.createStoreUser({
      storeId,
      userId: user.id,
      isAdmin: true,
      createdById: adminId,
      createdAt: new Date(),
    })
    await this.usersRepository.updateUser(user.id, { storeId, role: Role.ViewOnlyAdmin })
    const storeUser = await this.storesRepository.findStoreUserById(storeId, user.id)
    return { storeUser }
  }

  // Find all store users (admin)
  async findAllStoreUsers({ storeId }: CurrentStoreAdminPayload, query: FindStoreUsersDto) {
    return await this.storesRepository.findAllStoreUsers(storeId, query)
  }

  // Find all store admins (admin)
  async findAllStoreAdmins({ storeId }: CurrentStoreAdminPayload, query: FindStoreUsersDto) {
    return await this.storesRepository.findAllStoreAdmins(storeId, query)
  }

  // Find store user (admin)
  async findStoreUserById({ storeId }: CurrentStoreAdminPayload, userId: number) {
    const storeUser = await this.storesRepository.findStoreUserById(storeId, userId)
    if (!storeUser) throw new AppError(ErrorCode.NOT_FOUND, 'Store user not found')
    return { storeUser }
  }

  // Find store admin (admin)
  async findStoreAdminById({ storeId }: CurrentStoreAdminPayload, userId: number) {
    const storeAdmin = await this.storesRepository.findStoreAdminById(storeId, userId)
    if (!storeAdmin) throw new AppError(ErrorCode.NOT_FOUND, 'Store admin not found')
    return { storeUser: storeAdmin }
  }

  // Find store user or admin (admin)
  async findStoreUser({ storeId }: CurrentStoreAdminPayload, userId: number) {
    const storeUser = await this.storesRepository.findStoreUser(storeId, userId)
    if (!storeUser) throw new AppError(ErrorCode.NOT_FOUND, 'Store user/admin not found')
    return { storeUser }
  }

  // update store user (admin)
  async updateStoreUser(
    { storeId, id: adminId, isStoreActive }: CurrentStoreAdminPayload,
    userId: number,
    data: Partial<StoreUser>,
  ) {
    if (!isStoreActive) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Store is inactive')
    const existing = await this.storesRepository.findStoreUserById(storeId, userId)
    if (!existing) throw new AppError(ErrorCode.NOT_FOUND, 'Store user not found')
    if (userId === adminId)
      throw new AppError(ErrorCode.INVALID_STATE, 'Cannot ban or delete yourself')
    const user = await this.usersRepository.findUserById(userId)
    if (!user || user.isDeleted) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    if (user.storeId === storeId && user.role === Role.StoreOwner)
      throw new AppError(ErrorCode.INVALID_STATE, 'Cannot ban or delete your store owner')
    await this.storesRepository.updateStoreUser(storeId, existing.id, data)
    const updated = await this.storesRepository.findStoreUserById(storeId, userId)
    return { storeUser: updated }
  }

  // update store admin (admin)
  async updateStoreAdmin(
    { storeId, isStoreActive }: CurrentStoreAdminPayload,
    userId: number,
    data: Partial<StoreUser>,
  ) {
    if (!isStoreActive) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Store is inactive')
    const existing = await this.storesRepository.findStoreAdminById(storeId, userId)
    if (!existing) throw new AppError(ErrorCode.NOT_FOUND, 'Store admin not found')
    await this.storesRepository.updateStoreAdmin(storeId, existing.id, data)
    const updated = await this.storesRepository.findStoreAdminById(storeId, userId)
    return { storeUser: updated }
  }

  // update store admin role (admin)
  async updateStoreAdminRole(
    { storeId, id: adminId, isStoreActive }: CurrentStoreAdminPayload,
    userId: number,
    role: Role,
  ) {
    if (!isStoreActive) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Store is inactive')
    const existing = await this.storesRepository.findStoreAdminById(storeId, userId)
    if (!existing) throw new AppError(ErrorCode.NOT_FOUND, 'Store admin not found')
    const NOT_ALLOWED_ROLES = [Role.User, Role.SuperAdmin, Role.StoreOwner]
    if (NOT_ALLOWED_ROLES.includes(role))
      throw new AppError(
        ErrorCode.INVALID_STATE,
        'Updating role to user or super admin, or store owner is not allowed',
      )
    await this.usersRepository.updateUser(userId, {
      role,
      updatedById: adminId,
      updatedAt: new Date(),
    })
    const updated = await this.storesRepository.findStoreAdminById(storeId, userId)
    return { storeUser: updated }
  }

  // Restore soft-deleted store admin (admin)
  @Transactional()
  async restoreStoreAdmin({ storeId, id: adminId }: CurrentStoreAdminPayload, userId: number) {
    const store = await this.storesRepository.findStoreById(storeId)
    if (!store) throw new AppError(ErrorCode.NOT_FOUND, 'Store not found')
    if (!store.isActive) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Store is inactive')
    const user = await this.usersRepository.findUserById(userId)
    if (!user || user.isDeleted) throw new AppError(ErrorCode.NOT_FOUND, 'User not found')
    if (user.isBanned) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'User is banned')
    if (user.storeId !== null || user.role !== Role.User)
      throw new AppError(ErrorCode.INVALID_STATE, 'User is already an admin of a store')
    const activeStoreAdminsCount = await this.storesRepository.countAllActiveStoreAdmins(storeId)
    if (activeStoreAdminsCount >= StoreTiers[store.tier].adminsLimit) {
      throw new AppError(
        ErrorCode.INVALID_STATE,
        `Cannot restore more admins. ${store.tier} tier allows only ${StoreTiers[store.tier].adminsLimit} admins`,
      )
    }
    const existing = await this.storesRepository.findStoreAdminById(storeId, userId)
    if (!existing) throw new AppError(ErrorCode.NOT_FOUND, 'Store admin not found')
    await this.storesRepository.updateStoreAdmin(storeId, existing.id, {
      isBanned: false,
      isDeleted: false,
      restoredById: adminId,
      restoredAt: new Date(),
    })
    await this.usersRepository.updateUser(userId, { storeId, role: Role.ViewOnlyAdmin })
    const storeUser = await this.storesRepository.findStoreUserById(storeId, userId)
    return { storeUser }
  }

  // Ban store admin (admin)
  @Transactional()
  async banStoreAdmin({ storeId, id: adminId }: CurrentStoreAdminPayload, userId: number) {
    const existing = await this.storesRepository.findStoreAdminById(storeId, userId)
    if (!existing) throw new AppError(ErrorCode.NOT_FOUND, 'Store admin not found')
    await this.storesRepository.updateStoreAdmin(storeId, existing.id, {
      isBanned: true,
      bannedById: adminId,
      bannedAt: new Date(),
    })
    await this.usersRepository.updateUser(userId, { storeId: null, role: Role.User })
    const storeUser = await this.storesRepository.findStoreUserById(storeId, userId)
    return { storeUser }
  }

  // Soft-delete store admin (admin)
  @Transactional()
  async deleteStoreAdmin({ storeId, id: adminId }: CurrentStoreAdminPayload, userId: number) {
    const existing = await this.storesRepository.findStoreAdminById(storeId, userId)
    if (!existing) throw new AppError(ErrorCode.NOT_FOUND, 'Store admin not found')
    await this.storesRepository.updateStoreAdmin(storeId, existing.id, {
      isDeleted: true,
      deletedById: adminId,
      deletedAt: new Date(),
    })
    await this.usersRepository.updateUser(userId, { storeId: null, role: Role.User })
  }

  // Soft-delete extra store admins (system)
  @Transactional()
  async deleteExtraStoreAdmins(storeId: number) {
    const store = await this.storesRepository.findStoreById(storeId)
    if (!store) throw new AppError(ErrorCode.NOT_FOUND, 'Store not found')
    const adminsLimit = StoreTiers[store.tier].adminsLimit
    const storeAdmins = await this.storesRepository.findAllActiveStoreAdminsForExtraRemoval(storeId)
    if (!storeAdmins.length) return { deletedStoreAdminsCount: 0 }
    const extraAdminIds = storeAdmins.slice(adminsLimit).map((admin) => admin.userId)
    if (!extraAdminIds.length) return { deletedStoreAdminsCount: 0 }
    await this.storesRepository.softDeleteExtraStoreAdmins(storeId, extraAdminIds)
    return { deletedStoreAdminsCount: extraAdminIds.length }
  }
}
