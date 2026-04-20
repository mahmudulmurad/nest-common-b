// product.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
  Req,
  HttpStatus,
  UploadedFile,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from '../../entities';
import { CreateProductDto } from '../../dto/create-product.dot';
import { AuthGuard } from '../../auth';
import { UpdateProductDto } from '../../dto/update-product.dto';
import { CustomRequest } from '../../interface/customRequest.interface';
import { ResponseService } from 'src/service/response.service';
import { ResponseDto } from 'src/dto/response/response.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  UploadFileInterceptorMemory,
  UploadFileInterceptorS3,
} from 'src/custom-interceptor/fileUpload.interceptor';
import { CustomFileTypeForS3 } from 'src/interface/customFileTypeForS3';

@ApiTags('PRODUCT')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly responseService: ResponseService,
  ) {}

  @Get('all-product')
  async getAllProducts(): Promise<ResponseDto> {
    const productsDto = await this.productService.findAll();
    return this.responseService.toDtosResponse(
      HttpStatus.OK,
      'List of all products',
      productsDto,
    );
  }

  @Get('current-user/all-product')
  async getAllProductsOfUser(
    @Req() request: CustomRequest,
  ): Promise<Product[]> {
    const userId = request.user?.id;
    return this.productService.findAllProductsOfUser(userId);
  }

  //for storing file in running server
  // @Post('create-product')
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({ type: CreateProductDto })
  // @UploadFileInterceptorMemory('product_image')
  // async createProduct(
  //   @Req() request: CustomRequest,
  //   @Body() product: CreateProductDto,
  //   @UploadedFile()
  //   product_image: Express.Multer.File,
  // ): Promise<ResponseDto> {
  //   const userId = request.user?.id;
  //   const newProduct = this.productService.create(
  //     product,
  //     userId,
  //     product_image,
  //   );
  //   return this.responseService.toDtoResponse(
  //     HttpStatus.CREATED,
  //     'Product Creation successful',
  //     newProduct,
  //   );
  // }

  // @Patch('update/:id')
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({ type: UpdateProductDto })
  // @UploadFileInterceptorMemory('product_image')
  // async updateProduct(
  //   @Param('id') id: string,
  //   @Body() updateProductDto: UpdateProductDto,
  //   @UploadedFile()
  //   product_image: Express.Multer.File,
  // ): Promise<Product> {
  //   return this.productService.updateProduct(
  //     id,
  //     updateProductDto,
  //     product_image,
  //   );
  // }

  //for storing file in aws-s3
  @Post('create-product')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductDto })
  @UploadFileInterceptorS3('product_image', 'products')
  async createProduct(
    @Req() request: CustomRequest,
    @Body() product: CreateProductDto,
    @UploadedFile()
    product_image: CustomFileTypeForS3,
  ): Promise<ResponseDto> {
    const userId = request.user?.id;
    const newProduct = this.productService.create(
      product,
      userId,
      product_image,
    );
    return this.responseService.toDtoResponse(
      HttpStatus.CREATED,
      'Product Creation successful',
      newProduct,
    );
  }

  @Patch('update/:id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProductDto })
  @UploadFileInterceptorS3('product_image', 'products')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile()
    product_image: CustomFileTypeForS3,
  ): Promise<Product> {
    return this.productService.updateProduct(
      id,
      updateProductDto,
      product_image,
    );
  }

  @Delete('delete/:id')
  async deleteProduct(@Param('id') id: string): Promise<string> {
    return await this.productService.remove(id);
  }

  @Delete('batch-delete')
  async batchDeleteProducts(@Body() data: { ids: string[] }): Promise<string> {
    const arrayOfId = data?.ids;
    return await this.productService.deleteProducts(arrayOfId);
  }
}
