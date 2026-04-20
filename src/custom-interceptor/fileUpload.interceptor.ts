import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import * as multerS3 from 'multer-s3';

export type CustomFileTypeForS3 = Express.MulterS3.File;

// ✅ Lazy singleton — created on first request, not at module parse time
let s3Instance: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Instance) {
    s3Instance = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_KEY!,
      },
    });
  }
  return s3Instance;
}

export function UploadFileInterceptorMemory(fieldName: string) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: memoryStorage(),
      }),
    ),
  );
}

export function UploadFileInterceptorS3(
  fieldName: string,
  folder: 'users' | 'products',
) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: multerS3({
          s3: getS3Client(), // ✅ lazy
          bucket: process.env.AWS_S3_BUCKET_NAME!, // ✅ read here, not top-level
          contentType: multerS3.AUTO_CONTENT_TYPE,
          key(req, file, cb) {
            const sanitized = file.originalname
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9.\-_]/g, '');
            cb(null, `${folder}/${Date.now()}-${sanitized}`);
          },
        }),
      }),
    ),
  );
}
