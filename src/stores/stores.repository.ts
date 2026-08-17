import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, FindOptionsWhere, LessThan } from 'typeorm'
import { Store } from './entities/store.entity'
import { StoreReferral } from './entities/store-referral.entity'
import { StoreUser } from './entities/store-user.entity'
import { FindStoreReferralsDto } from './dto/find-store-referrals.dto'
import { FindStoreUsersDto } from './dto/find-store-users.dto'
import { paginate } from 'src/common/utils/pagination.util'

@Injectable()
export class StoresRepository {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreReferral)
    private readonly storeReferralRepository: Repository<StoreReferral>,
    @InjectRepository(StoreUser)
    private readonly storeUserRepository: Repository<StoreUser>,
  ) {}

  async createStore(data: Partial<Store>) {
    const entity = this.storeRepository.create(data)
    return await this.storeRepository.save(entity)
  }

  async findStoreAnalytics(storeId: number) {
    const result = await this.storeRepository.query(
      `
      SELECT
        (
          SELECT COALESCE(SUM(s.total_revenue), 0)
          FROM stores s
          WHERE s.id = ?
        ) AS totalRevenue,

        (
          SELECT COUNT(*)
          FROM orders o
          WHERE o.store_id = ? AND o.status = 'pending'
        ) AS pendingOrders,

        (
          SELECT COUNT(*)
          FROM store_users su
          WHERE su.store_id = ? AND su.is_admin = false AND su.is_banned = false AND su.is_deleted = false
        ) AS activeUsers,

        (
          SELECT COUNT(*)
          FROM products p
          WHERE p.store_id = ? AND p.is_deleted = FALSE AND p.is_store_active = true
        ) AS activeProducts,

        (
          SELECT COUNT(*)
          FROM store_users su
          WHERE su.store_id = ? AND su.is_admin = true AND su.is_banned = false AND su.is_deleted = false
        ) AS activeAdmins
      `,
      [storeId, storeId, storeId, storeId, storeId],
    )
    return result[0]
  }

  async findStoreById(storeId: number) {
    return await this.storeRepository.findOne({ where: { id: storeId } })
  }

  async findStoreByUserId(userId: number) {
    return await this.storeRepository.findOne({ where: { userId } })
  }

  async findStoreByUserIdWithLock(userId: number) {
    return await this.storeRepository.findOne({
      where: { userId },
      lock: { mode: 'pessimistic_write' },
    })
  }

  async findStoreByReferralCode(referralCode: string) {
    return await this.storeRepository.findOne({ where: { referralCode } })
  }

  async findStoreConfig(storeId: number) {
    return await this.storeRepository.findOne({
      where: { id: storeId },
      select: ['name', 'currencySymbol', 'logoUrl'],
    })
  }

  async findExpiredStoreIds() {
    const stores = await this.storeRepository.find({
      where: { isActive: true, expiresAt: LessThan(new Date()) },
      select: ['id'],
    })
    return stores.map((s) => s.id)
  }

  async findStoreOrdersForExistenceCheck(storeId: number) {
    return await this.storeRepository.query(`SELECT 1 FROM orders WHERE store_id = ? LIMIT 1`, [
      storeId,
    ])
  }

  async updateStore(storeId: number, data: Partial<Store>) {
    return await this.storeRepository.update({ id: storeId }, data)
  }

  async increaseStoreRevenue(storeId: number, amount: number) {
    await this.storeRepository.update(
      { id: storeId },
      {
        totalRevenue: () => `totalRevenue + ${amount}`,
      },
    )
  }

  async decreaseStoreRevenue(storeId: number, amount: number) {
    await this.storeRepository.update(
      { id: storeId },
      {
        totalRevenue: () => `totalRevenue - ${amount}`,
      },
    )
  }

  async increaseStoreReferralEarning(storeId: number, amount: number) {
    await this.storeRepository.update(
      { id: storeId },
      {
        claimedReferralEarning: () => `claimedReferralEarning + ${amount}`,
      },
    )
  }

  async decreaseStoreReferralEarning(storeId: number, amount: number) {
    await this.storeRepository.update(
      { id: storeId },
      {
        claimedReferralEarning: () => `claimedReferralEarning - ${amount}`,
      },
    )
  }

  async activateStoreAndRelatedData(storeId: number) {
    await this.storeRepository.query(`UPDATE stores SET is_active = true WHERE id = ?`, [storeId])
    await this.storeRepository.query(
      `UPDATE products SET is_store_active = true WHERE store_id = ?`,
      [storeId],
    )
    await this.storeRepository.query(`UPDATE carts SET is_store_active = true WHERE store_id = ?`, [
      storeId,
    ])
    await this.storeRepository.query(
      `UPDATE \`orders\` SET is_store_active = true WHERE store_id = ?`,
      [storeId],
    )
    await this.storeRepository.query(
      `UPDATE order_items SET is_store_active = true WHERE store_id = ?`,
      [storeId],
    )
    await this.storeRepository.query(
      `UPDATE reviews SET is_store_active = true WHERE store_id = ?`,
      [storeId],
    )
    await this.storeRepository.query(
      `UPDATE wishlists SET is_store_active = true WHERE store_id = ?`,
      [storeId],
    )
  }

  async deactivateAllExpiredStoresAndRelatedData(expiredStoreIds: number[]) {
    await this.storeRepository.query(`UPDATE stores SET is_active = false WHERE id IN (?)`, [
      expiredStoreIds,
    ])
    await this.storeRepository.query(
      `UPDATE products SET is_store_active = false WHERE store_id IN (?)`,
      [expiredStoreIds],
    )
    await this.storeRepository.query(
      `UPDATE carts SET is_store_active = false WHERE store_id IN (?)`,
      [expiredStoreIds],
    )
    await this.storeRepository.query(
      `UPDATE \`orders\` SET is_store_active = false WHERE store_id IN (?)`,
      [expiredStoreIds],
    )
    await this.storeRepository.query(
      `UPDATE order_items SET is_store_active = false WHERE store_id IN (?)`,
      [expiredStoreIds],
    )
    await this.storeRepository.query(
      `UPDATE reviews SET is_store_active = false WHERE store_id IN (?)`,
      [expiredStoreIds],
    )
    await this.storeRepository.query(
      `UPDATE wishlists SET is_store_active = false WHERE store_id IN (?)`,
      [expiredStoreIds],
    )
  }

  async createStoreReferral(data: Partial<StoreReferral>) {
    const entity = this.storeReferralRepository.create(data)
    return await this.storeReferralRepository.save(entity)
  }

  async findStoreReferrals(storeId: number, query: FindStoreReferralsDto) {
    const where: FindOptionsWhere<StoreReferral> = { referrerStoreId: storeId }
    const relations = ['referredStore']
    const result = await paginate(this.storeReferralRepository, query, { where, relations })
    return { storeReferrals: result.items, meta: result.meta }
  }

  async storeHasReferrals(storeId: number) {
    return await this.storeReferralRepository.exist({
      where: { referrerStoreId: storeId },
    })
  }

  async findStoreReferral(referrerStoreId: number, referredStoreId: number) {
    return await this.storeReferralRepository.findOne({
      where: { referrerStoreId, referredStoreId },
      relations: ['referredStore'],
    })
  }

  async increaseStoreReferralTotalEarned(
    referrerStoreId: number,
    referredStoreId: number,
    amount: number,
  ) {
    await this.storeReferralRepository.update(
      { referrerStoreId, referredStoreId },
      {
        totalEarned: () => `totalEarned + ${amount}`,
      },
    )
  }

  async createStoreUser(data: Partial<StoreUser>) {
    const entity = this.storeUserRepository.create(data)
    return await this.storeUserRepository.save(entity)
  }

  async findAllStoreUsers(storeId: number, query: FindStoreUsersDto) {
    const where: FindOptionsWhere<StoreUser> = { storeId, isAdmin: false }
    if ('isDeleted' in query) where.isDeleted = query.isDeleted
    if ('isBanned' in query) where.isBanned = query.isBanned
    const relations = ['user']
    const result = await paginate(this.storeUserRepository, query, { where, relations })
    return { storeUsers: result.items, meta: result.meta }
  }

  async findAllStoreAdmins(storeId: number, query: FindStoreUsersDto) {
    const where: FindOptionsWhere<StoreUser> = { storeId, isAdmin: true }
    if ('isDeleted' in query) where.isDeleted = query.isDeleted
    if ('isBanned' in query) where.isBanned = query.isBanned
    const relations = ['user']
    const result = await paginate(this.storeUserRepository, query, { where, relations })
    return { storeUsers: result.items, meta: result.meta }
  }

  async findAllActiveStoreAdminsForExtraRemoval(storeId: number) {
    return await this.storeUserRepository.find({
      where: { storeId, isAdmin: true, isDeleted: false },
      order: { createdAt: 'ASC' },
    })
  }

  async countAllActiveStoreAdmins(storeId: number) {
    return await this.storeUserRepository.count({
      where: { storeId, isAdmin: true, isDeleted: false, isBanned: false },
    })
  }

  async findStoreUserById(storeId: number, userId: number) {
    return await this.storeUserRepository.findOne({
      where: { storeId, userId, isAdmin: false },
      relations: ['user'],
    })
  }

  async findStoreAdminById(storeId: number, userId: number) {
    return await this.storeUserRepository.findOne({
      where: { storeId, userId, isAdmin: true },
      relations: ['user'],
    })
  }

  async findStoreUser(storeId: number, userId: number) {
    return await this.storeUserRepository.findOne({
      where: { storeId, userId },
      relations: ['user'],
    })
  }

  async updateStoreUser(storeId: number, storeUserId: number, data: Partial<StoreUser>) {
    return await this.storeUserRepository.update({ id: storeUserId, storeId, isAdmin: false }, data)
  }

  async updateStoreAdmin(storeId: number, storeUserId: number, data: Partial<StoreUser>) {
    return await this.storeUserRepository.update({ id: storeUserId, storeId, isAdmin: true }, data)
  }

  async increaseStoreUserTotalSpent(storeId: number, storeUserId: number, amount: number) {
    await this.storeUserRepository.update(
      { id: storeUserId, storeId },
      {
        totalSpent: () => `totalSpent + ${amount}`,
      },
    )
  }

  async decreaseStoreUserTotalSpent(storeId: number, storeUserId: number, amount: number) {
    await this.storeUserRepository.update(
      { id: storeUserId, storeId },
      {
        totalSpent: () => `totalSpent - ${amount}`,
      },
    )
  }

  async softDeleteExtraStoreAdmins(storeId: number, adminIds: number[]) {
    await this.storeUserRepository.query(
      `UPDATE store_users 
      SET is_deleted = true, deleted_by_id = NULL, deleted_at = NOW() 
      WHERE store_id = ? AND user_id IN (?)`,
      [storeId, adminIds],
    )
    await this.storeUserRepository.query(
      `UPDATE users 
      SET role = 'User', store_id = NULL 
      WHERE id IN (?) AND store_id = ?`,
      [adminIds, storeId],
    )
  }
}
