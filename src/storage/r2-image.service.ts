import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuid } from 'uuid'

@Injectable()
export class R2ImageService {
  private client: S3Client
  private bucket: string
  private publicUrl: string

  constructor(private readonly configService: ConfigService) {
    const { endpoint, accessKey, secretKey, bucket, publicUrl } = this.configService.get('r2')
    this.bucket = bucket
    this.publicUrl = publicUrl
    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    })
  }

  async upload(file: Express.Multer.File, folder = 'uploads') {
    const key = `${folder}/${uuid()}-${file.originalname}`
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )
    return {
      key,
      url: `${this.publicUrl}/${key}`,
    }
  }

  async delete(key: string) {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    )
  }
}
