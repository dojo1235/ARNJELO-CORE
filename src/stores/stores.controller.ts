import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  HttpStatus,
} from '@nestjs/common'
import { ApiConsumes, ApiOperation } from '@nestjs/swagger'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator'
import { Auth } from 'src/common/decorators/auth.decorator'
import {
  CurrentUser,
  CurrentStoreAdmin,
  type CurrentUserPayload,
  type CurrentStoreAdminPayload,
} from 'src/common/decorators/current-user.decorator'
import { Role } from 'src/users/entities/user.entity'
import { StoresService } from './stores.service'
import { CreateStoreDto } from './dto/create-store.dto'
import { FindStoreReferralsDto } from './dto/find-store-referrals.dto'
import { StoreAnalyticsResponseDto } from './dto/store-analytics-response.dto'
import { StoreResponseDto } from './dto/store-response.dto'
import { UpdateStoreFormDto } from './dto/update-store.dto'
import { StoreReferralsListResponseDto } from './dto/store-referrals-list-response.dto'
import { StoreReferralResponseDto } from './dto/store-referral-response.dto'
import { ReferralStoreIdParamDto } from '../common/dto/referral-store-id-param.dto'
import { imageUploadOptions } from '../common/upload/image-upload.options'

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post('start-trial')
  @Auth()
  @ApiOperation({ summary: 'Create store, 10 days full access trial' })
  @ApiSuccessResponse({
    description: 'Store created successfully',
    type: StoreResponseDto,
    status: HttpStatus.CREATED,
  })
  async createStore(
    @Body() createStoreDto: CreateStoreDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<StoreResponseDto> {
    return await this.storesService.createStore(user.id, createStoreDto)
  }

  @Get('admins/analytics/overview')
  @Auth(Role.ViewOnlyAdmin)
  @ApiOperation({ summary: 'Fetch current store admin analytics data' })
  @ApiSuccessResponse({
    description: 'Store analytics fetched successfully',
    type: StoreAnalyticsResponseDto,
  })
  async findStoreAnalytics(
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreAnalyticsResponseDto> {
    return await this.storesService.findStoreAnalytics(user)
  }

  @Get('admins/referrals')
  @Auth(Role.StoreOwner)
  @ApiOperation({ summary: 'Get store referrals' })
  @ApiSuccessResponse({
    description: 'Referrals fetched successfully',
    type: StoreReferralsListResponseDto,
  })
  async findStoreReferrals(
    @Query() query: FindStoreReferralsDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreReferralsListResponseDto> {
    return await this.storesService.findStoreReferrals(user, query)
  }

  @Get('admins/referrals/:referredStoreId')
  @Auth(Role.StoreOwner)
  @ApiOperation({ summary: 'Get single store referral by ID' })
  @ApiSuccessResponse({
    description: 'Referral fetched successfully',
    type: StoreReferralResponseDto,
  })
  async findOneStoreReferral(
    @Param() { referredStoreId }: ReferralStoreIdParamDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreReferralResponseDto> {
    return await this.storesService.findOneStoreReferral(user, referredStoreId)
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Fetch current user store' })
  @ApiSuccessResponse({
    description: 'Store fetched successfully',
    type: StoreResponseDto,
  })
  async findStore(@CurrentUser() user: CurrentUserPayload): Promise<StoreResponseDto> {
    return await this.storesService.findUserStore(user)
  }

  @Patch('me')
  @Auth(Role.StoreOwner)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }], imageUploadOptions))
  @ApiOperation({ summary: 'Update current admin store details' })
  @ApiSuccessResponse({
    description: 'Store updated successfully',
    type: StoreResponseDto,
  })
  async updateStore(
    @UploadedFiles() files: { logo?: Express.Multer.File[] },
    @Body() body: UpdateStoreFormDto,
    @CurrentStoreAdmin() user: CurrentStoreAdminPayload,
  ): Promise<StoreResponseDto> {
    return await this.storesService.updateStore(user, files, body)
  }
}
