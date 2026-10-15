import {
  applyDecorators,
  UseInterceptors,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { tap, catchError, timeout } from 'rxjs/operators';

export type CustomFileTypeForS3 = Express.MulterS3.File;

// ✅ Lazy singleton — created on first request, not at module parse time
let s3Instance: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Instance) {
    s3Instance = new S3Client({
      region: process.env.AWS_REGION,
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
          s3: getS3Client(),
          bucket: process.env.AWS_S3_BUCKET_NAME,
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

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    const request = context.switchToHttp().getRequest();
    console.log('req.ip...', request.ip);
    const now = Date.now();
    return next
      .handle()
      .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}
