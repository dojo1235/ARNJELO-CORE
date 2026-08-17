import { timingSafeEqual, randomBytes, scrypt as _scrypt } from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(_scrypt)

/**
 * Hash plain strings
 */
export const hash = async (value: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(value, salt, 64)) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

/**
 * Compare hashed strings
 */
export const compare = async (value: string, hash: string): Promise<boolean> => {
  const [salt, storedKey] = hash.split(':')
  const derivedKey = (await scrypt(value, salt, 64)) as Buffer
  const storedKeyBuffer = Buffer.from(storedKey, 'hex')
  return timingSafeEqual(derivedKey, storedKeyBuffer)
}
