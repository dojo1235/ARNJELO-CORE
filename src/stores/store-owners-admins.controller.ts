import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator'
import { Auth } from 'src/common/decorators/auth.decorator'
import {
  CurrentStoreAdmin,
  type CurrentStoreAdminPayload,
} from 'src/common/decorators/current-user.decorator'
import { Role } from 'src/users/entities/user.entity'
import { StoresService } from './stores.service'
import { CreateStoreAdminDto } from './dto/create-store-admin.dto'
import { UpdateUserRoleDto } from 'src/users/dto/update-user-role.dto'
import { FindStoreUsersDto } from './dto/find-store-users.dto'
import { StoreUsersListResponseDto } from './dto/store-users-list-response.dto'
import { StoreUserResponseDto } from './dto/store-user-response.dto'
import { UserIdParamDto } from 'src/common/dto/user-id-param.dto'

@Auth(Role.StoreOwner)
@Controller('store-owners/admins')
export class StoreOwnersAdminsController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @ApiOperation({ summary: 'Create store admin' })
  @ApiSuccessResponse({
    description: 'Store admin created successfully',
    type: StoreUserResponseDto,
    status: HttpStatus.CREATED,
  })
  async createStoreAdmin(
    @Body() createStoreAdminDto: CreateStoreAdminDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreUserResponseDto> {
    return await this.storesService.createStoreAdmin(user, createStoreAdminDto)
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all store admins' })
  @ApiSuccessResponse({
    description: 'Store admins fetched successfully',
    type: StoreUsersListResponseDto,
  })
  async findAllStoreAdmins(
    @Query() query: FindStoreUsersDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreUsersListResponseDto> {
    return await this.storesService.findAllStoreAdmins(user, query)
  }

  //@Get('admins/:userId')
  @Get(':userId')
  @ApiOperation({ summary: 'Fetch a single store admin' })
  @ApiSuccessResponse({
    description: 'Store admin fetched successfully',
    type: StoreUserResponseDto,
  })
  async findStoreAdminById(
    @Param() { userId }: UserIdParamDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreUserResponseDto> {
    return await this.storesService.findStoreAdminById(user, userId)
  }

  @Patch(':userId/role')
  @ApiOperation({ summary: 'Update store admin role' })
  @ApiSuccessResponse({
    description: 'Store admin role updated successfully',
    type: StoreUserResponseDto,
  })
  async updateStoreAdminRole(
    @Param() { userId }: UserIdParamDto,
    @Body() { role }: UpdateUserRoleDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreUserResponseDto> {
    return await this.storesService.updateStoreAdminRole(user, userId, role)
  }

  @Patch(':userId/ban')
  @ApiOperation({ summary: 'Ban store admin' })
  @ApiSuccessResponse({
    description: 'Store admin banned successfully',
    type: StoreUserResponseDto,
  })
  async banStoreAdmin(
    @Param() { userId }: UserIdParamDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreUserResponseDto> {
    return await this.storesService.banStoreAdmin(user, userId)
  }

  @Patch(':userId/restore')
  @ApiOperation({ summary: 'Restore store admin' })
  @ApiSuccessResponse({
    description: 'Store admin restored successfully',
    type: StoreUserResponseDto,
  })
  async restoreStoreAdmin(
    @Param() { userId }: UserIdParamDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreUserResponseDto> {
    return await this.storesService.restoreStoreAdmin(user, userId)
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Soft-delete store admin' })
  @ApiSuccessResponse({ description: 'Store admin deleted successfully' })
  async deleteStoreAdmin(
    @Param() { userId }: UserIdParamDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<void> {
    await this.storesService.deleteStoreAdmin(user, userId)
  }
}
