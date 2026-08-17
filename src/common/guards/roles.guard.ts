import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from 'src/users/entities/user.entity'
import { AppError, ErrorCode } from '../exceptions/app-error'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.getAllAndOverride<Role>('roles', [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRole) return true

    const request = context.switchToHttp().getRequest<{ user: { role: Role } }>()
    const user = request.user
    if (!user) throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'User not authenticated')

    if (user.role === Role.SuperAdmin) return true

    const allowedRoles = this.RoleHierarchy[user.role] ?? []

    if (!allowedRoles.includes(requiredRole)) {
      throw new AppError(ErrorCode.NOT_ENOUGH_PERMISSIONS, 'Access denied!! Route forbidden')
    }

    return true
  }

  private readonly RoleHierarchy: Record<Exclude<Role, Role.SuperAdmin>, Role[]> = {
    [Role.StoreOwner]: [
      Role.StoreOwner,
      Role.GeneralAdmin,
      Role.ProductManager,
      Role.OrderManager,
      Role.UserManager,
      Role.ViewOnlyAdmin,
    ],
    [Role.GeneralAdmin]: [
      Role.GeneralAdmin,
      Role.ProductManager,
      Role.OrderManager,
      Role.UserManager,
      Role.ViewOnlyAdmin,
    ],
    [Role.ProductManager]: [Role.ProductManager, Role.ViewOnlyAdmin],
    [Role.OrderManager]: [Role.OrderManager, Role.ViewOnlyAdmin],
    [Role.UserManager]: [Role.UserManager, Role.ViewOnlyAdmin],
    [Role.ViewOnlyAdmin]: [Role.ViewOnlyAdmin],
    [Role.User]: [],
  }
}
