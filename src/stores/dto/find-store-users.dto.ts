import { IsOptional, IsInt, Min, IsBoolean, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { QueryBoolean } from 'src/common/decorators/query-boolean.decorator'
import { SortOrder } from 'src/common/enums/sort-order.enum'
import { StoreUsersSortBy } from 'src/common/enums/store-users-sort-by.enum'

export class FindStoreUsersDto {
  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Include banned store users' })
  isBanned?: boolean

  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Include deleted store users' })
  isDeleted?: boolean

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Page number for pagination' })
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ description: 'Page size for pagination' })
  limit?: number

  @IsOptional()
  @IsEnum(StoreUsersSortBy)
  @ApiPropertyOptional({ description: 'Sort by field', enum: StoreUsersSortBy })
  sortBy?: StoreUsersSortBy

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder })
  orderBy?: SortOrder
}
