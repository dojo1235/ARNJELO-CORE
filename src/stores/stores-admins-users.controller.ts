import { Controller, Get, Patch, Delete, Param, Query } from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator'
import { Auth } from 'src/common/decorators/auth.decorator'
import {
  CurrentStoreAdmin,
  type CurrentStoreAdminPayload,
} from 'src/common/decorators/current-user.decorator'
import { Role } from 'src/users/entities/user.entity'
import { StoresService } from './stores.service'
import { FindStoreUsersDto } from './dto/find-store-users.dto'
import { StoreUsersListResponseDto } from './dto/store-users-list-response.dto'
import { StoreUserResponseDto } from './dto/store-user-response.dto'
import { UserIdParamDto } from 'src/common/dto/user-id-param.dto'

@Auth(Role.UserManager)
@Controller('stores/admins')
export class StoresAdminsUsersController {
  constructor(private readonly storesService: StoresService) {}

  @Get('users')
  @Auth(Role.ViewOnlyAdmin)
  @ApiOperation({ summary: 'Fetch all store users' })
  @ApiSuccessResponse({
    description: 'Store users fetched successfully',
    type: StoreUsersListResponseDto,
  })
  async findAllStoreUsers(
    @Query() query: FindStoreUsersDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreUsersListResponseDto> {
    return await this.storesService.findAllStoreUsers(user, query)
  }

  @Get('users/:userId')
  @Auth(Role.ViewOnlyAdmin)
  @ApiOperation({ summary: 'Fetch a single store user' })
  @ApiSuccessResponse({
    description: 'Store user fetched successfully',
    type: StoreUserResponseDto,
  })
  async findStoreUserById(
    @Param() { userId }: UserIdParamDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreUserResponseDto> {
    return await this.storesService.findStoreUserById(user, userId)
  }

  @Get('users/:userId/profile')
  @Auth(Role.ViewOnlyAdmin)
  @ApiOperation({ summary: 'Fetch a single store user/admin profile details' })
  @ApiSuccessResponse({
    description: 'Store user fetched successfully',
    type: StoreUserResponseDto,
  })
  async findStoreUser(
    @Param() { userId }: UserIdParamDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreUserResponseDto> {
    return await this.storesService.findStoreUser(user, userId)
  }

  @Patch('users/:userId/ban')
  @ApiOperation({ summary: 'Ban store user' })
  @ApiSuccessResponse({
    description: 'Store user banned successfully',
    type: StoreUserResponseDto,
  })
  async banStoreUser(
    @Param() { userId }: UserIdParamDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreUserResponseDto> {
    return await this.storesService.updateStoreUser(user, userId, {
      isBanned: true,
      bannedById: user.id,
      bannedAt: new Date(),
    })
  }

  @Patch('users/:userId/restore')
  @ApiOperation({ summary: 'Restore store user' })
  @ApiSuccessResponse({
    description: 'Store user restored successfully',
    type: StoreUserResponseDto,
  })
  async restoreStoreUser(
    @Param() { userId }: UserIdParamDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreUserResponseDto> {
    return await this.storesService.updateStoreUser(user, userId, {
      isBanned: false,
      isDeleted: false,
      restoredById: user.id,
      restoredAt: new Date(),
    })
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: 'Soft-delete store user' })
  @ApiSuccessResponse({
    description: 'Store user deleted successfully',
    type: StoreUserResponseDto,
  })
  async deleteStoreUser(
    @Param() { userId }: UserIdParamDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreUserResponseDto> {
    return await this.storesService.updateStoreUser(user, userId, {
      isDeleted: true,
      deletedById: user.id,
      deletedAt: new Date(),
    })
  }
}
