import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'

export const imageUploadOptions: MulterOptions = {
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
      return cb(new Error('Only image files are allowed'), false)
    }
    cb(null, true)
  },
}
