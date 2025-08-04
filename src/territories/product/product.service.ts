import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, User } from '../../entities';
import { CreateProductDto } from '../../dto/create-product.dot';
import { v4 as uuidv4 } from 'uuid';
import { UpdateProductDto } from 'src/dto/update-product.dto';
import { saveFileToDisk } from 'src/utils/file-upload';
import { deleteFileFromDisk } from 'src/utils/delete-file';
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Product[]> {
    const products = await this.productRepository.find();
    if (products.length === 0) {
      throw new NotFoundException('no products found');
    }
    return products;
  }

  async findAllProductsOfUser(userId: string): Promise<Product[]> {
    const products = await this.productRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (products.length === 0) {
      throw new NotFoundException('no products found');
    }
    return products;
  }

  async create(
    productDto: CreateProductDto,
    userId: string,
    product_image: Express.Multer.File,
  ): Promise<Product> {
    const { productName } = productDto;
    const isExist = await this.productRepository.findOne({
      where: { productName },
    });
    if (isExist) {
      throw new ConflictException(
        'product already taken. Please choose a different product name.',
      );
    }
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const product = this.productRepository.create({ ...productDto, user });
    product.id = uuidv4();

    if (product_image) {
      const productImagePath = saveFileToDisk(
        product_image,
        'product',
        'product',
      );
      product.productImage = productImagePath;
    }

    return await this.productRepository.save(product);
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    product_image: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException('product not found!!');
    }
    const updatedProduct = Object.assign(product, updateProductDto);
    if (product_image) {
      const fileDeleteStatus = deleteFileFromDisk(product.productImage);

      if (!fileDeleteStatus.success) {
        console.warn('Image deletion failed:', fileDeleteStatus.message);
      } else {
        console.log('Image removed:', fileDeleteStatus.path);
        const productImagePath = saveFileToDisk(
          product_image,
          'product',
          'product',
        );
        updatedProduct.productImage = productImagePath;
      }
    }

    return this.productRepository.save(updatedProduct);
  }

  async remove(id: string): Promise<string> {
    const isExist = await this.productRepository.findOne({
      where: { id },
    });
    if (!isExist) {
      throw new ConflictException('product does not exist.');
    }
    await this.productRepository.delete(id);
    return 'Product has been deleted';
  }

  async deleteProducts(ids: string[]): Promise<string> {
    const result = await this.productRepository
      .createQueryBuilder()
      .delete()
      .from(Product)
      .where('id IN (:...ids)', { ids })
      .execute();

    if (result.affected > 0) {
      if (result.affected === ids.length) {
        return 'Selected products have been deleted';
      } else {
        return `Some products have been deleted, but not all. (${result.affected} out of ${ids.length} deleted)`;
      }
    } else {
      throw new NotFoundException('No products found with the provided IDs');
    }
  }
}
