import {
  IsString,
  IsOptional,
  Matches,
  MaxLength,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserUpdateDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
  })
  profile_picture: Express.Multer.File;

  @ApiPropertyOptional()
  @IsNumber()
  version: number;
}
