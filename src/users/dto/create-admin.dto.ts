import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Role } from '../entities/user.entity'

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters long' })
  @ApiProperty({ description: 'Full name of the admin', minLength: 3, maxLength: 50 })
  name: string

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @ApiProperty({ description: 'Email address of the admin' })
  email: string

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 100, { message: 'Password must be between 8 and 100 characters long' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  @Matches(/[\W_]/, { message: 'Password must contain at least one special character' })
  @ApiProperty({
    description:
      'Password for the admin. Must include uppercase, lowercase, number, and special character.',
    minLength: 8,
    maxLength: 100,
  })
  password: string

  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(Role, { message: `Role must be one of: ${Object.values(Role).join(', ')}` })
  @ApiProperty({ description: 'Role assigned to the admin', enum: Role })
  role: Role
}
