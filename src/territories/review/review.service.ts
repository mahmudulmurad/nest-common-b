import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Product, ProductReview, User } from '../../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ClientProxy } from '@nestjs/microservices';
import { ReviewDto } from 'src/dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ProductReview)
    private readonly reviewRepository: Repository<ProductReview>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject('LOGGER_SERVICE') private loggerService: ClientProxy,
  ) {}

  async allReviews(productId: string): Promise<ProductReview[]> {
    const reviews = await this.reviewRepository.find({
      where: { productId },
      relations: ['user', 'product'],
    });
    if (reviews.length === 0) {
      throw new NotFoundException('no reviews found');
    }
    return reviews;
  }

  async createReview(
    userId: string,
    productId: string,
    reviewDto: ReviewDto,
  ): Promise<ProductReview> {
    const [user, product] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.productRepository.findOne({ where: { id: productId } }),
    ]);

    if (!user || !product) {
      throw new NotFoundException(
        !user ? 'User not found' : 'Product not found',
      );
    }

    const review = this.reviewRepository.create({
      id: uuidv4(),
      content: reviewDto.content,
      user,
      product,
    });

    return this.reviewRepository.save(review);
  }
}
