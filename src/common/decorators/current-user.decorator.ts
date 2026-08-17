import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AppError, ErrorCode } from 'src/common/exceptions/app-error'

export type CurrentUserPayload = {
  id: number
  storeId: number | null
  isStoreActive: boolean
  isBannedFromStore: boolean
  role: string
}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest()

  return req.user
})

export type CurrentStoreAdminPayload = {
  id: number
  storeId: number
  isStoreActive: boolean
  isBannedFromStore: boolean
  role: string
}

export const CurrentStoreAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentStoreAdminPayload => {
    const req = ctx.switchToHttp().getRequest()

    if (typeof req.user?.storeId !== 'number')
      throw new AppError(
        ErrorCode.NOT_ENOUGH_PERMISSIONS,
        'Missing storeId: user is not assigned to any store',
      )
    if (req.user?.isBannedFromStore)
      throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'You are banned from this store')

    return req.user
  },
)
