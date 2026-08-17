import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { plural } from 'pluralize'

export class NamingStrategy extends SnakeNamingStrategy {
  public override tableName(className: string, customName: string): string {
    return customName || super.tableName(plural(className), customName)
  }
}
