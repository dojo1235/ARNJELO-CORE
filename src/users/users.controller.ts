import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator'
import { Auth } from 'src/common/decorators/auth.decorator'
import { CurrentUser, type CurrentUserPayload } from 'src/common/decorators/current-user.decorator'
import { UsersService } from './users.service'
import { UpdateUserFormDto } from './dto/update-user.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'
import { UserResponseDto } from './dto/user-response.dto'
import { StoreUserStateResponseDto } from './dto/store-user-state-response.dto'
import { StoreIdParamDto } from 'src/common/dto/store-id-param.dto'
import { imageUploadOptions } from 'src/common/upload/image-upload.options'

@Auth()
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users/me')
  @ApiOperation({ summary: 'Fetch user profile' })
  @ApiSuccessResponse({ description: 'Profile fetched successfully', type: UserResponseDto })
  async findUserProfile(@CurrentUser() user: CurrentUserPayload): Promise<UserResponseDto> {
    return await this.usersService.findOneUser(user.id)
  }

  @Get('stores/:storeId/users/state')
  @ApiOperation({ summary: 'Fetch store user state' })
  @ApiSuccessResponse({
    description: 'Store user state fetched successfully',
    type: StoreUserStateResponseDto,
  })
  async findStoreUserState(
    @Param() { storeId }: StoreIdParamDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<StoreUserStateResponseDto> {
    return await this.usersService.findStoreUserState(storeId, user.id)
  }

  @Patch('users/me')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }], imageUploadOptions))
  @ApiOperation({ summary: 'Update user profile' })
  @ApiSuccessResponse({ description: 'Profile updated successfully', type: UserResponseDto })
  async updateUserProfile(
    @UploadedFiles() files: { avatar?: Express.Multer.File[] },
    @Body() body: UpdateUserFormDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<UserResponseDto> {
    return await this.usersService.updateUserProfile(user.id, files, body)
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @Patch('users/me/password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiSuccessResponse({ description: 'Password updated successfully' })
  async updatePassword(
    @Body() dto: UpdatePasswordDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.usersService.updatePassword(user.id, dto)
  }

  @Delete('users/me')
  @ApiOperation({ summary: 'Soft-delete user account' })
  @ApiSuccessResponse({ description: 'Account deleted successfully', type: UserResponseDto })
  async deleteUser(@CurrentUser() user: CurrentUserPayload): Promise<UserResponseDto> {
    return await this.usersService.softDeleteUser(user.id)
  }
}
