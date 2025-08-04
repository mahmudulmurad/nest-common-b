// create-product.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  categoryName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  status: boolean;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
  })
  product_image: Express.Multer.File;
}
