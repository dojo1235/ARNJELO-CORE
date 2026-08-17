import { IsEnum, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { QueryBoolean } from 'src/common/decorators/query-boolean.decorator'
import { Role } from '../entities/user.entity'
import { SortOrder } from 'src/common/enums/sort-order.enum'

export class FindUsersDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search term for user name' })
  search?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Filter by email address' })
  email?: string

  @IsOptional()
  @IsEnum(Role)
  @ApiPropertyOptional({ description: 'Filter by role', enum: Role })
  role?: Role

  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Filter by banned status (true or false)' })
  isBanned?: boolean

  @IsOptional()
  @QueryBoolean()
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Filter by deleted status (true or false)' })
  isDeleted?: boolean

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiPropertyOptional({ description: 'Page number for pagination' })
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @ApiPropertyOptional({ description: 'Page size for pagination' })
  limit?: number

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder })
  orderBy?: SortOrder
}
