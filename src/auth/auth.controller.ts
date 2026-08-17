import { Controller, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ApiOperation } from '@nestjs/swagger'
import { ApiSuccessResponse } from 'src/common/decorators/api-success-response.decorator'
import { Auth } from 'src/common/decorators/auth.decorator'
import { CurrentUser, type CurrentUserPayload } from 'src/common/decorators/current-user.decorator'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { ChangeEmailDto } from './dto/change-email.dto'
import { AuthResponseDto } from './dto/auth-response.dto'
import { TokensResponseDto } from './dto/tokens-response.dto'
import { EmailDto } from './dto/email.dto'
import { TokenQueryDto } from './dto/token-query.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  @ApiSuccessResponse({
    description: 'Registration successful',
    type: AuthResponseDto,
    status: HttpStatus.CREATED,
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return await this.authService.register(registerDto)
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiSuccessResponse({ description: 'Login successful', type: AuthResponseDto })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto)
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiSuccessResponse({ description: 'Token refreshed successfully', type: TokensResponseDto })
  async refresh(@Body() { refreshToken }: RefreshTokenDto): Promise<TokensResponseDto> {
    return await this.authService.refreshToken(refreshToken)
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiSuccessResponse({ description: 'Logout successful' })
  async logout(@Body() { refreshToken }: RefreshTokenDto): Promise<void> {
    await this.authService.logout(refreshToken)
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('logout-all')
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiSuccessResponse({ description: 'Logout from all devices' })
  async logoutAll(@Body() { refreshToken }: RefreshTokenDto): Promise<void> {
    await this.authService.logoutAll(refreshToken)
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @Post('verify-email/request')
  @ApiOperation({ summary: 'Send email verification email' })
  @ApiSuccessResponse({ description: 'If the account exists, email has been sent' })
  async sendVerifyEmail(@Body() { email }: EmailDto): Promise<void> {
    await this.authService.sendEmailVerification(email)
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email' })
  @ApiSuccessResponse({ description: 'Email verified successfully' })
  async verifyEmail(@Query() { token }: TokenQueryDto): Promise<void> {
    await this.authService.verifyEmail(token)
  }

  @Auth()
  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('email-change/request')
  @ApiOperation({ summary: 'Request email change' })
  @ApiSuccessResponse({ description: 'Verification email has been sent to your new email' })
  async requestEmailChange(
    @Body() changeEmailDto: ChangeEmailDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.authService.requestEmailChange(user.id, changeEmailDto)
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('email-change/verify')
  @ApiOperation({ summary: 'Verify and update email' })
  @ApiSuccessResponse({ description: 'Email updated successfully' })
  async verifyEmailChange(@Query() { token }: TokenQueryDto): Promise<void> {
    await this.authService.verifyAndChangeEmail(token)
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('magic-login/request')
  @ApiOperation({ summary: 'Send magic login email' })
  @ApiSuccessResponse({ description: 'If the account exists, email has been sent' })
  async sendMagicLoginEmail(@Body() { email }: EmailDto): Promise<void> {
    await this.authService.sendMagicLoginEmail(email)
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('magic-login')
  @ApiOperation({ summary: 'Magic login' })
  @ApiSuccessResponse({ description: 'Magic login successful', type: AuthResponseDto })
  async magicLogin(@Query() { token }: TokenQueryDto): Promise<AuthResponseDto> {
    return await this.authService.magicLogin(token)
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('password-reset/request')
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiSuccessResponse({ description: 'If the account exists, email has been sent' })
  async sendPasswordResetEmail(@Body() { email }: EmailDto): Promise<void> {
    await this.authService.sendPasswordResetEmail(email)
  }

  @Throttle({ short: { ttl: 60000, limit: 10 } })
  @HttpCode(HttpStatus.OK)
  @Post('password-reset')
  @ApiOperation({ summary: 'Reset password' })
  @ApiSuccessResponse({ description: 'Password reset successful' })
  async resetPassword(
    @Query() { token }: TokenQueryDto,
    @Body() { password }: ResetPasswordDto,
  ): Promise<void> {
    await this.authService.resetPassword(token, password)
  }
}
