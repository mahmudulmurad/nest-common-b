import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsBoolean } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsString()
  productName: string;

  @ApiPropertyOptional()
  @IsNumber()
  categoryId: number;

  @ApiPropertyOptional()
  @IsString()
  categoryName: string;

  @ApiPropertyOptional()
  @IsNumber()
  price: number;

  @ApiPropertyOptional()
  @IsBoolean()
  status: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
  })
  product_image: Express.Multer.File;
}
