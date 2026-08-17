import { z } from 'zod'

const envSchema = z.object({
  PORT: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACTION_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),
  JWT_ACTION_EXPIRES_IN: z.string(),
  FLUTTERWAVE_SECRET_KEY: z.string(),
  FLUTTERWAVE_PUBLIC_KEY: z.string(),
  FLUTTERWAVE_WEBHOOK_SECRET: z.string(),
  R2_ENDPOINT: z.string(),
  R2_ACCESS_KEY: z.string(),
  R2_SECRET_KEY: z.string(),
  R2_BUCKET: z.string(),
  R2_PUBLIC_URL: z.string(),
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string(),
  CLIENT_URL: z.string(),
})

export default () => {
  const parsedEnv = envSchema.parse(process.env)
  return {
    port: Number(parsedEnv.PORT),
    database: {
      host: parsedEnv.DB_HOST,
      port: Number(parsedEnv.DB_PORT),
      username: parsedEnv.DB_USER,
      password: parsedEnv.DB_PASS,
      name: parsedEnv.DB_NAME,
    },
    jwt: {
      accessSecret: parsedEnv.JWT_ACCESS_SECRET,
      refreshSecret: parsedEnv.JWT_REFRESH_SECRET,
      actionSecret: parsedEnv.JWT_ACTION_SECRET,
      accessExpiresIn: parsedEnv.JWT_ACCESS_EXPIRES_IN,
      refreshExpiresIn: parsedEnv.JWT_REFRESH_EXPIRES_IN,
      actionExpiresIn: parsedEnv.JWT_ACTION_EXPIRES_IN,
    },
    payment: {
      flutterwaveSecretKey: parsedEnv.FLUTTERWAVE_SECRET_KEY,
      flutterwavePublicKey: parsedEnv.FLUTTERWAVE_PUBLIC_KEY,
      flutterwaveWebhookSecret: parsedEnv.FLUTTERWAVE_WEBHOOK_SECRET,
    },
    r2: {
      endpoint: parsedEnv.R2_ENDPOINT,
      accessKey: parsedEnv.R2_ACCESS_KEY,
      secretKey: parsedEnv.R2_SECRET_KEY,
      bucket: parsedEnv.R2_BUCKET,
      publicUrl: parsedEnv.R2_PUBLIC_URL,
    },
    email: {
      resendApiKey: parsedEnv.RESEND_API_KEY,
      emailFrom: parsedEnv.EMAIL_FROM,
    },
    urls: {
      clientUrl: parsedEnv.CLIENT_URL,
    },
  }
}
